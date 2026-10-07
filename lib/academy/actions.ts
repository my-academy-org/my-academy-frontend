"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginErrors } from "@/components/academy/shared/auth";
import { backendLogin } from "@/lib/auth/backend";
import { getSession } from "@/lib/auth/server";
import { ACCESS_TOKEN_COOKIE, isStudentOf } from "@/lib/auth/session";
import { ACADEMY_API_URL, TENANT_HEADER } from "./config";
import { getAcademySite } from "./data";
import { academyRoutes } from "./nav";

/**
 * Form actions shared by all three templates. Templates only style the
 * forms — validation, tenant resolution and API calls live here once.
 */

export type FormState =
  | { status: "idle" }
  /** `otp`: the account still needs its emailed code confirmed — `sent` just now, or still `pending` from an earlier attempt. */
  | { status: "success"; message: string; otp?: "sent" | "pending" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      /** Echoed back so the form can restore what the user typed (never passwords). */
      values?: Record<string, string>;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tenant comes from the proxy-set header, never from the form, so a student can't register into another academy. */
async function currentTenant() {
  const slug = (await headers()).get(TENANT_HEADER);
  if (!slug) throw new Error("Academy action called outside an academy subdomain");
  return slug;
}

/** Backend tenant of the current academy, from GET /landing-page/:slug; undefined for the sample academies or an unavailable one. */
async function currentTenantId() {
  return (await getAcademySite(await currentTenant()))?.tenant.tenantId;
}

async function post(path: string, body: unknown): Promise<{ ok: boolean; status: number; message?: string }> {
  // No backend configured: behave like a successful call so the UI can be exercised end to end.
  if (!ACADEMY_API_URL) return { ok: true, status: 200 };
  const res = await fetch(`${ACADEMY_API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (res.ok) return { ok: true, status: res.status };
  // Validation errors come back with `message` as an array.
  const data = (await res.json().catch(() => ({}))) as { message?: string | string[] };
  return { ok: false, status: res.status, message: Array.isArray(data.message) ? data.message.join(" · ") : data.message };
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/**
 * Server-side student sign-in (docs/auth-api.md §2), used when the page isn't
 * on the API's own domain; there the browser calls POST /auth/login itself
 * (LoginForm) so the API's Set-Cookie reaches it.
 */
export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (!password) fieldErrors.password = "أدخل كلمة المرور";
  const values = { email };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors, values };

  // No backend configured: nothing to sign in against, and the sample student area is open.
  if (!ACADEMY_API_URL) redirect(academyRoutes.student.dashboard);

  const result = await backendLogin(email, password);
  if (!result.ok) return { status: "error", message: loginErrors[result.reason], values };
  // One login route for every role and academy: the account must be a student of this one.
  if (!isStudentOf(result.user, await currentTenantId())) return { status: "error", message: loginErrors["other-academy"], values };

  // Sign-in ran on the server, so the API's Set-Cookie never reached the browser: carry its session cookie over.
  const { value, maxAge } = result.accessToken;
  (await cookies()).set(ACCESS_TOKEN_COOKIE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  redirect(academyRoutes.student.dashboard);
}

/** After a sign-in made by the browser: GET /auth/me says whether the session is a student of this academy. */
export async function studentSessionAction(): Promise<{ ok: boolean }> {
  return { ok: isStudentOf(await getSession(), await currentTenantId()) };
}

/** Step 1 of the student sign-up (docs/auth-api.md §3.1): emails a code; the account is created once it is confirmed. */
export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 3) fieldErrors.name = "أدخل اسمك الكامل";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (password.length < 8) fieldErrors.password = "كلمة المرور 8 أحرف على الأقل";
  if (confirm !== password) fieldErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
  const values = { name, email };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors, values };

  const unavailable: FormState = { status: "error", message: "التسجيل غير متاح في هذه الأكاديمية حالياً.", values };
  const tenantId = await currentTenantId();
  if (ACADEMY_API_URL && tenantId == null) return unavailable;

  // Only the documented fields (anything else is a 400), with `tenantId` as a number (a string is a 500).
  const res = await post("/auth/register", { name, email, password, tenantId });
  if (res.ok) {
    return ACADEMY_API_URL
      ? { status: "success", otp: "sent", message: `أرسلنا رمز التحقق إلى ${email}.` }
      : { status: "success", message: "تم إنشاء حسابك في الأكاديمية. يمكنك الآن تسجيل الدخول." };
  }
  // A registration for this email is still waiting for its code (valid 5 minutes).
  if (res.status === 422) return { status: "success", otp: "pending", message: `سبق أن أرسلنا رمز تحقق إلى ${email} ولم تنتهِ صلاحيته بعد.` };
  if (res.status === 403) return unavailable;
  if (res.message?.includes("already exists")) {
    return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors: { email: "هذا البريد مسجّل بالفعل. سجّل الدخول." }, values };
  }
  return { status: "error", message: "تعذّر إنشاء الحساب، حاول مرة أخرى", values };
}

export async function forgotPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors: { email: "أدخل بريداً إلكترونياً صحيحاً" }, values: { email } };
  }
  const tenant = await currentTenant();
  await post(`/academies/${tenant}/auth/forgot-password`, { email });
  // Same response whether or not the email exists, to avoid account enumeration.
  return { status: "success", message: "إن كان البريد مسجّلاً لدينا، ستصلك رسالة لإعادة تعيين كلمة المرور." };
}

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const message = str(fd, "message");
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "أدخل اسمك";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (message.length < 10) fieldErrors.message = "اكتب رسالتك (10 أحرف على الأقل)";
  const values = { name, email, phone: str(fd, "phone"), message };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors, values };

  const tenant = await currentTenant();
  const res = await post(`/academies/${tenant}/contact`, values);
  if (!res.ok) return { status: "error", message: res.message ?? "تعذّر إرسال الرسالة، حاول مرة أخرى", values };
  return { status: "success", message: "تم إرسال رسالتك، وسنتواصل معك قريباً." };
}
