import type { NextRequest } from "next/server";

/**
 * `ahmed.myacademy.com/dashboard` is not the owner dashboard. Owners sign in and
 * manage their academy on the platform (`myacademy.com/dashboard`), where the
 * academy comes from their account — so this only forwards them there.
 *
 * Done in a route handler rather than proxy.ts: the proxy turns same-host
 * redirects into relative ones, which would loop on the subdomain locally.
 */
async function forward(request: NextRequest, { params }: RouteContext<"/sites/[slug]/dashboard/[[...path]]">) {
  const { slug, path } = await params;
  const host = request.headers.get("host") ?? "";
  const rootHost = host.toLowerCase().startsWith(`${slug}.`) ? host.slice(slug.length + 1) : host;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const target = `${proto}://${rootHost}/dashboard${path?.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}`;
  return new Response(null, { status: 307, headers: { Location: target } });
}

export { forward as GET, forward as HEAD };
