import { RESERVED_SUBDOMAINS, ROOT_DOMAIN } from "@/lib/academy/config";
import type { TemplateId as PreviewTemplateId } from "@/lib/site";
import type { AcademyStatus, OwnerStatus, Plan, TemplateType } from "./types";

export { ROOT_DOMAIN };

export const academyStatusLabels: Record<AcademyStatus, string> = {
  ACTIVE: "نشطة",
  INACTIVE: "غير مفعّلة",
  SUSPENDED: "موقوفة",
};

export const ownerStatusLabels: Record<OwnerStatus, string> = {
  ACTIVE: "نشط",
  INACTIVE: "بانتظار الدخول",
  SUSPENDED: "موقوف",
};

export const planLabels: Record<Plan, string> = {
  BASIC: "Basic",
  PRO: "Pro",
};

/** Which marketing mockup renders a thumbnail of each template type. */
export const templatePreview: Record<TemplateType, PreviewTemplateId> = {
  MODERN: "modern",
  EDUCATION: "academic",
  CORPORATE: "premium",
};

export const academyUrl = (slug: string) => `${slug}.${ROOT_DOMAIN}`;

export { formatDate, formatDateTime, formatNumber } from "@/lib/format";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an Arabic error for an invalid subdomain, or null when it's usable. Uniqueness is checked by the API. */
export function slugError(slug: string): string | null {
  if (!slug) return "أدخل النطاق الفرعي للأكاديمية";
  if (slug.length < 3 || slug.length > 63) return "من 3 إلى 63 حرفاً";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "حروف إنجليزية صغيرة وأرقام وشرطة (-) فقط";
  if (RESERVED_SUBDOMAINS.has(slug)) return "هذا النطاق محجوز للمنصة";
  return null;
}

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");
}

/* ------------------------------------------------------------------ */
/* List filters carried in the URL (?status=…&search=…&page=…)         */
/* ------------------------------------------------------------------ */

type RawParam = string | string[] | undefined;

const STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export const textParam = (value: RawParam) => (typeof value === "string" ? value.trim() : "");

/** "" means "all". */
export function statusParam(value: RawParam): AcademyStatus | "" {
  return STATUSES.find((s) => s === value) ?? "";
}

/** A positive integer id as a string, or "". */
export function idParam(value: RawParam) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value) ? value : "";
}

export const pageParam = (value: RawParam) => Number(idParam(value)) || 1;
