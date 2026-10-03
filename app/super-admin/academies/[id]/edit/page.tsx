import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { AcademyNotFound } from "@/components/admin/views/AcademyDetailView";
import { EditAcademyView } from "@/components/admin/views/EditAcademyView";
import { getAcademy, listTemplates, load } from "@/lib/admin/api";
import { idParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "تعديل الأكاديمية" };

export default async function EditAcademyPage({ params }: PageProps<"/super-admin/academies/[id]/edit">) {
  const id = Number(idParam((await params).id));
  if (!id) return <AcademyNotFound />;

  const result = await load(() => Promise.all([getAcademy(id), listTemplates()]));
  if (!result.ok) return <LoadError message={result.message} />;
  const [academy, templates] = result.data;
  if (!academy) return <AcademyNotFound />;
  return <EditAcademyView academy={academy} templates={templates} />;
}
