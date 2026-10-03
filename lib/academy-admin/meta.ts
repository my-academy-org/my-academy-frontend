import type { PillTone } from "@/components/dashboard/ui";
import type { CodeStatus, CourseStatus, Exam, StudentStatus } from "./types";

/** Academy owner dashboard routes on the main platform domain. The academy comes from the session, never the URL. */
export const dash = {
  home: "/dashboard",
  courses: "/dashboard/courses",
  newCourse: "/dashboard/courses/new",
  course: (id: string) => `/dashboard/courses/${id}`,
  editCourse: (id: string) => `/dashboard/courses/${id}/edit`,
  lessons: (courseId?: string) => (courseId ? `/dashboard/lessons?course=${courseId}` : "/dashboard/lessons"),
  students: "/dashboard/students",
  student: (id: string) => `/dashboard/students/${id}`,
  codes: "/dashboard/codes",
  exams: "/dashboard/exams",
  newExam: "/dashboard/exams/new",
  exam: (id: string) => `/dashboard/exams/${id}`,
  examResults: (id: string) => `/dashboard/exams/${id}/results`,
  website: "/dashboard/website",
  settings: "/dashboard/settings",
} as const;

export const courseStatus: Record<CourseStatus, { label: string; tone: PillTone }> = {
  PUBLISHED: { label: "منشورة", tone: "success" },
  DRAFT: { label: "مسودة", tone: "neutral" },
};

export const studentStatus: Record<StudentStatus, { label: string; tone: PillTone }> = {
  ACTIVE: { label: "نشط", tone: "success" },
  SUSPENDED: { label: "موقوف", tone: "danger" },
};

export const codeStatus: Record<CodeStatus, { label: string; tone: PillTone }> = {
  UNUSED: { label: "متاح", tone: "success" },
  USED: { label: "مستخدم", tone: "neutral" },
  DISABLED: { label: "معطّل", tone: "danger" },
};

export type ExamState = "DRAFT" | "SCHEDULED" | "OPEN" | "CLOSED";

export const examState: Record<ExamState, { label: string; tone: PillTone }> = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  SCHEDULED: { label: "مجدول", tone: "info" },
  OPEN: { label: "متاح للطلاب", tone: "success" },
  CLOSED: { label: "مغلق", tone: "warning" },
};

/** What students currently see: a published exam with a future start date is "scheduled". */
export function stateOf(exam: Exam, now = Date.now()): ExamState {
  if (exam.status === "DRAFT") return "DRAFT";
  if (exam.status === "CLOSED") return "CLOSED";
  return exam.opensAt && Date.parse(exam.opensAt) > now ? "SCHEDULED" : "OPEN";
}

export const totalPoints = (exam: Exam) => exam.questions.reduce((sum, q) => sum + q.points, 0);

/** Arabic count agreement for "طالب". */
export function formatStudents(n: number) {
  if (n === 0) return "لا يوجد طلاب";
  if (n === 1) return "طالب واحد";
  if (n === 2) return "طالبان";
  if (n <= 10) return `${n} طلاب`;
  return `${n} طالباً`;
}

export function formatCodes(n: number) {
  if (n === 1) return "كود واحد";
  if (n === 2) return "كودان";
  if (n <= 10) return `${n} أكواد`;
  return `${n} كوداً`;
}

export function formatQuestions(n: number) {
  if (n === 0) return "بدون أسئلة";
  if (n === 1) return "سؤال واحد";
  if (n === 2) return "سؤالان";
  if (n <= 10) return `${n} أسئلة`;
  return `${n} سؤالاً`;
}

/** Score of one submission against the exam's current answer key. */
export function scoreOf(exam: Exam, answers: Record<string, string>) {
  const total = totalPoints(exam);
  const score = exam.questions.reduce((sum, q) => sum + (answers[q.id] === q.correctChoiceId ? q.points : 0), 0);
  const percent = total ? Math.round((score / total) * 100) : 0;
  return { score, total, percent, passed: percent >= exam.passingScore };
}
