"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState, type ReactNode } from "react";
import { verifyOtpAction } from "@/app/verify-otp/actions";
import { Icon } from "@/components/ui/Icon";
import {
  contactAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  studentSessionAction,
  type FormState,
} from "@/lib/academy/actions";
import { PUBLIC_API_URL } from "@/lib/academy/config";
import { academyRoutes } from "@/lib/academy/nav";
import { confirmOtp, otpLifetime, type VerifyOtpState } from "@/lib/auth/otp";
import { sharesApiDomain } from "@/lib/auth/session";
import { loginErrors } from "./auth";

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

/**
 * POST /auth/login straight from the browser (docs/auth-api.md §3), so the
 * API's own Set-Cookie lands in the browser. Resolves to the error to show, or
 * to null once a student of this academy is signed in.
 */
async function signInWithApi(email: string, password: string): Promise<FormState | null> {
  const fail = (reason: keyof typeof loginErrors): FormState => ({ status: "error", message: loginErrors[reason], values: { email } });
  let res: Response;
  try {
    res = await fetch(`${PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      // Only the documented fields: anything else is rejected with 400.
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return fail("unavailable");
  }
  if (res.status === 400 || res.status === 401) return fail("invalid");
  if (res.status === 403) return fail("account-suspended");
  if (!res.ok) return fail("unavailable");

  // The API signs in any account from any subdomain: the server checks it is a student of this academy.
  const session = await studentSessionAction().catch(() => ({ ok: false }));
  if (session.ok) return null;
  await fetch(`${PUBLIC_API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  return fail("other-academy");
}

export function LoginForm({ kit }: { kit: FormKit }) {
  const [serverState, action, serverPending] = useActionState(loginAction, idle);
  const [direct, setDirect] = useState<{ state?: FormState; pending: boolean }>({ pending: false });

  const state = direct.state ?? serverState;
  const pending = serverPending || direct.pending;
  const err = useFieldError(state);
  const val = useValue(state);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Off the API's domain (e.g. localhost) its CORS and cookie domain rule the browser out: the server action signs in instead.
    if (!sharesApiDomain(PUBLIC_API_URL, window.location.hostname)) return;
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setDirect({ pending: true });
    const failure = await signInWithApi(String(fd.get("email") ?? "").trim(), String(fd.get("password") ?? ""));
    // A full navigation, so the server renders the student area with the new session cookie.
    if (!failure) return window.location.assign(academyRoutes.student.dashboard);
    setDirect({ state: failure, pending: false });
  };

  return (
    <form action={action} onSubmit={onSubmit} className={kit.form} noValidate>
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

/** A new code can only be requested once the previous one has expired (5 minutes). */
const OTP_RESEND_SECONDS = 5 * 60;

/**
 * Step 2 of the student sign-up (docs/auth-api.md §3.2): confirms the emailed
 * code, which creates the account. `registration` is the submitted sign-up
 * form: the API has no resend route, a new code comes from `register` again.
 */
function OtpStep({ kit, registration, sent }: { kit: FormKit; registration: FormData; sent: Extract<FormState, { status: "success" }> }) {
  const email = String(registration.get("email") ?? "").trim();
  const [notice, setNotice] = useState<FormState>(sent);
  const [state, setState] = useState<VerifyOtpState>({ status: "idle" });
  const [pending, setPending] = useState(false);
  const [wait, setWait] = useState(sent.otp === "sent" ? OTP_RESEND_SECONDS : 0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set("email", email);
    fd.set("role", "STUDENT");
    setPending(true);
    // On the API's own domain the browser calls it directly; elsewhere (e.g. localhost, which its CORS excludes) the server action does.
    const result = sharesApiDomain(PUBLIC_API_URL, window.location.hostname)
      ? await confirmOtp(PUBLIC_API_URL, "STUDENT", email, String(fd.get("otp") ?? "").replace(/\s/g, ""))
      : await verifyOtpAction({ status: "idle" }, fd);
    setState(result);
    setPending(false);
  };

  const resend = async () => {
    setPending(true);
    const result = await registerAction(idle, registration);
    if (result.status === "success" && result.otp === "sent") setWait(OTP_RESEND_SECONDS);
    setNotice(result);
    setState({ status: "idle" });
    setPending(false);
  };

  // Confirming doesn't sign the student in: they continue on the login page.
  if (state.status === "success") {
    return (
      <div className={kit.form}>
        <Alert state={{ status: "success", message: "تم تأكيد بريدك وتفعيل حسابك. يمكنك الآن تسجيل الدخول." }} kit={kit} />
        <Link href={academyRoutes.login} className={kit.button}>
          الانتقال إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  const otpError = state.status === "error" ? state.fieldErrors?.otp : undefined;
  return (
    <form onSubmit={verify} className={kit.form} noValidate>
      <Alert state={state.status === "error" && !otpError ? { status: "error", message: state.message } : notice} kit={kit} />
      <Field kit={kit} label="رمز التحقق" name="otp" error={otpError} hint={`الرمز صالح لمدة ${otpLifetime.STUDENT} من وقت إرساله.`}>
        {(p) => <input {...p} name="otp" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" dir="ltr" required autoFocus className={`${kit.input} text-center tracking-[0.4em]`} placeholder="123456" />}
      </Field>
      <button type="submit" disabled={pending} className={kit.button}>
        {pending ? "جارٍ التأكيد…" : "تأكيد وتفعيل الحساب"}
      </button>
      <p className={kit.muted}>
        لم يصلك الرمز؟{" "}
        {wait > 0 ? (
          <span>
            يمكنك طلب رمز جديد بعد <bdi>{Math.floor(wait / 60)}:{String(wait % 60).padStart(2, "0")}</bdi>
          </span>
        ) : (
          <button type="button" onClick={resend} disabled={pending} className={kit.link}>
            إعادة إرسال الرمز
          </button>
        )}
      </p>
    </form>
  );
}

export function RegisterForm({ kit, academyName }: { kit: FormKit; academyName: string }) {
  const [state, action, pending] = useActionState(registerAction, idle);
  const [submitted, setSubmitted] = useState<FormData | null>(null);
  const err = useFieldError(state);
  const val = useValue(state);
  if (state.status === "success" && state.otp && submitted) return <OtpStep kit={kit} registration={submitted} sent={state} />;
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
    <form action={action} onSubmit={(event) => setSubmitted(new FormData(event.currentTarget))} className={kit.form} noValidate>
      <Alert state={state} kit={kit} />
      <Field kit={kit} label="الاسم الكامل" name="name" error={err("name")}>
        {(p) => <input {...p} name="name" defaultValue={val("name")} autoComplete="name" required className={kit.input} />}
      </Field>
      <Field kit={kit} label="البريد الإلكتروني" name="email" error={err("email")}>
        {(p) => <input {...p} name="email" defaultValue={val("email")} type="email" autoComplete="email" dir="ltr" required className={`${kit.input} text-start`} placeholder="name@example.com" />}
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
