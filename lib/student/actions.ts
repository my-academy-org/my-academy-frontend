"use server";

import { apiId, coursesRequest, fetchLesson, sessionExpired, type ApiResult } from "@/lib/academy/courses";
import { academyRoutes } from "@/lib/academy/nav";
import { lessonVideoSrc } from "@/lib/academy/video";
import { getAccessToken, getSession } from "@/lib/auth/server";

/**
 * What the student area asks the API for after it has loaded
 * (docs/courses-lessons-api.md §6). The API scopes every call to the
 * signed-in student and their academy.
 */

async function studentToken() {
  const session = await getSession();
  return session?.role === "STUDENT" ? await getAccessToken() : undefined;
}

export type OpenLesson = { content: string; videoUrl: string | null };

/**
 * GET /lessons/:id — the lesson's text and the address its video streams from
 * (GET /lessons/:id/video, which checks the session on every request — lib/academy/video.ts).
 * 403: the student isn't enrolled in the course; 404: the lesson isn't available.
 */
export async function openLessonAction(id: string): Promise<ApiResult<OpenLesson>> {
  const token = await studentToken();
  if (!token) return sessionExpired;
  const lessonId = apiId(id);
  if (!lessonId) return { ok: false, status: 404, message: "الدرس غير متاح.", raw: "" };
  const res = await fetchLesson(token, lessonId);
  if (!res.ok) return res;
  return { ok: true, data: { content: res.data.content ?? "", videoUrl: await lessonVideoSrc(res.data.videoUrl, academyRoutes.student.video(id)) } };
}

/**
 * POST /enrollments/redeem — activates a course with the teacher's code. Its
 * response isn't documented yet, so the unlocked course is read from wherever
 * it plausibly sits and may come back undefined.
 */
export async function redeemCodeAction(code: string): Promise<ApiResult<{ courseId?: string }>> {
  const token = await studentToken();
  if (!token) return sessionExpired;
  const res = await coursesRequest<{ courseId?: number; course?: { id?: number }; enrollment?: { courseId?: number } }>(token, "/enrollments/redeem", {
    method: "POST",
    body: { code },
  });
  if (res.ok) {
    const courseId = res.data?.enrollment?.courseId ?? res.data?.courseId ?? res.data?.course?.id;
    return { ok: true, data: { courseId: courseId != null ? String(courseId) : undefined } };
  }
  if (res.status === 409) return { ...res, message: "أنت مسجّل في هذه الدورة بالفعل، أو أن الكود مستخدم من قبل." };
  if (res.status === 400 || res.status === 404) return { ...res, message: "الكود غير صالح أو مستخدم من قبل." };
  return res;
}
