import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { AcademyDetailView, AcademyNotFound } from "@/components/admin/views/AcademyDetailView";
import { getAcademy, load } from "@/lib/admin/api";
import { idParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "تفاصيل الأكاديمية" };

export default async function AcademyDetailPage({ params, searchParams }: PageProps<"/super-admin/academies/[id]">) {
  const id = Number(idParam((await params).id));
  if (!id) return <AcademyNotFound />;

  const result = await load(() => getAcademy(id));
  if (!result.ok) return <LoadError message={result.message} />;
  if (!result.data) return <AcademyNotFound />;
  // ?addOwner=1 — arriving from "create academy", whose next step is adding the owner.
  return <AcademyDetailView academy={result.data} openAddOwner={(await searchParams).addOwner === "1"} />;
}
