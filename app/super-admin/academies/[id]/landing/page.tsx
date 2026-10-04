import type { Metadata } from "next";
import { AcademyNotFound } from "@/components/admin/views/AcademyDetailView";
import { AcademyLandingView } from "@/components/admin/views/AcademyLandingView";
import { idParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "صفحة الهبوط" };

export default async function AcademyLandingPage({ params }: PageProps<"/super-admin/academies/[id]/landing">) {
  const id = Number(idParam((await params).id));
  if (!id) return <AcademyNotFound />;
  return <AcademyLandingView id={id} />;
}
