/**
 * Session model shared by the proxy and the server.
 *
 * With a backend (ACADEMY_API_URL) the session is the API's own httpOnly
 * `access_token` cookie: the server forwards it on every API call and
 * GET /auth/me says who the user is (lib/auth/server.ts, docs/auth-api.md).
 *
 * Without one (demo sign-in), it is a signed token (HMAC-SHA256) in an httpOnly
 * cookie on the main platform domain only. It works in both the proxy and
 * server components (Web Crypto only) and is tamper-proof, so role and academy
 * can't be changed client-side.
 */

export type Role = "SUPER_ADMIN" | "ACADEMY_ADMIN" | "STUDENT";

export interface Session {
  /** User id. */
  sub: string;
  role: Role;
  name: string;
  email: string;
  /** The single academy this user belongs to (ACADEMY_ADMIN / STUDENT). Never taken from the URL. */
  academyId?: string;
  academySlug?: string;
  /** Backend tenant of an ACADEMY_ADMIN / STUDENT (null for SUPER_ADMIN). Set from GET /auth/me. */
  tenantId?: number | null;
  /** Expiry, seconds since epoch. */
  exp: number;
}

/** Demo sign-in session (no backend). */
export const SESSION_COOKIE = "ma_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** The backend's session cookie, set by POST /auth/login. Never read or written from client code. */
export const ACCESS_TOKEN_COOKIE = "access_token";
/** The backend session lasts one hour, with no refresh token. */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

const DEV_SECRET = "dev-only-insecure-secret-change-me";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production.");
  }
  return DEV_SECRET;
}

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

async function key() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(data: Omit<Session, "exp">, ttl = SESSION_TTL_SECONDS): Promise<string> {
  const payload: Session = { ...data, exp: Math.floor(Date.now() / 1000) + ttl };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), encoder.encode(body)));
  return `${body}.${toBase64Url(signature)}`;
}

/** Returns the session if the token is authentic and unexpired, else null. */
export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await key(), fromBase64Url(signature), encoder.encode(body));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Session;
    if (!session.exp || session.exp < Date.now() / 1000) return null;
    if (session.role === "ACADEMY_ADMIN" && !session.academyId) return null;
    return session;
  } catch {
    return null;
  }
}

/** Where each role lands after signing in on the main domain. */
export function homePathFor(role: Role) {
  return role === "SUPER_ADMIN" ? "/super-admin" : role === "ACADEMY_ADMIN" ? "/dashboard" : null;
}
