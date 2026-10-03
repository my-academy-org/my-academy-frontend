import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";

/** Sign out (POST only, so a link or prefetch can't log the user out). */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  return clearSession(response, request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
}
