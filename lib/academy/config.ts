import type { TemplateId } from "./types";

/** Production root domain; tenants live on `<slug>.<ROOT_DOMAIN>`. */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "myacademy.com";

/** Hosts treated as the root (marketing) site in local development. */
export const DEV_ROOT_DOMAIN = "localhost";

/** Subdomains that are never academies. */
export const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "dashboard"]);

/** Set by proxy.ts on rewritten requests — the only trusted source of the current tenant. */
export const TENANT_HEADER = "x-academy-slug";

/** Optional template override (`?template=modern`), for previewing one academy in every template. */
export const TEMPLATE_PREVIEW_HEADER = "x-academy-template-preview";
export const TEMPLATE_PREVIEW_COOKIE = "ma_template_preview";

export const TEMPLATE_IDS: TemplateId[] = ["MODERN", "ACADEMIC", "PREMIUM"];

export function parseTemplateId(value: string | null | undefined): TemplateId | null {
  const upper = value?.toUpperCase();
  return TEMPLATE_IDS.find((t) => t === upper) ?? null;
}

/** Internal route segment the proxy rewrites tenant requests into. */
export const SITES_SEGMENT = "sites";

/** Backend base URL. When unset, the bundled sample academies are used. */
export const ACADEMY_API_URL = process.env.ACADEMY_API_URL;
