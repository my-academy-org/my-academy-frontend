import type { Metadata } from "next";
import { AcademyNotFound } from "@/components/admin/views/AcademyDetailView";
import { EditAcademyView } from "@/components/admin/views/EditAcademyView";
import { idParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "تعديل الأكاديمية" };

export default async function EditAcademyPage({ params }: PageProps<"/super-admin/academies/[id]/edit">) {
  const id = Number(idParam((await params).id));
  if (!id) return <AcademyNotFound />;
  return <EditAcademyView id={id} />;
}
