"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { academyOrigin } from "@/lib/auth/server";
import { ACCESS_TOKEN_COOKIE, homePathFor, safeNext, SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/auth/session";
import { authenticate, DEMO_AUTH, DEMO_PASSWORD } from "@/lib/auth/users";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string; email?: string }
  /** Students sign in on their academy's own site, not on the platform. */
  | { status: "student"; academyLoginUrl: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server-side sign-in: the demo accounts, and the backend whenever the page
 * isn't on the API's own domain (see LoginForm for the direct browser path).
 */
export async function loginAction(_: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim();
  // One-click demo sign-in (only without a backend): the password stays on the server.
  const password = DEMO_AUTH && fd.get("demo") === "1" ? DEMO_PASSWORD : String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");

  if (!EMAIL_RE.test(email) || !password) return { status: "error", message: "أدخل البريد الإلكتروني وكلمة المرور.", email };

  const result = await authenticate(email, password);
  if (!result.ok) {
    const message = {
      invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      "account-suspended": "حسابك موقوف حالياً. تواصل مع فريق My Academy.",
      "academy-suspended": "أكاديميتك موقوفة حالياً. تواصل مع فريق My Academy.",
      unavailable: "تعذّر تسجيل الدخول الآن. حاول مرة أخرى بعد قليل.",
    }[result.reason];
    return { status: "error", message, email };
  }

  const { user, accessToken } = result;
  const home = homePathFor(user.role);
  if (!home) {
    return {
      status: "student",
      email,
      academyLoginUrl: user.academySlug ? `${await academyOrigin(user.academySlug)}/login` : "/",
    };
  }

  const jar = await cookies();
  // No `domain`: the cookie stays on the platform host and is never sent to academy subdomains.
  const options = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const;
  if (accessToken) {
    // Sign-in ran on the server, so the API's Set-Cookie never reached the browser: carry its session cookie over.
    jar.set(ACCESS_TOKEN_COOKIE, accessToken.value, { ...options, maxAge: accessToken.maxAge });
    jar.delete(SESSION_COOKIE);
  } else {
    jar.set(SESSION_COOKIE, await signSession(user), { ...options, maxAge: SESSION_TTL_SECONDS });
  }
  redirect(safeNext(next, home));
}
