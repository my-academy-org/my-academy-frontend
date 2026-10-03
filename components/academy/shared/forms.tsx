"use client";

import Link from "next/link";
import { useActionState, useId, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  contactAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  type FormState,
} from "@/lib/academy/actions";
import { academyRoutes } from "@/lib/academy/nav";

/**
 * Class names a template supplies to skin the shared forms.
 * The forms' behaviour (validation, submission, tenant) is identical across templates.
 */
export type FormKit = {
  form: string;
  field: string;
  label: string;
  input: string;
  hint: string;
  error: string;
  button: string;
  link: string;
  alertSuccess: string;
  alertError: string;
  muted: string;
};

const idle: FormState = { status: "idle" };

function useFieldError(state: FormState) {
  return (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
}

/** React resets forms after an action; restore non-secret values on error. */
function useValue(state: FormState) {
  return (name: string) => (state.status === "error" ? state.values?.[name] : undefined);
}

function Alert({ state, kit }: { state: FormState; kit: FormKit }) {
  if (state.status === "idle") return null;
  const ok = state.status === "success";
  return (
    <div role={ok ? "status" : "alert"} className={ok ? kit.alertSuccess : kit.alertError}>
      <Icon name={ok ? "check" : "x"} className="mt-0.5 size-4 shrink-0" />
      <span>{state.message}</span>
    </div>
  );
}

function Field({
  kit,
  label,
  name,
  error,
  hint,
  children,
}: {
  kit: FormKit;
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = `${useId()}-${name}`;
  const msgId = `${id}-msg`;
  return (
    <div className={kit.field}>
      <label htmlFor={id} className={kit.label}>
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? msgId : undefined })}
      {error ? (
        <p id={msgId} className={kit.error}>{error}</p>
      ) : (
        hint && <p id={msgId} className={kit.hint}>{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function LoginForm({ kit }: { kit: FormKit }) {
  const [state, action, pending] = useActionState(loginAction, idle);
  const err = useFieldError(state);
  const val = useValue(state);
  return (
    <form action={action} className={kit.form} noValidate>
      <Alert state={state} kit={kit} />
      <Field kit={kit} label="البريد الإلكتروني" name="email" error={err("email")}>
        {(p) => <input {...p} name="email" defaultValue={val("email")} type="email" autoComplete="email" dir="ltr" required className={`${kit.input} text-start`} placeholder="name@example.com" />}
      </Field>
      <Field kit={kit} label="كلمة المرور" name="password" error={err("password")}>
        {(p) => <input {...p} name="password" type="password" autoComplete="current-password" dir="ltr" required className={`${kit.input} text-start`} />}
      </Field>
      <div className="flex justify-end">
        <Link href={academyRoutes.forgotPassword} className={kit.link}>
          نسيت كلمة المرور؟
        </Link>
      </div>
      <button type="submit" disabled={pending} className={kit.button}>
        {pending ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}

export function RegisterForm({ kit, academyName }: { kit: FormKit; academyName: string }) {
  const [state, action, pending] = useActionState(registerAction, idle);
  const err = useFieldError(state);
  const val = useValue(state);
  if (state.status === "success") {
    return (
      <div className={kit.form}>
        <Alert state={state} kit={kit} />
        <Link href={academyRoutes.login} className={kit.button}>
          الانتقال إلى تسجيل الدخول
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className={kit.form} noValidate>
      <Alert state={state} kit={kit} />
      <Field kit={kit} label="الاسم الكامل" name="name" error={err("name")}>
        {(p) => <input {...p} name="name" defaultValue={val("name")} autoComplete="name" required className={kit.input} />}
      </Field>
      <Field kit={kit} label="البريد الإلكتروني" name="email" error={err("email")}>
        {(p) => <input {...p} name="email" defaultValue={val("email")} type="email" autoComplete="email" dir="ltr" required className={`${kit.input} text-start`} placeholder="name@example.com" />}
      </Field>
      <Field kit={kit} label="رقم الجوال (اختياري)" name="phone" error={err("phone")}>
        {(p) => <input {...p} name="phone" defaultValue={val("phone")} type="tel" autoComplete="tel" dir="ltr" className={`${kit.input} text-start`} />}
      </Field>
      <div className="grid gap-[inherit] sm:grid-cols-2">
        <Field kit={kit} label="كلمة المرور" name="password" error={err("password")} hint="8 أحرف على الأقل">
          {(p) => <input {...p} name="password" type="password" autoComplete="new-password" dir="ltr" required className={`${kit.input} text-start`} />}
        </Field>
        <Field kit={kit} label="تأكيد كلمة المرور" name="confirmPassword" error={err("confirmPassword")}>
          {(p) => <input {...p} name="confirmPassword" type="password" autoComplete="new-password" dir="ltr" required className={`${kit.input} text-start`} />}
        </Field>
      </div>
      <p className={kit.muted}>سيُنشأ حسابك كطالب في {academyName}.</p>
      <button type="submit" disabled={pending} className={kit.button}>
        {pending ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm({ kit }: { kit: FormKit }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, idle);
  const err = useFieldError(state);
  const val = useValue(state);
  return (
    <form action={action} className={kit.form} noValidate>
      <Alert state={state} kit={kit} />
      <Field kit={kit} label="البريد الإلكتروني" name="email" error={err("email")}>
        {(p) => <input {...p} name="email" defaultValue={val("email")} type="email" autoComplete="email" dir="ltr" required className={`${kit.input} text-start`} placeholder="name@example.com" />}
      </Field>
      <button type="submit" disabled={pending} className={kit.button}>
        {pending ? "جارٍ الإرسال…" : "إرسال رابط إعادة التعيين"}
      </button>
    </form>
  );
}

export function ContactForm({ kit }: { kit: FormKit }) {
  const [state, action, pending] = useActionState(contactAction, idle);
  const err = useFieldError(state);
  const val = useValue(state);
  if (state.status === "success") return <Alert state={state} kit={kit} />;
  return (
    <form action={action} className={kit.form} noValidate>
      <Alert state={state} kit={kit} />
      <div className="grid gap-[inherit] sm:grid-cols-2">
        <Field kit={kit} label="الاسم" name="name" error={err("name")}>
          {(p) => <input {...p} name="name" defaultValue={val("name")} autoComplete="name" required className={kit.input} />}
        </Field>
        <Field kit={kit} label="البريد الإلكتروني" name="email" error={err("email")}>
          {(p) => <input {...p} name="email" defaultValue={val("email")} type="email" autoComplete="email" dir="ltr" required className={`${kit.input} text-start`} />}
        </Field>
      </div>
      <Field kit={kit} label="رقم الجوال (اختياري)" name="phone">
        {(p) => <input {...p} name="phone" defaultValue={val("phone")} type="tel" dir="ltr" className={`${kit.input} text-start`} />}
      </Field>
      <Field kit={kit} label="رسالتك" name="message" error={err("message")}>
        {(p) => <textarea {...p} name="message" defaultValue={val("message")} rows={5} required className={`${kit.input} h-auto py-3 leading-7`} />}
      </Field>
      <button type="submit" disabled={pending} className={kit.button}>
        {pending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
