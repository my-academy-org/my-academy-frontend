import { COURSE_TINTS, fetchCourses, fetchLessons, minutesOf, type Course, type LessonDetail, type LessonSummary } from "@/lib/academy/courses";
import type { DashCourse, DashLesson } from "./types";

/**
 * The owner's courses and lessons as the dashboard screens know them
 * (docs/courses-lessons-api.md). Fields the API has no place for yet — a
 * course's long-form content, lesson attachments and free previews — stay empty.
 */

export const toDashCourse = (c: Course): DashCourse => ({
  id: String(c.id),
  slug: String(c.id),
  title: c.title,
  description: c.description ?? "",
  content: "",
  thumbnailUrl: c.imageUrl ?? undefined,
  tint: COURSE_TINTS[c.id % COURSE_TINTS.length],
  status: c.status,
  createdAt: c.createdAt,
});

/** `order` is the API's own value here; the store turns it into a 1-based position. */
export const toDashLesson = (l: LessonSummary | LessonDetail): DashLesson => ({
  id: String(l.id),
  courseId: String(l.courseId),
  title: l.title,
  description: l.description ?? "",
  content: "content" in l ? (l.content ?? "") : "",
  attachments: [],
  durationMinutes: minutesOf(l.duration),
  order: l.order,
  isPreview: false,
  status: l.status,
  savedOrder: l.order,
});

/** Numbers each course's lessons 1…n in the API's order (`order`, then id). */
function positioned(lessons: LessonSummary[]): DashLesson[] {
  const next = new Map<number, number>();
  return [...lessons]
    .sort((a, b) => a.courseId - b.courseId || a.order - b.order || a.id - b.id)
    .map((l) => {
      const position = (next.get(l.courseId) ?? 0) + 1;
      next.set(l.courseId, position);
      return { ...toDashLesson(l), order: position };
    });
}

export type DashboardContent = { ok: true; courses: DashCourse[]; lessons: DashLesson[] } | { ok: false; message: string };

/** GET /courses + GET /lessons — everything in the owner's academy, whatever its status. */
export async function fetchDashboardContent(token: string): Promise<DashboardContent> {
  const [courses, lessons] = await Promise.all([fetchCourses(token), fetchLessons(token)]);
  if (!courses.ok) return { ok: false, message: courses.message };
  if (!lessons.ok) return { ok: false, message: lessons.message };
  return { ok: true, courses: courses.data.map(toDashCourse), lessons: positioned(lessons.data) };
}
