"use server";

import { revalidatePath } from "next/cache";
import * as api from "@/lib/admin/api";
import type { AcademyPatch, Plan } from "@/lib/admin/types";

/**
 * Mutations for the Super Admin dashboard. Each one calls the backend with the
 * session cookie (the API rejects any role but SUPER_ADMIN) and refreshes the
 * dashboard data on success.
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  /** `raw` is the backend's own message, for callers that branch on a specific failure. */
  | { ok: false; message: string; status: number; raw: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    revalidatePath("/super-admin", "layout");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof api.ApiError) return { ok: false, message: api.errorMessage(error), status: error.status, raw: error.message };
    throw error;
  }
}

/** Ids end up in the request path, so they must be plain positive integers. */
function id(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) throw new api.ApiError(400, "Invalid id");
  return value;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const plan = (value: unknown): Plan => (value === "PRO" ? "PRO" : "BASIC");
const toggle = (value: unknown) => (value === "suspend" ? "suspend" : "activate");

/** Keeps only the documented fields — the API rejects unknown ones with 400. */
function cleanPatch(input: AcademyPatch): AcademyPatch {
  const patch: AcademyPatch = {};
  if (input.name !== undefined) patch.name = text(input.name);
  if (input.slug !== undefined) patch.slug = text(input.slug);
  if (input.plan !== undefined) patch.plan = plan(input.plan);
  if (input.templateId !== undefined) patch.templateId = id(input.templateId);
  if (input.description !== undefined) patch.description = text(input.description);
  if (input.phone !== undefined) patch.phone = text(input.phone);
  if (input.address !== undefined) patch.address = text(input.address);
  if (input.logoUrl !== undefined) patch.logoUrl = text(input.logoUrl) || null;
  if (input.email !== undefined) patch.email = text(input.email) || null;
  return patch;
}

/* ------------------------------------------------------------------ */
/* Academies                                                           */
/* ------------------------------------------------------------------ */

/**
 * Creation only takes name, slug and plan, so the remaining details are saved
 * with a follow-up edit. `detailsError` is set when the academy was created
 * but that second step failed.
 */
export async function createAcademyAction(input: { templateId: number; name: string; slug: string; plan: Plan; details: AcademyPatch }) {
  return run(async () => {
    const { tenant } = await api.createAcademy(id(input.templateId), { name: text(input.name), slug: text(input.slug), plan: plan(input.plan) });
    const details = cleanPatch(input.details ?? {});
    let detailsError: string | undefined;
    if (Object.keys(details).length) {
      try {
        await api.updateAcademy(tenant.academy.id, details);
      } catch (error) {
        if (!(error instanceof api.ApiError)) throw error;
        detailsError = api.errorMessage(error);
      }
    }
    return { id: tenant.academy.id, detailsError };
  });
}

export async function updateAcademyAction(academyId: number, patch: AcademyPatch) {
  return run(async () => {
    await api.updateAcademy(id(academyId), cleanPatch(patch));
  });
}

export async function setAcademyStatusAction(academyId: number, action: "activate" | "suspend") {
  return run(async () => {
    await api.setAcademyStatus(id(academyId), toggle(action));
  });
}

export async function deleteAcademyAction(academyId: number) {
  return run(async () => {
    await api.deleteAcademy(id(academyId));
  });
}

/* ------------------------------------------------------------------ */
/* Academy owners                                                      */
/* ------------------------------------------------------------------ */

export async function requestOwnerOtpAction(tenantId: number, input: { name: string; email: string }) {
  return run(async () => {
    await api.requestOwnerOtp(id(tenantId), { name: text(input.name), email: text(input.email) });
  });
}

export async function verifyOwnerOtpAction(input: { email: string; otp: string }) {
  return run(async () => {
    await api.verifyOwnerOtp({ email: text(input.email), otp: text(input.otp) });
  });
}

export async function updateOwnerAction(ownerId: number, input: { name?: string; email?: string }) {
  return run(async () => {
    await api.updateOwner(id(ownerId), {
      ...(input.name !== undefined && { name: text(input.name) }),
      ...(input.email !== undefined && { email: text(input.email) }),
    });
  });
}

export async function resendInvitationAction(ownerId: number) {
  return run(async () => {
    await api.resendInvitation(id(ownerId));
  });
}

export async function setOwnerStatusAction(ownerId: number, action: "activate" | "suspend") {
  return run(async () => {
    await api.setOwnerStatus(id(ownerId), toggle(action));
  });
}
