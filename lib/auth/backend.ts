import { ACADEMY_API_URL } from "@/lib/academy/config";
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SECONDS, SESSION_COOKIE, type Role } from "./session";

/**
 * Auth endpoints of the backend (docs/auth-api.md), called from the server.
 *
 * The API authenticates with an httpOnly `access_token` cookie, which the
 * server sends back in a `Cookie` header on every server-side API call.
 *
 * On the platform's own domain the browser signs in against the API directly
 * (app/login/LoginForm.tsx) and the API's domain-wide cookie reaches this
 * server. Anywhere else (e.g. localhost, which the API's CORS and cookie
 * domain exclude) sign-in runs here instead, and the cookie is carried over by
 * hand: read from the login response and stored on our own host.
 */

export type BackendUser = { id: number; email: string; role: Role; tenantId: number | null; name?: string; status?: string };

/** The value to forward to the API as the session cookie. */
export const accessTokenHeader = (token: string) => ({ cookie: `${ACCESS_TOKEN_COOKIE}=${token}` });

/** Pulls `access_token` (and its lifetime) out of a response's Set-Cookie headers. */
function accessTokenFrom(res: Response) {
  for (const header of res.headers.getSetCookie()) {
    const [pair, ...attributes] = header.split(";");
    const eq = pair.indexOf("=");
    if (pair.slice(0, eq).trim() !== ACCESS_TOKEN_COOKIE) continue;
    const value = pair.slice(eq + 1).trim();
    if (!value) continue;
    const maxAge = Number(
      attributes
        .map((a) => a.trim().split("="))
        .find(([name]) => name.toLowerCase() === "max-age")?.[1],
    );
    return { value, maxAge: Number.isFinite(maxAge) && maxAge > 0 ? maxAge : ACCESS_TOKEN_TTL_SECONDS };
  }
  return null;
}

export type BackendLogin =
  | { ok: true; user: BackendUser; accessToken: { value: string; maxAge: number } }
  | { ok: false; reason: "invalid" | "account-suspended" | "unavailable" };

/** POST /auth/login — one route for every role. */
export async function backendLogin(email: string, password: string): Promise<BackendLogin> {
  try {
    const res = await fetch(`${ACADEMY_API_URL}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Only the documented fields: anything else is rejected with 400.
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    // 400 is a validation error (e.g. a password shorter than 6 characters).
    if (res.status === 400 || res.status === 401) return { ok: false, reason: "invalid" };
    if (res.status === 403) return { ok: false, reason: "account-suspended" };
    if (!res.ok) {
      console.error(`[auth] POST /auth/login → ${res.status}`, await res.text().catch(() => ""));
      return { ok: false, reason: "unavailable" };
    }

    const accessToken = accessTokenFrom(res);
    const { user } = (await res.json()) as { user: BackendUser };
    if (!accessToken || !user) {
      console.error(`[auth] POST /auth/login → ${res.status} but ${accessToken ? "no user in the body" : "no access_token in Set-Cookie"}`);
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, user, accessToken };
  } catch (error) {
    console.error("[auth] POST /auth/login failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

/** GET /auth/me — null when there is no valid session (missing, expired, deleted or suspended account). */
export async function backendCurrentUser(token: string): Promise<BackendUser | null> {
  try {
    const res = await fetch(`${ACADEMY_API_URL}/auth/me`, { headers: accessTokenHeader(token), cache: "no-store" });
    if (!res.ok) {
      console.error(`[auth] GET /auth/me → ${res.status}`, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as { user?: BackendUser };
    if (!data.user) console.error("[auth] GET /auth/me → 200 without a user", Object.keys(data));
    return data.user ?? null;
  } catch (error) {
    console.error("[auth] GET /auth/me failed", error);
    return null;
  }
}

export type OtpResult = { ok: true } | { ok: false; reason: "expired" | "invalid" | "unavailable" };

/**
 * POST /auth/academy-admin/verify-otp — second step of adding an academy owner.
 * Needs no session: it creates the account (INACTIVE until first sign-in) and
 * emails the credentials. OTP failures come back as 422.
 */
export async function verifyAcademyAdminOtp(email: string, otp: string): Promise<OtpResult> {
  try {
    const res = await fetch(`${ACADEMY_API_URL}/auth/academy-admin/verify-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // `otp` is sent as a string.
      body: JSON.stringify({ email, otp }),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    const { message } = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const text = Array.isArray(message) ? message.join(" ") : (message ?? "");
    if (text.includes("expired")) return { ok: false, reason: "expired" };
    if (res.status === 422 || res.status === 400) return { ok: false, reason: "invalid" };
    console.error(`[auth] POST /auth/academy-admin/verify-otp → ${res.status}`, text);
    return { ok: false, reason: "unavailable" };
  } catch (error) {
    console.error("[auth] POST /auth/academy-admin/verify-otp failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

/**
 * POST /auth/logout — safe to call even when the session already expired.
 * Returns the API's own Set-Cookie headers (they clear `access_token` on the
 * API's cookie domain) so the caller can pass them on to the browser.
 */
export async function backendLogout(token: string | undefined): Promise<string[]> {
  try {
    const res = await fetch(`${ACADEMY_API_URL}/auth/logout`, { method: "POST", headers: token ? accessTokenHeader(token) : undefined, cache: "no-store" });
    return res.headers.getSetCookie();
  } catch {
    // The session cookie is dropped on our side regardless.
    return [];
  }
}

/**
 * Ends the session in the browser: drops our own cookies and, with a backend,
 * the API's domain-wide `access_token` (set when sign-in ran in the browser).
 * A browser ignores a forwarded Set-Cookie whose Domain doesn't cover this host.
 */
export async function clearSession(response: Response, token: string | undefined) {
  const forwarded = ACADEMY_API_URL ? await backendLogout(token) : [];
  for (const name of [SESSION_COOKIE, ACCESS_TOKEN_COOKIE]) {
    response.headers.append("set-cookie", `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  }
  for (const cookie of forwarded) response.headers.append("set-cookie", cookie);
  return response;
}
