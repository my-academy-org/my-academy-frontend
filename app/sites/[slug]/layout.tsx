import type { Metadata } from "next";
import { AcademyUnavailable } from "@/components/academy/shared/AcademyUnavailable";
import { loadAcademy } from "@/lib/academy/load";

/**
 * Every route on an academy subdomain: the public website in (site) and the
 * student area in /student (the owner dashboard lives on the main domain at
 * /dashboard). Unknown academies 404 here; suspended ones
 * are unavailable to students and to the owner alike.
 */
export async function generateMetadata({ params }: LayoutProps<"/sites/[slug]">): Promise<Metadata> {
  const { site } = await loadAcademy(params);
  return {
    title: { default: site.tenant.name, template: `%s · ${site.tenant.name}` },
    description: site.landing.hero.description,
    icons: site.academy.logo?.url ? { icon: site.academy.logo.url } : undefined,
  };
}

export default async function AcademyLayout({ params, children }: LayoutProps<"/sites/[slug]">) {
  const { site } = await loadAcademy(params);
  if (site.tenant.status !== "ACTIVE") return <AcademyUnavailable name={site.tenant.name} />;
  return children;
}
