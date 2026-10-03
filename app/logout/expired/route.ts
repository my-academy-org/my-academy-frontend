import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Where the dashboards land when the backend answers 401 (the session lasts
 * one hour, with no refresh): drop the dead cookie and sign in again.
 * Nothing links here, so a prefetch can't sign the user out.
 */
export async function GET(request: NextRequest) {
  const login = new URL("/login", request.url);
  login.searchParams.set("next", "/super-admin");
  const response = NextResponse.redirect(login);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
