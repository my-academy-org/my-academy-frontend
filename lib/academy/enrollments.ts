import { listAll } from "./courses";

/**
 * Enrollment codes & enrollments API (docs/enrollments-api.md), called from
 * the server like the courses API (./courses.ts). A student enrolls in a
 * course — with a code the teacher handed out, or by the teacher directly —
 * and the enrollment opens all of its lessons.
 */

/** `USED` is final: a code never becomes available again, even if its enrollment is cancelled or deleted. */
export type EnrollmentCodeStatus = "AVAILABLE" | "USED" | "DISABLED";
/** `CANCELLED` locks the lessons; the same enrollment is reactivated when the student enrolls again. */
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface EnrollmentCode {
  id: number;
  tenantId: number;
  /** 10 characters: capital letters and digits, without the look-alikes 0 O 1 I L. */
  code: string;
  status: EnrollmentCodeStatus;
  usedAt: string | null;
  createdAt: string;
  course: { id: number; title: string };
  /** Null until the code is used. */
  student: { id: number; name: string; email: string } | null;
}

export interface CreatedEnrollmentCodes {
  message: string;
  /** Only the codes of this request. */
  enrollmentCodes: EnrollmentCode[];
  /** Every code of the academy after the request, whatever its status. */
  existingCount: number;
  remaining: number;
  /** The plan's ceiling: 100 on BASIC, 1000 on PRO. */
  limit: number;
}

export interface Enrollment {
  id: number;
  tenantId: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  course: { id: number; title: string; imageUrl: string | null };
  student: { id: number; name: string; email: string };
  /** Null when the teacher enrolled the student by hand. */
  enrollmentCode: { id: number; code: string } | null;
}

/** Codes per POST /enrollment-codes; more takes more than one request. */
export const MAX_CODES_PER_REQUEST = 50;

/** GET /enrollment-codes — newest first. Teachers only. */
export const fetchEnrollmentCodes = (token: string) => listAll<EnrollmentCode>(token, "/enrollment-codes");

/** GET /enrollments — newest first: the whole academy's for its teacher, their own for a student. */
export const fetchEnrollments = (token: string, status?: EnrollmentStatus) => listAll<Enrollment>(token, "/enrollments", { status });
