"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export function LoginForm() {
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        // Auth isn't wired yet — connect to the platform's sign-in endpoint.
      }}
    >
      <Field label="البريد الإلكتروني" htmlFor="login-email">
        <Input id="login-email" name="email" type="email" required dir="ltr" autoComplete="email" placeholder="name@example.com" className="text-start" />
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
      <Button type="submit" size="lg" className="mt-2 w-full">
        تسجيل الدخول
      </Button>
    </form>
  );
}
