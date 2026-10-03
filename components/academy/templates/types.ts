import type { ComponentType, ReactNode } from "react";
import type { AuthMode } from "@/components/academy/shared/auth";
import type { AcademySite, Course, StudentSession } from "@/lib/academy/types";

export type SiteProps = { site: AcademySite };

/**
 * What every academy template must implement. Routes pick a template from the
 * registry and render these views with the academy's data — nothing else.
 */
export interface AcademyTemplate {
  /** Default accent when the academy has no brand colour. */
  defaultAccent: string;
  /** Page chrome: navbar, footer, background. */
  Shell: ComponentType<SiteProps & { session: StudentSession | null; children: ReactNode }>;
  Home: ComponentType<SiteProps>;
  Courses: ComponentType<SiteProps>;
  CourseDetails: ComponentType<SiteProps & { course: Course }>;
  Teacher: ComponentType<SiteProps>;
  Contact: ComponentType<SiteProps>;
  Auth: ComponentType<SiteProps & { mode: AuthMode }>;
}
