/**
 * Academy Admin data model — everything one ACADEMY_ADMIN (the teacher who owns
 * the academy) manages. Every record belongs to exactly one academy; the API
 * scopes all reads and writes to the signed-in owner's academy.
 */

import type { Plan, TemplateId } from "@/lib/academy/types";

export type { Plan };

/** `ARCHIVED` only comes from the API: hidden from students, kept for its history. */
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LessonStatus = CourseStatus;

export interface DashCourse {
  id: string;
  slug: string;
  title: string;
  /** Short summary shown on course cards. */
  description: string;
  /** Long-form content shown on the course page (outcomes, requirements…). */
  content: string;
  thumbnailUrl?: string;
  /** Fallback thumbnail colour when no image is uploaded. */
  tint: string;
  status: CourseStatus;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  sizeKb: number;
}

export interface DashLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  attachments: Attachment[];
  durationMinutes: number;
  /** 1-based position inside the course. */
  order: number;
  /** Visible before enrollment on the public course page. */
  isPreview: boolean;
  /** Students see a lesson only when it and its course are both published. */
  status: LessonStatus;
  /** With a backend: the `order` last saved on the server, so a reorder only sends what changed. */
  savedOrder?: number;
}

export type StudentStatus = "ACTIVE" | "SUSPENDED";

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
  /** Code used to unlock the course, if any. */
  code?: string;
  completedLessonIds: string[];
}

export interface DashStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: StudentStatus;
  registeredAt: string;
  lastActiveAt?: string;
  enrollments: Enrollment[];
}

export type CodeStatus = "UNUSED" | "USED" | "DISABLED";

export interface EnrollmentCode {
  id: string;
  code: string;
  courseId: string;
  status: CodeStatus;
  /** Codes generated together share a batch. */
  batchId: string;
  createdAt: string;
  expiresAt?: string;
  usedByStudentId?: string;
  usedAt?: string;
}

export type ExamStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
  correctChoiceId: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  durationMinutes: number;
  /** Percentage needed to pass. */
  passingScore: number;
  status: ExamStatus;
  /** When students can start; undefined = immediately on publish. */
  opensAt?: string;
  createdAt: string;
  questions: Question[];
}

export interface Submission {
  id: string;
  examId: string;
  studentId: string;
  submittedAt: string;
  /** Minutes taken. */
  timeTaken: number;
  /** questionId → chosen choiceId */
  answers: Record<string, string>;
}

export interface WebsiteContent {
  logoUrl?: string;
  hero: { eyebrow: string; title: string; description: string };
  about: { title: string; description: string };
  instructor: { name: string; title: string; bio: string; experienceYears?: number };
  contact: { email: string; phone: string; whatsapp: string; address: string; workingHours: string };
  footerTagline: string;
  /** Course ids highlighted on the home page. */
  featuredCourseIds: string[];
}

export interface MediaItem {
  id: string;
  name: string;
  kind: "image" | "video" | "file";
  sizeKb: number;
  uploadedAt: string;
}

export interface AcademyProfile {
  slug: string;
  name: string;
  plan: Plan;
  template: TemplateId;
  brandColor?: string;
  /** Public website origin, e.g. https://ahmed.myacademy.com — set by the server for the signed-in owner. */
  siteUrl?: string;
  owner: { name: string; email: string; phone?: string };
  notifications: { newEnrollment: boolean; examSubmission: boolean; weeklySummary: boolean; productUpdates: boolean };
}

export type DashActivityKind = "enrollment" | "registration" | "submission" | "course" | "lesson" | "codes" | "exam" | "website";

export interface DashActivity {
  id: string;
  kind: DashActivityKind;
  message: string;
  at: string;
}

/** Everything the dashboard needs at load time; serialisable so the server layout can pass it to the client store. */
export interface AcademySeed {
  /** Courses and lessons come from the API and every change to them is saved there (docs/courses-lessons-api.md). */
  live?: boolean;
  /** Why the courses couldn't be loaded from the API. */
  loadError?: string;
  profile: AcademyProfile;
  courses: DashCourse[];
  lessons: DashLesson[];
  students: DashStudent[];
  codes: EnrollmentCode[];
  exams: Exam[];
  submissions: Submission[];
  website: WebsiteContent;
  media: MediaItem[];
  activity: DashActivity[];
}
