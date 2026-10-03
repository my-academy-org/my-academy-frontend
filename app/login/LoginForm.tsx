"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import type { DemoAccount } from "@/lib/auth/users";
import { loginAction, type LoginState } from "./actions";
import { DemoAccounts } from "./DemoAccounts";

export function LoginForm({ next, demo }: { next?: string; demo?: { accounts: DemoAccount[]; password: string } }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { status: "idle" });
  const email = state.status === "idle" ? undefined : state.email;

  return (
    <>
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next ?? ""} />
        {state.status === "error" && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 ring-1 ring-red-100">
            {state.message}
          </p>
        )}
        {state.status === "student" && (
          <p role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-800 ring-1 ring-brand-100">
            حسابك حساب طالب. سجّل الدخول من موقع أكاديميتك:{" "}
            <a href={state.academyLoginUrl} className="font-bold underline">
              الانتقال إلى أكاديميتي
            </a>
          </p>
        )}
        <Field label="البريد الإلكتروني" htmlFor="login-email">
          <Input id="login-email" name="email" type="email" required dir="ltr" autoComplete="email" placeholder="name@example.com" className="text-start" defaultValue={email} key={email} />
        </Field>
        <Field label="كلمة المرور" htmlFor="login-password">
          <Input id="login-password" name="password" type="password" required autoComplete="current-password" dir="ltr" className="text-start" />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-600">
            <input type="checkbox" name="remember" className="size-4 rounded accent-brand-700" />
            تذكّرني
          </label>
          <a href="#" className="font-semibold text-brand-700 hover:text-brand-800">
            نسيت كلمة المرور؟
          </a>
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
          {pending ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
        </Button>
      </form>
      {demo && demo.accounts.length > 0 && <DemoAccounts accounts={demo.accounts} password={demo.password} action={action} next={next} pending={pending} />}
    </>
  );
}
