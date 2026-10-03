import { loadAcademy } from "@/lib/academy/load";

export default async function AcademyHomePage({ params }: PageProps<"/sites/[slug]">) {
  const { site, template } = await loadAcademy(params);
  return <template.Home site={site} />;
}
