"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { PUBLIC_API_URL } from "@/lib/academy/config";
import { homePathFor, safeNext, sharesApiDomain, type Role } from "@/lib/auth/session";
import type { DemoAccount } from "@/lib/auth/users";
import { loginAction, type LoginState } from "./actions";
import { DemoAccounts } from "./DemoAccounts";

/**
 * POST /auth/login straight from the browser (docs/auth-api.md), so the API's
 * own Set-Cookie lands in the browser. Resolves to where to go next, or to the
 * state to show.
 */
async function signInWithApi(email: string, password: string, next: string): Promise<LoginState | { status: "ok"; href: string }> {
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
    return { status: "error", message: "تعذّر تسجيل الدخول الآن. حاول مرة أخرى بعد قليل.", email };
  }
  if (res.status === 400 || res.status === 401) return { status: "error", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", email };
  if (res.status === 403) return { status: "error", message: "حسابك موقوف حالياً. تواصل مع فريق My Academy.", email };
  if (!res.ok) return { status: "error", message: "تعذّر تسجيل الدخول الآن. حاول مرة أخرى بعد قليل.", email };

  const { user } = (await res.json()) as { user: { role: Role } };
  const home = homePathFor(user.role);
  // Students sign in on their academy's own site, not on the platform.
  if (!home) return { status: "student", email, academyLoginUrl: "/" };
  return { status: "ok", href: safeNext(next, home) };
}

export function LoginForm({ next, demo }: { next?: string; demo?: { accounts: DemoAccount[]; password: string } }) {
  const [serverState, action, serverPending] = useActionState<LoginState, FormData>(loginAction, { status: "idle" });
  const [direct, setDirect] = useState<{ state?: LoginState; pending: boolean }>({ pending: false });

  const state = direct.state ?? serverState;
  const pending = serverPending || direct.pending;
  const email = state.status === "idle" ? undefined : state.email;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Off the API's domain (e.g. localhost) its CORS and cookie domain rule the browser out: the server action signs in instead.
    if (!sharesApiDomain(PUBLIC_API_URL, window.location.hostname)) return;
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setDirect({ pending: true });
    const result = await signInWithApi(String(fd.get("email") ?? "").trim(), String(fd.get("password") ?? ""), next ?? "");
    // A full navigation, so the server renders the dashboard with the new session cookie.
    if (result.status === "ok") return window.location.assign(result.href);
    setDirect({ state: result, pending: false });
  };

  return (
    <>
      <form action={action} onSubmit={onSubmit} className="flex flex-col gap-5">
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
