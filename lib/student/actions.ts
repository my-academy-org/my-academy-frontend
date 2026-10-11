"use server";

import { apiId, coursesRequest, fetchLesson, sessionExpired, type ApiResult, type MediaStatus } from "@/lib/academy/courses";
import type { Enrollment } from "@/lib/academy/enrollments";
import { academyRoutes } from "@/lib/academy/nav";
import { lessonVideoSrc } from "@/lib/academy/video";
import { getAccessToken, getSession } from "@/lib/auth/server";

/**
 * What the student area asks the API for after it has loaded
 * (docs/courses-lessons-api.md §6, docs/enrollments-api.md §5). The API scopes every call to the
 * signed-in student and their academy.
 */

async function studentToken() {
  const session = await getSession();
  return session?.role === "STUDENT" ? await getAccessToken() : undefined;
}

export type OpenLesson = {
  content: string;
  /** The HLS playlist of the lesson's video; playable once `videoStatus` is `READY`. */
  videoUrl: string | null;
  /** Null without a video. */
  videoStatus: MediaStatus | null;
};

/**
 * GET /lessons/:id — the lesson's text, the address its video plays from
 * (GET /lessons/:id/video, which checks the session — lib/academy/video.ts) and whether that video is ready.
 * 403: the student isn't enrolled in the course; 404: the lesson isn't available.
 */
export async function openLessonAction(id: string): Promise<ApiResult<OpenLesson>> {
  const token = await studentToken();
  if (!token) return sessionExpired;
  const lessonId = apiId(id);
  if (!lessonId) return { ok: false, status: 404, message: "الدرس غير متاح.", raw: "" };
  const res = await fetchLesson(token, lessonId);
  if (!res.ok) return res;
  return {
    ok: true,
    data: {
      content: res.data.content ?? "",
      videoUrl: await lessonVideoSrc(res.data.videoUrl, academyRoutes.student.video(id)),
      videoStatus: res.data.media?.status ?? null,
    },
  };
}

/**
 * POST /enrollments/redeem — activates a course with the teacher's code
 * (docs/enrollments-api.md §4); the course comes from the code. 404: no such
 * code in this academy; 409: the code is used or disabled, its course isn't
 * published, or the student is already enrolled. A refused code isn't consumed.
 */
export async function redeemCodeAction(code: string): Promise<ApiResult<{ courseId: string }>> {
  const token = await studentToken();
  if (!token) return sessionExpired;
  const res = await coursesRequest<{ enrollment: Enrollment }>(token, "/enrollments/redeem", { method: "POST", body: { code: code.trim().toUpperCase() } });
  return res.ok ? { ok: true, data: { courseId: String(res.data.enrollment.course.id) } } : res;
}
