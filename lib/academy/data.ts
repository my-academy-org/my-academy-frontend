import { cache } from "react";
import { headers } from "next/headers";
import { ACADEMY_API_URL, parseTemplateId, TEMPLATE_PREVIEW_HEADER } from "./config";
import { fixtures } from "./fixtures";
import type { AcademySite, Course, StudentSession } from "./types";

/**
 * Loads the public data for one academy. Deduplicated per request via
 * React `cache`, so layout, page and metadata share a single fetch.
 *
 * Backend contract: GET {ACADEMY_API_URL}/public/academies/{slug}
 * → AcademySite (see ./types.ts), 404 when the tenant doesn't exist.
 */
export const getAcademySite = cache(async (slug: string): Promise<AcademySite | null> => {
  if (!ACADEMY_API_URL) return fixtures[slug] ?? null;

  const res = await fetch(`${ACADEMY_API_URL}/public/academies/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60, tags: [`academy:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load academy "${slug}" (${res.status})`);
  return (await res.json()) as AcademySite;
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
