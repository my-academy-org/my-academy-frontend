"use server";

import { headers } from "next/headers";
import { ACADEMY_API_URL, TENANT_HEADER } from "./config";

/**
 * Form actions shared by all three templates. Templates only style the
 * forms — validation, tenant resolution and API calls live here once.
 */

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
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

async function post(path: string, body: unknown): Promise<{ ok: boolean; message?: string }> {
  // No backend configured: behave like a successful call so the UI can be exercised end to end.
  if (!ACADEMY_API_URL) return { ok: true };
  const res = await fetch(`${ACADEMY_API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (res.ok) return { ok: true };
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return { ok: false, message: data.message };
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (!password) fieldErrors.password = "أدخل كلمة المرور";
  const values = { email };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors, values };

  const tenant = await currentTenant();
  const res = await post(`/academies/${tenant}/auth/login`, { email, password });
  if (!res.ok) return { status: "error", message: res.message ?? "البريد الإلكتروني أو كلمة المرور غير صحيحة", values };
  // Real implementation: set the session cookie from the API response, then redirect to /student.
  return { status: "success", message: "تم تسجيل الدخول بنجاح." };
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const phone = str(fd, "phone");
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 3) fieldErrors.name = "أدخل اسمك الكامل";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (phone && !/^\+?[\d\s-]{8,}$/.test(phone)) fieldErrors.phone = "رقم الجوال غير صحيح";
  if (password.length < 8) fieldErrors.password = "كلمة المرور 8 أحرف على الأقل";
  if (confirm !== password) fieldErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
  const values = { name, email, phone };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة", fieldErrors, values };

  const tenant = await currentTenant();
  const res = await post(`/academies/${tenant}/students/register`, { name, email, phone, password });
  if (!res.ok) return { status: "error", message: res.message ?? "تعذّر إنشاء الحساب، حاول مرة أخرى", values };
  return { status: "success", message: "تم إنشاء حسابك في الأكاديمية. يمكنك الآن تسجيل الدخول." };
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
