"use client";

import { LandingPageForm } from "@/components/dashboard/LandingPageForm";
import type { LandingPageAdmin } from "@/lib/academy/landing";
import { deleteLandingPage, saveLandingPage } from "@/lib/academy-admin/landing-actions";
import { useAcademy } from "../AcademyStore";
import { useUpgrade } from "../Upgrade";

/** The owner's own landing page, written through server actions with the session's token. */
export function LandingPageEditor({ page, onChange }: { page: LandingPageAdmin | null; onChange: (page: LandingPageAdmin | null) => void }) {
  const { profile } = useAcademy();
  const upgrade = useUpgrade();
  return (
    <LandingPageForm
      page={page}
      onChange={onChange}
      academyName={profile.name}
      defaultInstructor={profile.owner.name}
      onUpgrade={() => upgrade("websiteEditor")}
      api={{
        save: (id, input) => saveLandingPage(id, input, profile.slug),
        remove: (id) => deleteLandingPage(id, profile.slug),
      }}
    />
  );
}
