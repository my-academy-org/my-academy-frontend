import { cache } from "react";
import { headers } from "next/headers";
import { ACADEMY_API_URL, parseTemplateId, TEMPLATE_PREVIEW_HEADER } from "./config";
import { fixtures } from "./fixtures";
import { toAcademySite, unavailableSite, type LandingPageResponse } from "./landing";
import type { AcademySite, Course, StudentSession } from "./types";

/** Cache tag of an academy's public data; the dashboard's landing-page actions invalidate it. */
export const academyTag = (slug: string) => `academy:${slug}`;

/**
 * Loads the public data for one academy. Deduplicated per request via
 * React `cache`, so layout, page and metadata share a single fetch.
 *
 * Backend contract (docs/landing-page-api.md §3): GET {ACADEMY_API_URL}/landing-page/{slug},
 * public. 404 → the tenant or its academy doesn't exist; 403 → the academy is
 * INACTIVE/SUSPENDED, rendered as "unavailable".
 */
export const getAcademySite = cache(async (slug: string): Promise<AcademySite | null> => {
  if (!ACADEMY_API_URL) return fixtures[slug] ?? null;

  const res = await fetch(`${ACADEMY_API_URL}/landing-page/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60, tags: [academyTag(slug)] },
  });
  if (res.status === 404) return null;
  if (res.status === 403) return unavailableSite(slug);
  if (!res.ok) throw new Error(`Failed to load academy "${slug}" (${res.status})`);
  return toAcademySite(slug, (await res.json()) as LandingPageResponse);
});

/**
 * The academy as it should be rendered for this request: identical data,
 * with the template swapped when a preview override is active.
 */
export const getRenderableSite = cache(async (slug: string): Promise<AcademySite | null> => {
  const site = await getAcademySite(slug);
  if (!site) return null;

  const preview = parseTemplateId((await headers()).get(TEMPLATE_PREVIEW_HEADER));
  if (!preview || preview === site.academy.template) return site;
  return { ...site, academy: { ...site.academy, template: preview } };
});

export function findCourse(site: AcademySite, courseSlug: string): Course | undefined {
  return site.courses.find((c) => c.slug === courseSlug);
}

export function featuredCourses(site: AcademySite, max = 3): Course[] {
  const featured = site.courses.filter((c) => c.featured);
  return (featured.length ? featured : site.courses).slice(0, max);
}

/**
 * Current student on this academy, if signed in.
 * Wire to the real auth session (cookie/JWT validated against the tenant).
 */
export async function getStudentSession(): Promise<StudentSession | null> {
  return null;
}
