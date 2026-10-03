import { NextResponse, type NextRequest } from "next/server";
import {
  ACADEMY_API_URL,
  DEV_ROOT_DOMAIN,
  parseTemplateId,
  RESERVED_SUBDOMAINS,
  ROOT_DOMAIN,
  SITES_SEGMENT,
  TEMPLATE_PREVIEW_COOKIE,
  TEMPLATE_PREVIEW_HEADER,
  TENANT_HEADER,
} from "@/lib/academy/config";
import { ACCESS_TOKEN_COOKIE, homePathFor, SESSION_COOKIE, verifySession } from "@/lib/auth/session";

/** Platform areas on the main domain and the role allowed in each. */
const PROTECTED = [
  { prefix: "/dashboard", role: "ACADEMY_ADMIN" },
  { prefix: "/super-admin", role: "SUPER_ADMIN" },
] as const;

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** `ahmed.myacademy.com` / `ahmed.localhost` → { tenant: "ahmed" }; root or reserved hosts → null. */
function tenantFromHost(host: string): { tenant: string } | null {
  const hostname = host.split(":")[0].toLowerCase();
  for (const root of [ROOT_DOMAIN, DEV_ROOT_DOMAIN]) {
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      if (!sub.includes(".") && !RESERVED_SUBDOMAINS.has(sub)) return { tenant: sub };
    }
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const match = tenantFromHost(request.headers.get("host") ?? "");

  // Root/marketing domain: the internal /sites tree must not be reachable directly.
  if (!match) {
    if (under(pathname, `/${SITES_SEGMENT}`)) {
      return new NextResponse(null, { status: 404 });
    }

    // Early gate for the dashboards (the layouts re-check on the server and resolve the academy).
    const area = PROTECTED.find((p) => under(pathname, p.prefix));
    if (area) {
      // With a backend, only the presence of its session cookie can be checked here; the layouts validate it with GET /auth/me.
      const session = ACADEMY_API_URL ? null : await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
      if (ACADEMY_API_URL ? !request.cookies.has(ACCESS_TOKEN_COOKIE) : !session) {
        const login = new URL("/login", request.url);
        login.searchParams.set("next", pathname);
        return NextResponse.redirect(login);
      }
      if (session && session.role !== area.role) {
        return NextResponse.redirect(new URL(homePathFor(session.role) ?? "/", request.url));
      }
    }
    // Never let a client-supplied tenant header through.
    const clean = new Headers(request.headers);
    clean.delete(TENANT_HEADER);
    clean.delete(TEMPLATE_PREVIEW_HEADER);
    return NextResponse.next({ request: { headers: clean } });
  }

  // Note: <slug>/dashboard is not a dashboard — app/sites/[slug]/dashboard/[[...path]]/route.ts sends it to the platform.
  const { tenant } = match;

  // Template preview: `?template=premium` sticks for the session, `?template=` clears it.
  const param = searchParams.get("template");
  const preview = param !== null ? parseTemplateId(param) : parseTemplateId(request.cookies.get(TEMPLATE_PREVIEW_COOKIE)?.value);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER, tenant);
  requestHeaders.delete(TEMPLATE_PREVIEW_HEADER);
  if (preview) requestHeaders.set(TEMPLATE_PREVIEW_HEADER, preview);

  const url = request.nextUrl.clone();
  url.pathname = `/${SITES_SEGMENT}/${tenant}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });

  if (param !== null) {
    if (preview) response.cookies.set(TEMPLATE_PREVIEW_COOKIE, preview, { path: "/", sameSite: "lax" });
    else response.cookies.delete(TEMPLATE_PREVIEW_COOKIE);
  }
  return response;
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/|favicon.ico|.*\\.[\\w]+$).*)"],
};
