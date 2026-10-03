import type { TemplateId } from "@/lib/academy/types";
import { academicTemplate } from "./academic";
import { modernTemplate } from "./modern";
import { premiumTemplate } from "./premium";
import type { AcademyTemplate } from "./types";

/**
 * template = MODERN   → Modern Academy Template
 * template = ACADEMIC → Academic Academy Template
 * template = PREMIUM  → Premium Academy Template
 *
 * Adding a template = implementing `AcademyTemplate` and registering it here.
 */
export const templateRegistry: Record<TemplateId, AcademyTemplate> = {
  MODERN: modernTemplate,
  ACADEMIC: academicTemplate,
  PREMIUM: premiumTemplate,
};

export function getTemplate(id: TemplateId): AcademyTemplate {
  return templateRegistry[id] ?? modernTemplate;
}
