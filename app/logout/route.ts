import { NextResponse, type NextRequest } from "next/server";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { backendLogout } from "@/lib/auth/backend";
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";

/** Sign out (POST only, so a link or prefetch can't log the user out). */
export async function POST(request: NextRequest) {
  if (ACADEMY_API_URL) await backendLogout(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
