/**
 * Email confirmation with an OTP (docs/auth-api.md §3.2 and §4). Each role has
 * its own endpoint; neither needs a session, so this runs in the browser as
 * well as on the server.
 */

export type OtpRole = "ACADEMY_ADMIN" | "STUDENT";

const OTP_PATHS: Record<OtpRole, string> = {
  ACADEMY_ADMIN: "/auth/academy-admin/verify-otp",
  STUDENT: "/auth/student/verify-otp",
};

/** The role named by `?role=`; links without one are academy-owner invitations. */
export function otpRole(value: unknown): OtpRole {
  return value === "STUDENT" ? "STUDENT" : "ACADEMY_ADMIN";
}

export type OtpResult = { ok: true } | { ok: false; reason: "expired" | "invalid" | "unavailable" };

export async function verifyOtp(apiUrl: string, role: OtpRole, email: string, otp: string): Promise<OtpResult> {
  const path = OTP_PATHS[role];
  try {
    const res = await fetch(`${apiUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // `otp` is sent as a string.
      body: JSON.stringify({ email, otp }),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    const { message } = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const text = Array.isArray(message) ? message.join(" ") : (message ?? "");
    if (text.includes("expired")) return { ok: false, reason: "expired" };
    // OTP failures are 422 for academy owners and 400 for students.
    if (res.status === 422 || res.status === 400) return { ok: false, reason: "invalid" };
    console.error(`[auth] POST ${path} → ${res.status}`, text);
    return { ok: false, reason: "unavailable" };
  } catch (error) {
    console.error(`[auth] POST ${path} failed`, error);
    return { ok: false, reason: "unavailable" };
  }
}

/** How long each role's code stays valid. */
export const otpLifetime: Record<OtpRole, string> = { ACADEMY_ADMIN: "5 دقائق", STUDENT: "ساعة واحدة" };

export function otpErrorMessage(reason: "expired" | "invalid" | "unavailable", role: OtpRole) {
  if (reason === "unavailable") return "تعذّر تأكيد الرمز الآن. حاول مرة أخرى بعد قليل.";
  if (reason === "invalid") return "رمز التحقق غير صحيح. تأكّد من الرمز والبريد الإلكتروني.";
  return role === "STUDENT"
    ? `انتهت صلاحية رمز التحقق (${otpLifetime.STUDENT}). أعد التسجيل للحصول على رمز جديد.`
    : `انتهت صلاحية رمز التحقق (${otpLifetime.ACADEMY_ADMIN}). اطلب من فريق My Academy إرسال رمز جديد.`;
}

export type VerifyOtpState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string; fieldErrors?: { email?: string; otp?: string } }
  | { status: "success"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates the form and confirms the code against the endpoint of `role`. */
export async function confirmOtp(apiUrl: string | undefined, role: OtpRole, email: string, otp: string): Promise<VerifyOtpState> {
  const fieldErrors: { email?: string; otp?: string } = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (!/^\d{4,8}$/.test(otp)) fieldErrors.otp = "أدخل رمز التحقق المكوّن من أرقام";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة.", email, fieldErrors };

  if (!apiUrl) return { status: "error", message: "تأكيد الحساب غير متاح قبل ربط الـ backend.", email };

  const result = await verifyOtp(apiUrl, role, email, otp);
  if (result.ok) return { status: "success", email };

  const message = otpErrorMessage(result.reason, role);
  return { status: "error", message, email, fieldErrors: result.reason === "unavailable" ? undefined : { otp: message } };
}
