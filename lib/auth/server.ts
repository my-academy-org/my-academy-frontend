import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { backendCurrentUser } from "./backend";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SECONDS, homePathFor, SESSION_COOKIE, verifySession, type Role, type Session } from "./session";

/** The backend session cookie of the current request (server components / actions / route handlers only). */
export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Current session (server components / actions only), once per request.
 *
 * With a backend, the API is the authority: the `access_token` cookie is
 * validated with GET /auth/me. Without one, it is the signed demo cookie.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!ACADEMY_API_URL) return verifySession((await cookies()).get(SESSION_COOKIE)?.value);

  const token = await getAccessToken();
  const user = token ? await backendCurrentUser(token) : null;
  if (!user) return null;
  return {
    sub: String(user.id),
    role: user.role,
    name: user.name ?? user.email,
    email: user.email,
    tenantId: user.tenantId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
  };
});

/**
 * Origin of an academy's public site, derived from the current main-domain host:
 * localhost:3000 → http://ahmed.localhost:3000, myacademy.com → https://ahmed.myacademy.com
 */
export async function academyOrigin(slug: string) {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${slug}.${host}`;
}

/** Destination for a signed-in user: their dashboard, or their academy's student area. */
export async function homeFor(session: Session) {
  return homePathFor(session.role) ?? (session.academySlug ? `${await academyOrigin(session.academySlug)}/student` : "/");
}

/**
 * Authoritative guard for protected layouts. Unauthenticated → /login;
 * authenticated with another role → that role's own home.
 */
export async function requireRole(role: Role, next: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (session.role !== role) redirect(await homeFor(session));
  return session;
}
