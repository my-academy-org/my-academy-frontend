import { ACADEMY_API_URL } from "@/lib/academy/config";
import { sampleAcademies } from "@/lib/admin/fixtures";
import { backendLogin } from "./backend";
import type { Role, Session } from "./session";

/**
 * Credential check for the main-domain login.
 *
 * With a backend (ACADEMY_API_URL): POST /auth/login → { user } plus the
 * `access_token` session cookie (docs/auth-api.md). The backend decides the role.
 * Without one: a small built-in demo directory so the flow can be exercised locally.
 */

type AuthUser = Omit<Session, "exp">;

/** Demo sign-in is only active while no backend is configured; it disappears once ACADEMY_API_URL is set. */
export const DEMO_AUTH = !ACADEMY_API_URL;
export const DEMO_PASSWORD = "demo1234";

/** Demo accounts. Academy association comes from the account, exactly like the real API. */
const demoUsers: { email: string; role: Role; name: string; academyId?: string; note?: string }[] = [
  { email: "admin@myacademy.com", role: "SUPER_ADMIN", name: "مشرف المنصة" },
  { email: "ahmed@example.com", role: "ACADEMY_ADMIN", name: "م. أحمد سامي", academyId: "a-1", note: "خطة Pro" },
  { email: "mohamed@example.com", role: "ACADEMY_ADMIN", name: "أ. محمد عبد الرحمن", academyId: "a-2", note: "خطة Basic" },
  { email: "ali@example.com", role: "ACADEMY_ADMIN", name: "أ. علي حسن", academyId: "a-3", note: "خطة Pro" },
  { email: "laila@example.com", role: "ACADEMY_ADMIN", name: "أ. ليلى منصور", academyId: "a-5", note: "أكاديمية موقوفة — يُرفض الدخول" },
  { email: "student@example.com", role: "STUDENT", name: "طالب تجريبي", academyId: "a-1", note: "يُوجَّه إلى موقع أكاديميته" },
];

export type DemoAccount = { email: string; role: Role; name: string; academy?: string; note?: string };

/** Accounts listed on the login page in demo mode (empty once a backend is connected). */
export function demoAccounts(): DemoAccount[] {
  if (!DEMO_AUTH) return [];
  return demoUsers.map(({ email, role, name, academyId, note }) => ({
    email,
    role,
    name,
    note,
    academy: sampleAcademies.find((a) => a.id === academyId)?.name,
  }));
}

export type AuthResult =
  /** `accessToken` is the backend session cookie to store; absent for the demo sign-in. */
  | { ok: true; user: AuthUser; accessToken?: { value: string; maxAge: number } }
  | { ok: false; reason: "invalid" | "account-suspended" | "academy-suspended" | "unavailable" };

export async function authenticate(email: string, password: string): Promise<AuthResult> {
  if (ACADEMY_API_URL) {
    const result = await backendLogin(email, password);
    if (!result.ok) return result;
    const { user, accessToken } = result;
    // The login response has no display name; GET /auth/me provides it once signed in.
    return { ok: true, accessToken, user: { sub: String(user.id), role: user.role, name: user.name ?? user.email, email: user.email, tenantId: user.tenantId } };
  }

  const user = demoUsers.find((u) => u.email === email.toLowerCase());
  if (!user || password !== DEMO_PASSWORD) return { ok: false, reason: "invalid" };
  const academy = user.academyId ? sampleAcademies.find((a) => a.id === user.academyId) : undefined;
  if (user.academyId && !academy) return { ok: false, reason: "invalid" };
  if (academy?.status === "SUSPENDED") return { ok: false, reason: "academy-suspended" };
  return {
    ok: true,
    user: { sub: `u-${user.email}`, role: user.role, name: user.name, email: user.email, academyId: academy?.id, academySlug: academy?.slug },
  };
}

/** The academy (slug) owned by a signed-in ACADEMY_ADMIN — resolved from the account, never from the request URL. */
export async function ownedAcademySlug(session: Session): Promise<string | null> {
  if (session.role !== "ACADEMY_ADMIN") return null;
  // The backend identifies the owner's academy by `tenantId` only; no documented endpoint resolves it to a slug yet.
  if (ACADEMY_API_URL) return null;
  return sampleAcademies.find((a) => a.id === session.academyId)?.slug ?? null;
}
