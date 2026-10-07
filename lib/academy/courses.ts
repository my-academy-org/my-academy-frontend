import { accessTokenHeader } from "@/lib/auth/backend";
import { ACADEMY_API_URL } from "./config";

/**
 * Courses & Lessons API (docs/courses-lessons-api.md), called from the server
 * with the session's `access_token`, so it works on any host (including
 * localhost, which the API's CORS and cookie domain exclude). The API scopes
 * every call to the signed-in user: a student only gets published content of
 * their academy, an owner everything in theirs.
 */

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LessonStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Course {
  id: number;
  tenantId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: CourseStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: { lessons: number; exams: number };
}

export interface CourseInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  status?: CourseStatus;
  order?: number;
}

export interface LessonSummary {
  id: number;
  tenantId: number;
  courseId: number;
  title: string;
  description: string | null;
  /** Seconds. */
  duration: number | null;
  order: number;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
  /** Students only: false = locked until the course is redeemed. */
  enrolled?: boolean;
}

export interface LessonDetail extends Omit<LessonSummary, "enrolled"> {
  content: string | null;
  /** Path on the API that streams the video (`/lessons/:id/video`), not a storage link; null without a video. */
  videoUrl: string | null;
  videoId: string | null;
  videoType: string | null;
  mediaId: number | null;
  course: { id: number; title: string };
}

export interface LessonInput {
  /** Creation only. */
  courseId?: number;
  title?: string;
  mediaId?: number;
  description?: string;
  content?: string;
  /** Seconds. */
  duration?: number;
  order?: number;
  status?: LessonStatus;
}

export interface UploadUrl {
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  key: string;
  /** Seconds. */
  expiresIn: number;
}

export interface Media {
  id: number;
  fileName: string | null;
  /** Seconds. */
  duration: number | null;
}

/** `message` is ready to show (Arabic); `raw` is the API's own text. */
export type ApiFailure = { ok: false; status: number; message: string; raw: string };
export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

export const sessionExpired: ApiFailure = { ok: false, status: 401, message: "انتهت الجلسة. سجّل الدخول مرة أخرى.", raw: "" };

type Query = Record<string, string | number | undefined>;
type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: object; query?: Query };

const MAX_LIMIT = 100;
const MAX_PAGES = 10;

/**
 * The API rejects unknown fields and `""` for an optional one, so empty
 * values are left out of the body instead.
 */
function compact(body: object) {
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined && value !== ""));
}

export async function coursesRequest<T>(token: string, path: string, { method = "GET", body, query }: RequestOptions = {}): Promise<ApiResult<T>> {
  const url = new URL(`${ACADEMY_API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: { ...accessTokenHeader(token), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(compact(body)) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[courses] ${method} ${path} failed`, error);
    return { ok: false, status: 0, message: "تعذّر الاتصال بالخادم. حاول مرة أخرى.", raw: "" };
  }

  const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  if (res.ok) return { ok: true, data: data as T };

  const raw = Array.isArray(data?.message) ? data.message.join(" · ") : (data?.message ?? res.statusText);
  console.error(`[courses] ${method} ${path} → ${res.status}`, raw);
  return { ok: false, status: res.status, message: describe(res.status, raw), raw };
}

function describe(status: number, raw: string) {
  if (status === 401) return sessionExpired.message;
  if (status === 403 && /not enrolled/i.test(raw)) return "لست مشتركاً في هذه الدورة.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (status === 404) return "العنصر غير موجود. ربما حُذف.";
  if (status === 409 && /already used/i.test(raw)) return "هذا الفيديو مستخدم في درس آخر. ارفع فيديو جديداً.";
  if (status === 409) return "لا يمكن الحذف لوجود بيانات مرتبطة.";
  if (status === 400 && /not been uploaded/i.test(raw)) return "لم يكتمل رفع الفيديو. ارفعه مرة أخرى.";
  if (status === 400 && /upload the video first|key is not valid/i.test(raw)) return "الفيديو غير موجود على الخادم. ارفعه مرة أخرى.";
  if (status === 400) return `بيانات غير صالحة: ${raw}`;
  if (status === 503) return "تخزين الفيديو غير مُعدّ على الخادم بعد.";
  return `حدث خطأ غير متوقع (${status}).`;
}

/** Every page of a list endpoint (up to MAX_LIMIT × MAX_PAGES items). */
async function listAll<T>(token: string, path: string, query: Query = {}): Promise<ApiResult<T[]>> {
  const all: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await coursesRequest<Paginated<T>>(token, path, { query: { ...query, page, limit: MAX_LIMIT } });
    if (!res.ok) return res;
    all.push(...res.data.data);
    if (page >= res.data.meta.totalPages) break;
  }
  return { ok: true, data: all };
}

/** GET /courses — ordered by `order`, then id. */
export const fetchCourses = (token: string) => listAll<Course>(token, "/courses");

/** GET /lessons — ordered by course, `order`, then id; without content or video. */
export const fetchLessons = (token: string) => listAll<LessonSummary>(token, "/lessons");

/** GET /lessons/:id — with content and the `videoUrl` path. */
export const fetchLesson = (token: string, id: number) => coursesRequest<LessonDetail>(token, `/lessons/${id}`);

/** A numeric API id from the string ids the screens use; null when it isn't one. */
export function apiId(id: string) {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** Lesson length in whole minutes, as the screens show it. */
export const minutesOf = (seconds: number | null) => (seconds ? Math.max(1, Math.round(seconds / 60)) : 0);

export const COURSE_TINTS = ["#dbe4ff", "#d1fae5", "#fde68a", "#fbcfe8", "#e0e7ff", "#ccfbf1"];
