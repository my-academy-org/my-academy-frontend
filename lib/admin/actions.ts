import * as api from "./api";
import type { AcademyPatch, Plan } from "./types";

/**
 * Mutations for the Super Admin dashboard. They run in the browser and call
 * the API directly (lib/admin/api.ts); on success every mounted query refetches.
 */

export type ActionResult<T = void> =
  | { ok: true; data: T }
  /** `raw` is the backend's own message, for callers that branch on a specific failure. */
  | { ok: false; message: string; status: number; raw: string };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    api.invalidateData();
    return { ok: true, data };
  } catch (error) {
    const known = error instanceof api.ApiError;
    return { ok: false, message: api.errorMessage(error), status: known ? error.status : 0, raw: known ? error.message : "" };
  }
}

/* ------------------------------------------------------------------ */
/* Academies                                                           */
/* ------------------------------------------------------------------ */

/**
 * Creation only takes name, slug and plan, so the remaining details are saved
 * with a follow-up edit. `detailsError` is set when the academy was created
 * but that second step failed.
 */
export function createAcademyAction(input: { templateId: number; name: string; slug: string; plan: Plan; details: AcademyPatch }) {
  return run(async () => {
    const { tenant } = await api.createAcademy(input.templateId, { name: input.name, slug: input.slug, plan: input.plan });
    let detailsError: string | undefined;
    if (Object.keys(input.details).length) {
      try {
        await api.updateAcademy(tenant.academy.id, input.details);
      } catch (error) {
        detailsError = api.errorMessage(error);
      }
    }
    return { id: tenant.academy.id, detailsError };
  });
}

export function updateAcademyAction(academyId: number, patch: AcademyPatch) {
  return run(async () => {
    await api.updateAcademy(academyId, patch);
  });
}

export function setAcademyStatusAction(academyId: number, action: "activate" | "suspend") {
  return run(async () => {
    await api.setAcademyStatus(academyId, action);
  });
}

export function deleteAcademyAction(academyId: number) {
  return run(async () => {
    await api.deleteAcademy(academyId);
  });
}

/* ------------------------------------------------------------------ */
/* Academy owners                                                      */
/* ------------------------------------------------------------------ */

export function requestOwnerOtpAction(tenantId: number, input: { name: string; email: string }) {
  return run(async () => {
    await api.requestOwnerOtp(tenantId, input);
  });
}

export function verifyOwnerOtpAction(input: { email: string; otp: string }) {
  return run(async () => {
    await api.verifyOwnerOtp(input);
  });
}

export function updateOwnerAction(ownerId: number, input: { name?: string; email?: string }) {
  return run(async () => {
    await api.updateOwner(ownerId, input);
  });
}

export function resendInvitationAction(ownerId: number) {
  return run(async () => {
    await api.resendInvitation(ownerId);
  });
}

export function setOwnerStatusAction(ownerId: number, action: "activate" | "suspend") {
  return run(async () => {
    await api.setOwnerStatus(ownerId, action);
  });
}
