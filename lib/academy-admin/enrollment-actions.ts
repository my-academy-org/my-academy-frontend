"use server";

import { apiId, coursesRequest, sessionExpired, type ApiFailure, type ApiResult } from "@/lib/academy/courses";
import type { CreatedEnrollmentCodes, Enrollment as ApiEnrollment, EnrollmentCode as ApiEnrollmentCode } from "@/lib/academy/enrollments";
import { getAccessToken, getSession } from "@/lib/auth/server";
import { toDashCode, toDashEnrollment } from "./enrollments";
import type { Enrollment, EnrollmentCode } from "./types";

/**
 * Enrollment codes and enrollments from the owner dashboard
 * (docs/enrollments-api.md §3–4). The academy comes from the course on the
 * API side, so no `tenantId` is ever sent.
 */

const notFound = { ok: false, status: 404, message: "العنصر غير موجود. ربما حُذف.", raw: "" } as const;

async function ownerToken() {
  const session = await getSession();
  return session?.role === "ACADEMY_ADMIN" ? await getAccessToken() : undefined;
}

export type CreatedCodes = {
  codes: EnrollmentCode[];
  /** Every code of the academy after this batch, and the plan's ceiling. */
  existingCount: number;
  limit: number;
};

/**
 * POST /enrollment-codes — up to 50 codes for one course (a draft included).
 * 403 when the batch would pass the plan's ceiling: nothing is created then, not even the part that fits.
 */
export async function createCodesAction(courseId: string, count: number): Promise<ApiResult<CreatedCodes>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const course = apiId(courseId);
  if (!course) return notFound;
  const res = await coursesRequest<CreatedEnrollmentCodes>(token, "/enrollment-codes", { method: "POST", body: { courseId: course, count } });
  if (!res.ok) return res;
  return { ok: true, data: { codes: res.data.enrollmentCodes.map(toDashCode), existingCount: res.data.existingCount, limit: res.data.limit } };
}

/** What a change to several codes came to: the ones it reached, and why the first of the others was refused. */
export type CodesOutcome<T> = { done: T[]; failure?: ApiFailure };

async function each<T>(ids: string[], run: (token: string, id: number) => Promise<ApiResult<T>>): Promise<ApiResult<CodesOutcome<T>>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const results = await Promise.all(
    ids.map((id): Promise<ApiResult<T>> => {
      const codeId = apiId(id);
      return codeId ? run(token, codeId) : Promise.resolve(notFound);
    }),
  );
  return { ok: true, data: { done: results.flatMap((r) => (r.ok ? [r.data] : [])), failure: results.find((r) => !r.ok) as ApiFailure | undefined } };
}

/** PATCH /enrollment-codes/:id — disable a lost or leaked code, or make it available again. 409 once it is used. */
export async function setCodesStatusAction(ids: string[], status: "AVAILABLE" | "DISABLED"): Promise<ApiResult<CodesOutcome<EnrollmentCode>>> {
  return each(ids, async (token, id) => {
    const res = await coursesRequest<{ enrollmentCode: ApiEnrollmentCode }>(token, `/enrollment-codes/${id}`, { method: "PATCH", body: { status } });
    return res.ok ? { ok: true, data: toDashCode(res.data.enrollmentCode) } : res;
  });
}

/** DELETE /enrollment-codes/:id — frees the code's place in the plan's ceiling. 409 once it is used: that one stays as a record. */
export async function deleteCodesAction(ids: string[]): Promise<ApiResult<CodesOutcome<string>>> {
  return each(ids, async (token, id) => {
    const res = await coursesRequest(token, `/enrollment-codes/${id}`, { method: "DELETE" });
    return res.ok ? { ok: true, data: String(id) } : res;
  });
}

/**
 * POST /enrollments — the teacher enrolls a student of the academy directly: no code is used and the
 * plan's ceiling isn't touched. A cancelled enrollment is reactivated; 409 when the student is already in.
 */
export async function enrollStudentAction(studentId: string, courseId: string): Promise<ApiResult<Enrollment>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const student = apiId(studentId);
  const course = apiId(courseId);
  if (!student || !course) return notFound;
  const res = await coursesRequest<{ enrollment: ApiEnrollment }>(token, "/enrollments", { method: "POST", body: { studentId: student, courseId: course } });
  return res.ok ? { ok: true, data: toDashEnrollment(res.data.enrollment) } : res;
}

/**
 * PATCH /enrollments/:id with `CANCELLED` — locks the course's lessons for the student, who can come back
 * with a new code or be enrolled again. Used instead of DELETE, which removes the enrollment for good.
 */
export async function cancelEnrollmentAction(enrollmentId: string): Promise<ApiResult<null>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const id = apiId(enrollmentId);
  if (!id) return notFound;
  const res = await coursesRequest(token, `/enrollments/${id}`, { method: "PATCH", body: { status: "CANCELLED" } });
  return res.ok ? { ok: true, data: null } : res;
}
