"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { PUBLIC_API_URL } from "@/lib/academy/config";
import { confirmOtp, otpLifetime, type OtpRole, type VerifyOtpState } from "@/lib/auth/otp";
import { sharesApiDomain } from "@/lib/auth/session";
import { verifyOtpAction } from "./actions";

const successText: Record<OtpRole, { title: string; body: string }> = {
  ACADEMY_ADMIN: {
    title: "تم تأكيد بريدك وإنشاء حسابك",
    body: "أرسلنا بيانات الدخول (البريد وكلمة المرور) إلى بريدك. استخدمها لتسجيل الدخول إلى لوحة أكاديميتك.",
  },
  STUDENT: {
    title: "تم تأكيد بريدك وتفعيل حسابك",
    body: "يمكنك الآن تسجيل الدخول بالبريد وكلمة المرور اللذين سجّلت بهما.",
  },
};

/** `role` (from `?role=`) decides which verify-otp endpoint confirms the code. */
export function VerifyOtpForm({ email: initialEmail, role }: { email?: string; role: OtpRole }) {
  const [serverState, action, serverPending] = useActionState<VerifyOtpState, FormData>(verifyOtpAction, { status: "idle" });
  const [direct, setDirect] = useState<{ state?: VerifyOtpState; pending: boolean }>({ pending: false });

  const state = direct.state ?? serverState;
  const pending = serverPending || direct.pending;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // On the API's own domain the browser calls it directly; elsewhere (e.g. localhost, which its CORS excludes) the server action does.
    if (!sharesApiDomain(PUBLIC_API_URL, window.location.hostname)) return;
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setDirect({ pending: true });
    const result = await confirmOtp(PUBLIC_API_URL, role, String(fd.get("email") ?? "").trim(), String(fd.get("otp") ?? "").replace(/\s/g, ""));
    setDirect({ state: result, pending: false });
  };

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
        <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-white">
          <Icon name="check" className="size-5" strokeWidth={2.5} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink-950">{successText[role].title}</h2>
        <p className="mt-2 leading-7 text-ink-700">
          <bdi className="font-semibold text-ink-950">{state.email}</bdi> — {successText[role].body}
        </p>
        {role === "ACADEMY_ADMIN" && (
          <Button href="/login" size="lg" className="mt-6 w-full" withArrow>
            تسجيل الدخول
          </Button>
        )}
      </div>
    );
  }

  const email = state.status === "error" ? state.email : initialEmail;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="role" value={role} />
      {state.status === "error" && !fieldErrors?.otp && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 ring-1 ring-red-100">
          {state.message}
        </p>
      )}
      <Field label="البريد الإلكتروني" htmlFor="otp-email" error={fieldErrors?.email} hint="البريد الذي وصلك عليه رمز التحقق.">
        <Input
          id="otp-email"
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          placeholder="name@example.com"
          className="text-start"
          defaultValue={email}
          key={email}
          aria-invalid={!!fieldErrors?.email}
        />
      </Field>
      <Field label="رمز التحقق (OTP)" htmlFor="otp-code" error={fieldErrors?.otp} hint={`الرمز صالح لمدة ${otpLifetime[role]} من وقت إرساله.`}>
        <Input
          id="otp-code"
          name="otp"
          required
          dir="ltr"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          autoComplete="one-time-code"
          placeholder="123456"
          className="text-center font-mono text-lg tracking-[0.4em]"
          aria-invalid={!!fieldErrors?.otp}
          autoFocus={!!email}
        />
      </Field>
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? "جارٍ التأكيد…" : role === "STUDENT" ? "تأكيد وتفعيل الحساب" : "تأكيد وإنشاء الحساب"}
      </Button>
    </form>
  );
}
