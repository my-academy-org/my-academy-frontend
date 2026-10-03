"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { verifyOtpAction, type VerifyOtpState } from "./actions";

export function VerifyOtpForm({ email: initialEmail }: { email?: string }) {
  const [state, action, pending] = useActionState<VerifyOtpState, FormData>(verifyOtpAction, { status: "idle" });

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
        <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-white">
          <Icon name="check" className="size-5" strokeWidth={2.5} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink-950">تم تأكيد بريدك وإنشاء حسابك</h2>
        <p className="mt-2 leading-7 text-ink-700">
          أرسلنا بيانات الدخول (البريد وكلمة المرور) إلى <bdi className="font-semibold text-ink-950">{state.email}</bdi>. استخدمها لتسجيل الدخول إلى لوحة
          أكاديميتك.
        </p>
        <Button href="/login" size="lg" className="mt-6 w-full" withArrow>
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  const email = state.status === "error" ? state.email : initialEmail;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
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
      <Field label="رمز التحقق (OTP)" htmlFor="otp-code" error={fieldErrors?.otp} hint="الرمز صالح لمدة 5 دقائق من وقت إرساله.">
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
        {pending ? "جارٍ التأكيد…" : "تأكيد وإنشاء الحساب"}
      </Button>
    </form>
  );
}
