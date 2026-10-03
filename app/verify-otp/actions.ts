"use server";

import { ACADEMY_API_URL } from "@/lib/academy/config";
import { confirmOtp, otpRole, type VerifyOtpState } from "@/lib/auth/otp";

/**
 * Confirms an email with the OTP sent to it, which creates the account. The
 * `role` field (from `?role=`) picks the endpoint. Used when the page isn't on
 * the API's own domain; there the browser calls the API directly (VerifyOtpForm).
 */
export async function verifyOtpAction(_: VerifyOtpState, fd: FormData): Promise<VerifyOtpState> {
  const email = String(fd.get("email") ?? "").trim();
  const otp = String(fd.get("otp") ?? "").replace(/\s/g, "");
  return confirmOtp(ACADEMY_API_URL, otpRole(fd.get("role")), email, otp);
}
