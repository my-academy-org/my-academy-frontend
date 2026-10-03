import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export async function generateMetadata({ params }: PageProps<"/sites/[slug]/teacher">): Promise<Metadata> {
  const { site } = await loadAcademy(params);
  return { title: site.landing.teacher.name };
}

export default async function AcademyTeacherPage({ params }: PageProps<"/sites/[slug]/teacher">) {
  const { site, template } = await loadAcademy(params);
  return <template.Teacher site={site} />;
}
