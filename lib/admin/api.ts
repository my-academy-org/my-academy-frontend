import { cache } from "react";
import { redirect } from "next/navigation";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { accessTokenHeader } from "@/lib/auth/backend";
import { getAccessToken } from "@/lib/auth/server";
import type {
  AcademyList,
  AcademyPatch,
  AcademyStatus,
  AdminAcademy,
  AdminAcademyDetail,
  AdminTemplate,
  OwnerList,
  OwnerStatus,
  Plan,
  PlatformStats,
} from "./types";

/**
 * Super Admin API client (docs/super-admin-api.md). Server-only: every call
 * forwards the httpOnly `access_token` session cookie, and the API itself
 * enforces the SUPER_ADMIN role (403 otherwise).
 */

/** Clears the session and returns to /login (app/logout/expired/route.ts). */
const SESSION_EXPIRED_PATH = "/logout/expired";

export class ApiError extends Error {
  constructor(
    /** HTTP status, or 0 when the API couldn't be reached. */
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined>;

async function request<T>(path: string, { method = "GET", body, query }: { method?: "GET" | "POST" | "DELETE"; body?: unknown; query?: Query } = {}): Promise<T> {
  if (!ACADEMY_API_URL) throw new ApiError(0, "ACADEMY_API_URL is not set");

  const token = await getAccessToken();
  if (!token) redirect(SESSION_EXPIRED_PATH);

  const url = new URL(`${ACADEMY_API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...accessTokenHeader(token),
        ...(body !== undefined && { "content-type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  // The session lasts one hour and there is no refresh token.
  if (res.status === 401) redirect(SESSION_EXPIRED_PATH);

  const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
    throw new ApiError(res.status, message ?? res.statusText);
  }
  return data as T;
}

const knownErrors: [match: string, arabic: string][] = [
  ["already has an admin", "لهذه الأكاديمية مالك بالفعل."],
  ["OTP already sent", "أُرسل رمز تحقق لهذا البريد بالفعل. أدخله خلال 5 دقائق."],
  ["Tenant is not active", "الأكاديمية غير نشطة أو غير موجودة. فعّلها أولاً."],
  ["OTP has expired", "انتهت صلاحية رمز التحقق. أعد إرسال الرمز."],
  ["Invalid OTP", "رمز التحقق غير صحيح."],
  ["is already taken", "هذا النطاق مستخدم لأكاديمية أخرى."],
  ["is already in use", "يوجد حساب بهذا البريد بالفعل."],
  ["Template #", "القالب المحدّد غير موجود."],
  ["Failed to create tenant", "تعذّر إنشاء الأكاديمية. قد يكون النطاق مستخدماً أو رقم القالب غير صحيح."],
  ["Invitation can only be resent", "تُعاد الدعوة فقط لمالك لم يسجّل الدخول بعد."],
  ["The academy is suspended", "أكاديمية هذا المالك موقوفة. فعّل الأكاديمية نفسها لاستعادة حسابه."],
];

/** Arabic message for a failed API call. */
export function errorMessage(error: ApiError) {
  const known = knownErrors.find(([match]) => error.message.includes(match));
  if (known) return known[1];
  if (error.status === 0) {
    return ACADEMY_API_URL ? "تعذّر الاتصال بالخادم. حاول مرة أخرى بعد قليل." : "لم يُضبط عنوان الـ API. أضف ACADEMY_API_URL إلى ملف ‎.env.local ثم أعد تشغيل الخادم.";
  }
  if (error.status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (error.status === 404) return "العنصر غير موجود. ربما حُذف.";
  if (error.status === 400) return `بيانات غير صالحة: ${error.message}`;
  return `حدث خطأ غير متوقع (${error.status}): ${error.message}`;
}

export type Loaded<T> = { ok: true; data: T } | { ok: false; message: string };

/** Runs page data fetching, turning API failures into a message the page can render. */
export async function load<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    // Anything else (including the session-expired redirect) must propagate.
    if (error instanceof ApiError) return { ok: false, message: errorMessage(error) };
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

export const getStatistics = cache(() => request<PlatformStats>("/academies/statistics"));

/* ------------------------------------------------------------------ */
/* Academies                                                           */
/* ------------------------------------------------------------------ */

export function listAcademies(query: { status?: AcademyStatus | ""; templateId?: string; search?: string; page?: number; limit?: number } = {}) {
  return request<AcademyList>("/academies", { query });
}

const MAX_LIMIT = 100;
const MAX_PAGES = 10;

/** Every academy (up to MAX_LIMIT × MAX_PAGES), for things the API has no dedicated endpoint for. */
const listAllAcademies = cache(async () => {
  const rows: AdminAcademy[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, meta } = await listAcademies({ page, limit: MAX_LIMIT });
    rows.push(...data);
    if (page >= meta.totalPages) break;
  }
  return rows;
});

export async function listRecentAcademies(count: number) {
  return [...(await listAllAcademies())].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, count);
}

/** Academies that still need an owner. */
export async function listOwnerlessAcademies() {
  return (await listAllAcademies()).filter((a) => !a.owner);
}

export type TemplateUsage = AdminTemplate & { usage: number };

/**
 * There is no templates endpoint yet (docs §7), so the known templates are
 * the ones existing academies use.
 */
export async function listTemplates(): Promise<TemplateUsage[]> {
  const byId = new Map<number, TemplateUsage>();
  for (const { template } of await listAllAcademies()) {
    if (!template) continue;
    const known = byId.get(template.id);
    if (known) known.usage++;
    else byId.set(template.id, { ...template, usage: 1 });
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

/** Null when the academy doesn't exist. */
export async function getAcademy(id: number): Promise<AdminAcademyDetail | null> {
  try {
    return await request<AdminAcademyDetail>(`/academies/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export function createAcademy(templateId: number, body: { name: string; slug: string; plan: Plan }) {
  return request<{ tenant: { id: number; academy: { id: number } } }>(`/tenants/${templateId}`, { method: "POST", body });
}

export function updateAcademy(id: number, patch: AcademyPatch) {
  return request<{ academy: AdminAcademyDetail }>(`/academies/${id}`, { method: "POST", body: patch });
}

export function setAcademyStatus(id: number, action: "activate" | "suspend") {
  return request<{ id: number; status: AcademyStatus }>(`/academies/${id}/${action}`, { method: "POST" });
}

export function deleteAcademy(id: number) {
  return request<{ id: number }>(`/academies/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Academy owners                                                      */
/* ------------------------------------------------------------------ */

export function listOwners(query: { status?: OwnerStatus | ""; search?: string; page?: number; limit?: number } = {}) {
  return request<OwnerList>("/users/academy-admins", { query });
}

/** Step 1 of adding an owner: emails a 5-minute OTP to the owner. */
export function requestOwnerOtp(tenantId: number, body: { name: string; email: string }) {
  return request<{ message: string }>(`/users/add-academy-admin/${tenantId}`, { method: "POST", body });
}

/** Step 2: creates the account (INACTIVE until first sign-in) and emails the credentials. */
export function verifyOwnerOtp(body: { email: string; otp: string }) {
  return request<{ message: string }>("/auth/academy-admin/verify-otp", { method: "POST", body });
}

export function updateOwner(id: number, body: { name?: string; email?: string }) {
  return request<{ admin: { id: number; name: string; email: string } }>(`/users/academy-admins/${id}`, { method: "POST", body });
}

export function resendInvitation(id: number) {
  return request<{ message: string }>(`/users/academy-admins/${id}/resend-invitation`, { method: "POST" });
}

export function setOwnerStatus(id: number, action: "activate" | "suspend") {
  return request<{ id: number; status: OwnerStatus }>(`/users/academy-admins/${id}/${action}`, { method: "POST" });
}
