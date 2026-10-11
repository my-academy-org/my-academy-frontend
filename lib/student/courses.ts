import { COURSE_TINTS, fetchCourses, fetchLessons, minutesOf, type Course, type LessonSummary } from "@/lib/academy/courses";
import { fetchEnrollments } from "@/lib/academy/enrollments";
import type { LearnCourse } from "./types";

/**
 * The signed-in student's courses (docs/courses-lessons-api.md §6,
 * docs/enrollments-api.md §5): the API returns the academy's published
 * courses and lessons, each lesson flagged `enrolled` when the student has
 * activated its course, and the student's own enrollments.
 */

export type StudentCourses = { ok: true; courses: LearnCourse[]; available: LearnCourse[] } | { ok: false; message: string };

function toLearnCourse(course: Course, lessons: LessonSummary[], instructor: string, enrolledAt?: string): LearnCourse {
  return {
    id: String(course.id),
    title: course.title,
    description: course.description ?? "",
    thumbnailUrl: course.imageUrl ?? undefined,
    tint: COURSE_TINTS[course.id % COURSE_TINTS.length],
    instructor,
    // Only used to order untouched courses.
    enrolledAt: enrolledAt ?? course.createdAt,
    // Text and video come with GET /lessons/:id, when the lesson is opened.
    lessons: lessons.map((l) => ({
      id: String(l.id),
      title: l.title,
      description: l.description ?? "",
      content: "",
      durationMinutes: minutesOf(l.duration),
      attachments: [],
    })),
  };
}

/**
 * GET /courses + GET /lessons + GET /enrollments?status=ACTIVE, split into the
 * student's own courses and the ones still locked. A course is theirs with an
 * active enrollment, or when its lessons come back `enrolled` (which also
 * covers a completed one, and a failed enrollments call).
 */
export async function fetchStudentCourses(token: string, instructor: string): Promise<StudentCourses> {
  const [courses, lessons, enrollments] = await Promise.all([fetchCourses(token), fetchLessons(token), fetchEnrollments(token, "ACTIVE")]);
  if (!courses.ok) return { ok: false, message: courses.message };
  if (!lessons.ok) return { ok: false, message: lessons.message };
  const enrolledAt = new Map((enrollments.ok ? enrollments.data : []).map((e) => [e.course.id, e.enrolledAt]));

  const mine: LearnCourse[] = [];
  const available: LearnCourse[] = [];
  for (const course of courses.data) {
    // Already in course order (`order`, then id).
    const own = lessons.data.filter((l) => l.courseId === course.id);
    const enrolled = enrolledAt.has(course.id) || own.some((l) => l.enrolled);
    (enrolled ? mine : available).push(toLearnCourse(course, own, instructor, enrolledAt.get(course.id)));
  }
  return { ok: true, courses: mine, available };
}
