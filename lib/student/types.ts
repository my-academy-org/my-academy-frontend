/**
 * Student-side data: only what one STUDENT of one academy may see — their
 * enrolled courses, their progress, the exams of those courses and their own
 * results. The API scopes everything to the signed-in student and the tenant.
 */

import type { Attachment, Exam, Submission } from "@/lib/academy-admin/types";

export type { Attachment, Submission };

export interface StudentAcademy {
  slug: string;
  name: string;
  logoUrl?: string;
  /** Brand colour used to theme the student area. */
  accent: string;
  instructor: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  notifications: { newLessons: boolean; examReminders: boolean; results: boolean };
}

export interface LearnLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  durationMinutes: number;
  attachments: Attachment[];
}

export interface LearnCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  tint: string;
  instructor: string;
  /** In course order. */
  lessons: LearnLesson[];
  enrolledAt: string;
}

export interface CourseProgress {
  completedLessonIds: string[];
  /** The lesson the student last opened. */
  lastLessonId?: string;
  lastAccessedAt?: string;
}

/**
 * Exams of the student's courses. In this demo the answer key travels with the
 * exam so results can be computed in the browser; the real API grades on the
 * server and never sends `correctChoiceId` before submission.
 */
export type StudentExam = Exam;

export interface StudentActivity {
  id: string;
  kind: "lesson" | "exam" | "enrollment";
  message: string;
  at: string;
}

export interface StudentSeed {
  academy: StudentAcademy;
  profile: StudentProfile;
  courses: LearnCourse[];
  progress: Record<string, CourseProgress>;
  exams: StudentExam[];
  attempts: Submission[];
  activity: StudentActivity[];
  /** Demo only: codes this student could redeem (code → course). Redemption is an API call in production. */
  redeemable: Record<string, LearnCourse>;
}
