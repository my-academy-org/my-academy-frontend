import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export const metadata: Metadata = { title: "تواصل معنا" };

export default async function AcademyContactPage({ params }: PageProps<"/sites/[slug]/contact">) {
  const { site, template } = await loadAcademy(params);
  return <template.Contact site={site} />;
}
