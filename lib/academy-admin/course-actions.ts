"use server";

import {
  apiId,
  coursesRequest,
  fetchLesson,
  sessionExpired,
  type ApiResult,
  type Course,
  type CourseStatus,
  type LessonDetail,
  type LessonStatus,
  type Media,
  type UploadUrl,
} from "@/lib/academy/courses";
import { lessonVideoSrc } from "@/lib/academy/video";
import { getAccessToken, getSession } from "@/lib/auth/server";
import { toDashCourse, toDashLesson } from "./courses";
import { dash } from "./meta";
import type { DashCourse, DashLesson } from "./types";

/**
 * Course and lesson mutations from the owner dashboard
 * (docs/courses-lessons-api.md §3–5). The academy always comes from the
 * session on the API side, so no `tenantId` is ever sent.
 */

const notFound = { ok: false, status: 404, message: "العنصر غير موجود. ربما حُذف.", raw: "" } as const;

async function ownerToken() {
  const session = await getSession();
  return session?.role === "ACADEMY_ADMIN" ? await getAccessToken() : undefined;
}

const mapped = <T, R>(res: ApiResult<T>, map: (data: T) => R): ApiResult<R> => (res.ok ? { ok: true, data: map(res.data) } : res);

export type CourseFields = { title: string; description: string; imageUrl?: string; status: CourseStatus };

/** POST /courses when `id` is null, PATCH /courses/:id otherwise. */
export async function saveCourseAction(id: string | null, fields: Partial<CourseFields>): Promise<ApiResult<DashCourse>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const body = { title: fields.title, description: fields.description, imageUrl: fields.imageUrl, status: fields.status };
  if (id === null) return mapped(await coursesRequest<{ course: Course }>(token, "/courses", { method: "POST", body }), (d) => toDashCourse(d.course));

  const courseId = apiId(id);
  if (!courseId) return notFound;
  return mapped(await coursesRequest<{ course: Course }>(token, `/courses/${courseId}`, { method: "PATCH", body }), (d) => toDashCourse(d.course));
}

/** DELETE /courses/:id — 409 while the course still has lessons, exams, enrollments or codes. */
export async function deleteCourseAction(id: string): Promise<ApiResult<null>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const courseId = apiId(id);
  if (!courseId) return notFound;
  return mapped(await coursesRequest(token, `/courses/${courseId}`, { method: "DELETE" }), () => null);
}

export type LessonFields = {
  title: string;
  description: string;
  content: string;
  status: LessonStatus;
  /** The uploaded video (POST /lessons/video); required to create, sent on edit only when replaced. */
  mediaId?: number;
  /** Seconds. */
  duration?: number;
  order?: number;
};

/** POST /lessons when `id` is null, PATCH /lessons/:id otherwise (`courseId` is never sent on an edit). */
export async function saveLessonAction(courseId: string, id: string | null, fields: Partial<LessonFields>): Promise<ApiResult<DashLesson>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const body = {
    title: fields.title,
    description: fields.description,
    content: fields.content,
    status: fields.status,
    mediaId: fields.mediaId,
    duration: fields.duration,
    order: fields.order,
  };
  if (id === null) {
    const course = apiId(courseId);
    if (!course) return notFound;
    const res = await coursesRequest<{ lesson: LessonDetail }>(token, "/lessons", { method: "POST", body: { courseId: course, ...body } });
    return mapped(res, (d) => toDashLesson(d.lesson));
  }

  const lessonId = apiId(id);
  if (!lessonId) return notFound;
  return mapped(await coursesRequest<{ lesson: LessonDetail }>(token, `/lessons/${lessonId}`, { method: "PATCH", body }), (d) => toDashLesson(d.lesson));
}

/** PATCH /lessons/:id for each lesson whose position changed. */
export async function reorderLessonsAction(updates: { id: string; order: number }[]): Promise<ApiResult<null>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const results = await Promise.all(
    updates.map(({ id, order }) => {
      const lessonId = apiId(id);
      return lessonId ? coursesRequest(token, `/lessons/${lessonId}`, { method: "PATCH", body: { order } }) : notFound;
    }),
  );
  const failed = results.find((r) => !r.ok);
  return failed && !failed.ok ? failed : { ok: true, data: null };
}

/** DELETE /lessons/:id — also removes its video; 409 while it has student progress or exams. */
export async function deleteLessonAction(id: string): Promise<ApiResult<null>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const lessonId = apiId(id);
  if (!lessonId) return notFound;
  return mapped(await coursesRequest(token, `/lessons/${lessonId}`, { method: "DELETE" }), () => null);
}

export type LessonForEdit = { content: string; videoUrl: string | null };

/** GET /lessons/:id — what the list leaves out: the text and the address the current video streams from. */
export async function loadLessonAction(id: string): Promise<ApiResult<LessonForEdit>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const lessonId = apiId(id);
  if (!lessonId) return notFound;
  const res = await fetchLesson(token, lessonId);
  if (!res.ok) return res;
  return { ok: true, data: { content: res.data.content ?? "", videoUrl: await lessonVideoSrc(res.data.videoUrl, dash.lessonVideo(id)) } };
}

/** POST /lessons/video/upload-url — a one-hour link the browser PUTs the file to, straight into storage. */
export async function requestVideoUploadAction(courseId: string, fileName: string, contentType: string): Promise<ApiResult<UploadUrl>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  const course = apiId(courseId);
  if (!course) return notFound;
  return coursesRequest<UploadUrl>(token, "/lessons/video/upload-url", { method: "POST", body: { courseId: course, fileName, contentType } });
}

/** POST /lessons/video — confirms the file arrived and returns the `mediaId` a lesson is created with. */
export async function registerVideoAction(key: string, fileName: string, duration?: number): Promise<ApiResult<number>> {
  const token = await ownerToken();
  if (!token) return sessionExpired;
  return mapped(await coursesRequest<{ media: Media }>(token, "/lessons/video", { method: "POST", body: { key, fileName, duration } }), (d) => d.media.id);
}
