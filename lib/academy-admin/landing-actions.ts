"use server";

import { updateTag } from "next/cache";
import { academyTag } from "@/lib/academy/data";
import { pickLandingInput, type LandingFailure, type LandingPageInput, type LandingResult } from "@/lib/academy/landing";
import { getAccessToken, getSession } from "@/lib/auth/server";
import { fetchOwnLandingPage, landingRequest } from "./landing";

/**
 * Landing-page mutations from the owner dashboard. The academy always comes
 * from the session on the API side; on success the fresh page is returned
 * (PATCH and DELETE respond with a message only) and the public site's cached
 * copy is invalidated.
 */

async function ownerToken() {
  const session = await getSession();
  return session?.role === "ACADEMY_ADMIN" ? await getAccessToken() : undefined;
}

const expired: LandingFailure = { ok: false, status: 401, message: "انتهت الجلسة. سجّل الدخول مرة أخرى." };

async function afterWrite(token: string, slug: string | undefined): Promise<LandingResult> {
  const fresh = await fetchOwnLandingPage(token);
  const site = slug ?? (fresh.ok ? fresh.page?.academy.tenant.slug : undefined);
  if (site) updateTag(academyTag(site));
  // The write succeeded even if reloading it didn't; the editor then keeps its own copy.
  return { ok: true, page: fresh.ok ? fresh.page : undefined };
}

/** POST /landing-page when `id` is null, PATCH /landing-page/:id otherwise. */
export async function saveLandingPage(id: number | null, input: LandingPageInput, slug?: string): Promise<LandingResult> {
  const token = await ownerToken();
  if (!token) return expired;
  const body = pickLandingInput(input);
  const res = id == null ? await landingRequest(token, "/landing-page", "POST", body) : await landingRequest(token, `/landing-page/${id}`, "PATCH", body);
  return res.ok ? afterWrite(token, slug) : res;
}

export async function deleteLandingPage(id: number, slug?: string): Promise<LandingResult> {
  const token = await ownerToken();
  if (!token) return expired;
  const res = await landingRequest(token, `/landing-page/${id}`, "DELETE");
  return res.ok ? afterWrite(token, slug) : res;
}

/**
 * After the Super Admin edits a landing page (straight from the browser to
 * the API), drop the public site's cached copy so the change shows at once.
 */
export async function refreshAcademySite(slug: string) {
  const session = await getSession();
  if (session?.role !== "SUPER_ADMIN" || !/^[a-z0-9-]+$/.test(slug)) return;
  updateTag(academyTag(slug));
}
