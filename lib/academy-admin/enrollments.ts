import { fetchEnrollmentCodes, fetchEnrollments, type Enrollment as ApiEnrollment, type EnrollmentCode as ApiEnrollmentCode } from "@/lib/academy/enrollments";
import type { DashStudent, Enrollment, EnrollmentCode } from "./types";

/**
 * The owner's enrollment codes and enrollments as the dashboard screens know
 * them (docs/enrollments-api.md). What the API has no place for yet — code
 * batches and expiry, a student's phone and lesson progress — stays empty.
 */

/** The API's `AVAILABLE` is the screens' `UNUSED`. */
export const toDashCode = (c: ApiEnrollmentCode): EnrollmentCode => ({
  id: String(c.id),
  code: c.code,
  courseId: String(c.course.id),
  status: c.status === "AVAILABLE" ? "UNUSED" : c.status,
  batchId: "",
  createdAt: c.createdAt,
  usedByStudentId: c.student ? String(c.student.id) : undefined,
  usedByName: c.student?.name,
  usedAt: c.usedAt ?? undefined,
});

export const toDashEnrollment = (e: ApiEnrollment): Enrollment => ({
  enrollmentId: String(e.id),
  courseId: String(e.course.id),
  enrolledAt: e.enrolledAt,
  code: e.enrollmentCode?.code,
  completedLessonIds: [],
});

/**
 * The academy's students, as far as its enrollments name them: there is no
 * list of registered students yet, so one who never enrolled doesn't appear.
 * A cancelled enrollment keeps the student known (and free to enroll again)
 * without counting as one of their courses.
 */
export function toDashStudents(enrollments: ApiEnrollment[]): DashStudent[] {
  const students = new Map<number, DashStudent>();
  for (const e of enrollments) {
    let student = students.get(e.student.id);
    if (!student) {
      student = { id: String(e.student.id), name: e.student.name, email: e.student.email, status: "ACTIVE", registeredAt: e.enrolledAt, enrollments: [] };
      students.set(e.student.id, student);
    }
    // The closest the API gives to a registration date: the student's first enrollment.
    if (e.enrolledAt < student.registeredAt) student.registeredAt = e.enrolledAt;
    if (e.status !== "CANCELLED") student.enrollments.push(toDashEnrollment(e));
  }
  return [...students.values()];
}

export type DashboardEnrollments = { ok: true; codes: EnrollmentCode[]; students: DashStudent[] } | { ok: false; message: string };

/** GET /enrollment-codes + GET /enrollments — everything in the owner's academy. */
export async function fetchDashboardEnrollments(token: string): Promise<DashboardEnrollments> {
  const [codes, enrollments] = await Promise.all([fetchEnrollmentCodes(token), fetchEnrollments(token)]);
  if (!codes.ok) return { ok: false, message: codes.message };
  if (!enrollments.ok) return { ok: false, message: enrollments.message };
  return { ok: true, codes: codes.data.map(toDashCode), students: toDashStudents(enrollments.data) };
}
