import type { Metadata } from "next";
import { NewAcademyView } from "@/components/admin/views/EditAcademyView";

export const metadata: Metadata = { title: "إنشاء أكاديمية" };

export default function NewAcademyPage() {
  return <NewAcademyView />;
}
