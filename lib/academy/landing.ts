import type { AcademySite, Feature, FeatureIcon, Qualification, TemplateId } from "./types";

/**
 * Landing Page API (docs/landing-page-api.md): the response of the public
 * GET /landing-page/:slug, the owner's admin record, and the mapping from the
 * public response to the `AcademySite` every template renders.
 */

export type BackendTemplateType = "MODERN" | "EDUCATION" | "CORPORATE";

/** Backend template type → the site template that renders it. */
export const TEMPLATE_BY_TYPE: Record<string, TemplateId> = { MODERN: "MODERN", EDUCATION: "ACADEMIC", CORPORATE: "PREMIUM" };

export interface LandingFeature {
  title: string;
  description?: string;
  icon?: string;
}

/** Every field is optional on the backend and comes back as null when unset. */
export interface LandingPageContent {
  heroTitle: string | null;
  heroDescription: string | null;
  heroImageUrl: string | null;
  aboutTitle: string | null;
  aboutDescription: string | null;
  instructorName: string | null;
  instructorBio: string | null;
  instructorImage: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  features: LandingFeature[] | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  footerText: string | null;
}

export interface LandingPageResponse {
  tenantId: number;
  academy: {
    name: string;
    description: string | null;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  template: { type: BackendTemplateType; name: string };
  /** Null until the page is created and published. */
  landingPage: LandingPageContent | null;
  /** PUBLISHED courses only, ordered by `order`. */
  courses: { id: number; title: string; description: string | null; imageUrl: string | null; order: number }[];
}

/** GET /landing-page (owner dashboard). */
export interface LandingPageAdmin extends LandingPageContent {
  id: number;
  academyId: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  academy: { id: number; name: string; tenant: { slug: string } };
}

/** Body of POST /landing-page and PATCH /landing-page/:id — only these keys are accepted (anything else is a 400). */
export type LandingPageInput = Partial<{ [K in keyof LandingPageContent]: LandingPageContent[K] } & { published: boolean }>;

export const LANDING_FIELDS: (keyof LandingPageContent)[] = [
  "heroTitle",
  "heroDescription",
  "heroImageUrl",
  "aboutTitle",
  "aboutDescription",
  "instructorName",
  "instructorBio",
  "instructorImage",
  "qualifications",
  "experienceYears",
  "features",
  "contactEmail",
  "contactPhone",
  "contactAddress",
  "footerText",
];

/** Only the documented body keys: any other key (id, academyId, createdAt…) is rejected with 400. */
export function pickLandingInput(input: LandingPageInput): LandingPageInput {
  const body: Record<string, unknown> = {};
  for (const key of [...LANDING_FIELDS, "published"] as const) {
    if (input[key] !== undefined) body[key] = input[key];
  }
  return body as LandingPageInput;
}

export type LandingFailure = {
  ok: false;
  /** HTTP status, or 0 when the API couldn't be reached. */
  status: number;
  message: string;
  /** The academy's plan doesn't allow a landing page (BASIC). */
  upgrade?: boolean;
};

/** Outcome of a landing-page write; `page` is undefined when the write succeeded but reloading the page failed. */
export type LandingResult = { ok: true; page?: LandingPageAdmin | null } | LandingFailure;

const FEATURE_ICONS = new Set<FeatureIcon>(["video", "exam", "progress", "support", "certificate", "schedule", "materials", "community", "device"]);

const text = (value: string | null | undefined) => value?.trim() || undefined;
const media = (url: string | null | undefined) => (text(url) ? { url: url!.trim() } : undefined);

/** `features` is free-form JSON on the backend: keep only items with a title. */
function toFeatures(items: unknown): Feature[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item: Partial<LandingFeature> | null) => {
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    if (!title) return [];
    const icon = FEATURE_ICONS.has(item!.icon as FeatureIcon) ? (item!.icon as FeatureIcon) : undefined;
    return [{ title, description: typeof item!.description === "string" ? item!.description : "", icon }];
  });
}

/** `qualifications` is one text field: one qualification per line. */
function toQualifications(value: string | null): Qualification[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((title) => ({ title }));
}

/**
 * The public response as an `AcademySite`. Missing landing-page content falls
 * back to the academy's own details, so an unpublished page still renders a
 * default site; templates hide the sections that stay empty.
 */
export function toAcademySite(slug: string, data: LandingPageResponse): AcademySite {
  const { academy, landingPage: lp, courses } = data;
  const name = academy.name;
  const description = text(academy.description);

  return {
    // The plan isn't in the public response; only PRO academies can create a page.
    tenant: { slug, name, plan: lp ? "PRO" : "BASIC", status: "ACTIVE" },
    academy: {
      logo: media(academy.logoUrl),
      template: TEMPLATE_BY_TYPE[data.template?.type] ?? "MODERN",
      contact: {
        email: text(lp?.contactEmail) ?? text(academy.email),
        phone: text(lp?.contactPhone) ?? text(academy.phone),
        address: text(lp?.contactAddress) ?? text(academy.address),
      },
    },
    landing: {
      hero: {
        title: text(lp?.heroTitle) ?? name,
        description: text(lp?.heroDescription) ?? description ?? "",
        image: media(lp?.heroImageUrl),
      },
      about: {
        title: text(lp?.aboutTitle) ?? `عن ${name}`,
        description: text(lp?.aboutDescription) ?? description ?? "",
      },
      teacher: {
        name: text(lp?.instructorName) ?? name,
        bio: text(lp?.instructorBio) ?? "",
        image: media(lp?.instructorImage),
        qualifications: toQualifications(lp?.qualifications ?? null),
        experienceYears: lp?.experienceYears ?? undefined,
      },
      features: toFeatures(lp?.features),
      footer: { tagline: text(lp?.footerText) },
    },
    courses: [...courses]
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        id: String(c.id),
        slug: String(c.id),
        title: c.title,
        shortDescription: text(c.description) ?? "",
        description: text(c.description) ?? "",
        image: media(c.imageUrl),
      })),
  };
}

/** Stand-in for an academy the API reports as INACTIVE/SUSPENDED (403): only enough to render the "unavailable" page. */
export function unavailableSite(slug: string): AcademySite {
  return {
    tenant: { slug, name: slug, plan: "BASIC", status: "SUSPENDED" },
    academy: { template: "MODERN", contact: {} },
    landing: {
      hero: { title: slug, description: "" },
      about: { title: "", description: "" },
      teacher: { name: slug, bio: "", qualifications: [] },
      features: [],
      footer: {},
    },
    courses: [],
  };
}
