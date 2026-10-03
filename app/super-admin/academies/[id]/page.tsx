import type { Metadata } from "next";
import { AcademyDetailView, AcademyNotFound } from "@/components/admin/views/AcademyDetailView";
import { idParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "تفاصيل الأكاديمية" };

export default async function AcademyDetailPage({ params, searchParams }: PageProps<"/super-admin/academies/[id]">) {
  const id = Number(idParam((await params).id));
  if (!id) return <AcademyNotFound />;
  // ?addOwner=1 — arriving from "create academy", whose next step is adding the owner.
  return <AcademyDetailView id={id} openAddOwner={(await searchParams).addOwner === "1"} />;
}
