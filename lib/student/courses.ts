import { COURSE_TINTS, fetchCourses, fetchLessons, minutesOf, type Course, type LessonSummary } from "@/lib/academy/courses";
import type { LearnCourse } from "./types";

/**
 * The signed-in student's courses (docs/courses-lessons-api.md §6): the API
 * returns the academy's published courses and lessons, each lesson flagged
 * `enrolled` when the student has activated its course.
 */

export type StudentCourses = { ok: true; courses: LearnCourse[]; available: LearnCourse[] } | { ok: false; message: string };

function toLearnCourse(course: Course, lessons: LessonSummary[], instructor: string): LearnCourse {
  return {
    id: String(course.id),
    title: course.title,
    description: course.description ?? "",
    thumbnailUrl: course.imageUrl ?? undefined,
    tint: COURSE_TINTS[course.id % COURSE_TINTS.length],
    instructor,
    // The API doesn't say when the student joined; only used to order untouched courses.
    enrolledAt: course.createdAt,
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

/** GET /courses + GET /lessons, split into the student's own courses and the ones still locked. */
export async function fetchStudentCourses(token: string, instructor: string): Promise<StudentCourses> {
  const [courses, lessons] = await Promise.all([fetchCourses(token), fetchLessons(token)]);
  if (!courses.ok) return { ok: false, message: courses.message };
  if (!lessons.ok) return { ok: false, message: lessons.message };

  const mine: LearnCourse[] = [];
  const available: LearnCourse[] = [];
  for (const course of courses.data) {
    // Already in course order (`order`, then id).
    const own = lessons.data.filter((l) => l.courseId === course.id);
    // Enrollment is only reported per lesson, so a course without lessons counts as locked.
    (own.some((l) => l.enrolled) ? mine : available).push(toLearnCourse(course, own, instructor));
  }
  return { ok: true, courses: mine, available };
}
