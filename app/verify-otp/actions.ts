"use server";

import { ACADEMY_API_URL } from "@/lib/academy/config";
import { verifyAcademyAdminOtp } from "@/lib/auth/backend";

export type VerifyOtpState =
  | { status: "idle" }
  | { status: "error"; message: string; email: string; fieldErrors?: { email?: string; otp?: string } }
  | { status: "success"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Confirms an academy owner's email with the OTP they received, which creates their account. */
export async function verifyOtpAction(_: VerifyOtpState, fd: FormData): Promise<VerifyOtpState> {
  const email = String(fd.get("email") ?? "").trim();
  const otp = String(fd.get("otp") ?? "").replace(/\s/g, "");

  const fieldErrors: { email?: string; otp?: string } = {};
  if (!EMAIL_RE.test(email)) fieldErrors.email = "أدخل بريداً إلكترونياً صحيحاً";
  if (!/^\d{4,8}$/.test(otp)) fieldErrors.otp = "أدخل رمز التحقق المكوّن من أرقام";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "تحقّق من البيانات المدخلة.", email, fieldErrors };

  if (!ACADEMY_API_URL) return { status: "error", message: "تأكيد الحساب غير متاح قبل ربط الـ backend.", email };

  const result = await verifyAcademyAdminOtp(email, otp);
  if (result.ok) return { status: "success", email };

  if (result.reason === "unavailable") return { status: "error", message: "تعذّر تأكيد الرمز الآن. حاول مرة أخرى بعد قليل.", email };
  const message =
    result.reason === "expired"
      ? "انتهت صلاحية رمز التحقق (5 دقائق). اطلب من فريق My Academy إرسال رمز جديد."
      : "رمز التحقق غير صحيح. تأكّد من الرمز والبريد الإلكتروني.";
  return { status: "error", message, email, fieldErrors: { otp: message } };
}
