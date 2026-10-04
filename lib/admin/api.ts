import { PUBLIC_API_URL } from "@/lib/academy/config";
import { pickLandingInput, type LandingPageAdmin, type LandingPageInput } from "@/lib/academy/landing";
import type { Role } from "@/lib/auth/session";
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
 * Super Admin API client (docs/super-admin-api.md, docs/auth-api.md).
 *
 * Browser-only: every request goes straight from the browser to the API at
 * NEXT_PUBLIC_API_URL with `credentials: "include"`, so the API's httpOnly
 * `access_token` cookie authenticates it. Nothing here passes through the
 * Next.js server, and the token is never readable from JavaScript.
 */

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
type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; query?: Query; /** A 401 here isn't an expired session (public endpoint). */ public?: boolean };

/** The session lasts one hour with no refresh token: a 401 means signing in again. */
function redirectToLogin() {
  const next = `${window.location.pathname}${window.location.search}`;
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full page load: the session is gone
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}

async function request<T>(path: string, { method = "GET", body, query, public: isPublic }: RequestOptions = {}): Promise<T> {
  if (!PUBLIC_API_URL) throw new ApiError(0, "NEXT_PUBLIC_API_URL is not set");

  const url = new URL(`${PUBLIC_API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    // Also what a CORS rejection looks like from the browser.
    throw new ApiError(0, "Network error");
  }

  const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  if (!res.ok) {
    if (res.status === 401 && !isPublic) redirectToLogin();
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
  ["account is suspended", "حسابك موقوف حالياً."],
];

/** Arabic message for a failed API call. */
export function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return "حدث خطأ غير متوقع.";
  const known = knownErrors.find(([match]) => error.message.includes(match));
  if (known) return known[1];
  if (error.status === 0) {
    return PUBLIC_API_URL
      ? "تعذّر الاتصال بالخادم. تحقّق من اتصالك، ومن أن هذا النطاق مسموح له في إعدادات CORS للـ API."
      : "لم يُضبط عنوان الـ API. أضف NEXT_PUBLIC_API_URL إلى متغيّرات البيئة ثم أعد بناء التطبيق.";
  }
  if (error.status === 401) return "انتهت الجلسة. جارٍ تحويلك إلى تسجيل الدخول…";
  if (error.status === 403) return "لا تملك صلاحية تنفيذ هذا الإجراء.";
  if (error.status === 404) return "العنصر غير موجود. ربما حُذف.";
  if (error.status === 400) return `بيانات غير صالحة: ${error.message}`;
  return `حدث خطأ غير متوقع (${error.status}): ${error.message}`;
}

/* ------------------------------------------------------------------ */
/* Data freshness                                                      */
/* ------------------------------------------------------------------ */

let dataVersion = 0;
const listeners = new Set<() => void>();

/** Bumped after every successful mutation; mounted queries refetch (components/admin/useApiQuery.ts). */
export const getDataVersion = () => dataVersion;

export function subscribeToData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function invalidateData() {
  dataVersion++;
  for (const listener of listeners) listener();
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export type CurrentUser = { id: number; name: string; email: string; role: Role; status: string; tenantId: number | null };

/** GET /auth/me */
export async function getCurrentUser() {
  return (await request<{ user: CurrentUser }>("/auth/me")).user;
}

/** POST /auth/logout — the API clears its own httpOnly cookie. */
export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST", public: true });
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

export const getStatistics = () => request<PlatformStats>("/academies/statistics");

/* ------------------------------------------------------------------ */
/* Academies                                                           */
/* ------------------------------------------------------------------ */

export function listAcademies(query: { status?: AcademyStatus | ""; templateId?: string; search?: string; page?: number; limit?: number } = {}) {
  return request<AcademyList>("/academies", { query });
}

const MAX_LIMIT = 100;
const MAX_PAGES = 10;

let allAcademies: { version: number; rows: Promise<AdminAcademy[]> } | undefined;

/**
 * Every academy (up to MAX_LIMIT × MAX_PAGES), for things the API has no
 * dedicated endpoint for. Shared by concurrent callers until the data changes.
 */
function listAllAcademies() {
  if (allAcademies?.version !== dataVersion) {
    const rows = (async () => {
      const all: AdminAcademy[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const { data, meta } = await listAcademies({ page, limit: MAX_LIMIT });
        all.push(...data);
        if (page >= meta.totalPages) break;
      }
      return all;
    })();
    allAcademies = { version: dataVersion, rows };
    // A failed load must not be reused.
    rows.catch(() => {
      if (allAcademies?.rows === rows) allAcademies = undefined;
    });
  }
  return allAcademies.rows;
}

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

/** Step 2 (needs no session): creates the account (INACTIVE until first sign-in) and emails the credentials. */
export function verifyOwnerOtp(body: { email: string; otp: string }) {
  return request<{ message: string }>("/auth/academy-admin/verify-otp", { method: "POST", body, public: true });
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

/* ------------------------------------------------------------------ */
/* Landing pages (docs/landing-page-api.md §4)                         */
/* ------------------------------------------------------------------ */

/**
 * An academy's landing page. There is no per-academy endpoint: GET
 * /landing-page returns every academy's page to the Super Admin.
 */
export async function getAcademyLandingPage(academyId: number) {
  const pages = await request<LandingPageAdmin[]>("/landing-page");
  return pages.find((p) => p.academyId === academyId) ?? null;
}

/**
 * There is no Super Admin create: POST /landing-page takes the academy from
 * the session's tenant, which a Super Admin doesn't have.
 */
export function updateLandingPage(id: number, input: LandingPageInput) {
  return request<{ message: string }>(`/landing-page/${id}`, { method: "PATCH", body: pickLandingInput(input) });
}

export function deleteLandingPage(id: number) {
  return request<{ message: string }>(`/landing-page/${id}`, { method: "DELETE" });
}
