import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export const metadata: Metadata = { title: "الدورات" };

export default async function AcademyCoursesPage({ params }: PageProps<"/sites/[slug]/courses">) {
  const { site, template } = await loadAcademy(params);
  return <template.Courses site={site} />;
}
