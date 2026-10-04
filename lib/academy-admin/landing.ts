import { ACADEMY_API_URL } from "@/lib/academy/config";
import type { LandingFailure, LandingPageAdmin, LandingPageInput } from "@/lib/academy/landing";
import { accessTokenHeader } from "@/lib/auth/backend";

/**
 * Owner-side Landing Page API (docs/landing-page-api.md §4), called from the
 * server with the session's `access_token`, so it works on any host
 * (including localhost, which the API's CORS and cookie domain exclude).
 */

export type LandingLoad = { ok: true; page: LandingPageAdmin | null } | { ok: false; message: string };

/** GET /landing-page — an owner gets at most one item (their academy's page). */
export async function fetchOwnLandingPage(token: string): Promise<LandingLoad> {
  try {
    const res = await fetch(`${ACADEMY_API_URL}/landing-page`, { headers: accessTokenHeader(token), cache: "no-store" });
    if (!res.ok) {
      console.error(`[landing] GET /landing-page → ${res.status}`, await res.text().catch(() => ""));
      return { ok: false, message: res.status === 401 ? "انتهت الجلسة. سجّل الدخول مرة أخرى." : "تعذّر تحميل صفحة الهبوط من الخادم." };
    }
    const pages = (await res.json()) as LandingPageAdmin[];
    return { ok: true, page: (Array.isArray(pages) ? pages[0] : null) ?? null };
  } catch (error) {
    console.error("[landing] GET /landing-page failed", error);
    return { ok: false, message: "تعذّر الاتصال بالخادم." };
  }
}

export async function landingRequest(token: string, path: string, method: "POST" | "PATCH" | "DELETE", body?: LandingPageInput): Promise<{ ok: true } | LandingFailure> {
  let res: Response;
  try {
    res = await fetch(`${ACADEMY_API_URL}${path}`, {
      method,
      headers: { ...accessTokenHeader(token), ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[landing] ${method} ${path} failed`, error);
    return { ok: false, status: 0, message: "تعذّر الاتصال بالخادم. حاول مرة أخرى." };
  }
  if (res.ok) return { ok: true };

  const data = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  const raw = Array.isArray(data?.message) ? data.message.join(" · ") : (data?.message ?? res.statusText);
  console.error(`[landing] ${method} ${path} → ${res.status}`, raw);
  return { ok: false, status: res.status, ...describe(res.status, raw) };
}

function describe(status: number, raw: string): { message: string; upgrade?: boolean } {
  if (status === 403 && /plan/i.test(raw)) return { message: "خطتك الحالية لا تتيح إنشاء صفحة هبوط. رقِّ إلى خطة Pro.", upgrade: true };
  if (status === 403 && /not assigned/i.test(raw)) return { message: "حسابك غير مرتبط بأكاديمية." };
  if (status === 403) return { message: "لا تملك صلاحية تنفيذ هذا الإجراء." };
  if (status === 409) return { message: "لأكاديميتك صفحة هبوط بالفعل. أعد تحميل الصفحة لتعديلها." };
  if (status === 404) return { message: "صفحة الهبوط غير موجودة. ربما حُذفت؛ أعد تحميل الصفحة." };
  if (status === 401) return { message: "انتهت الجلسة. سجّل الدخول مرة أخرى." };
  if (status === 400) return { message: `بيانات غير صالحة: ${raw}` };
  return { message: `حدث خطأ غير متوقع (${status}).` };
}
