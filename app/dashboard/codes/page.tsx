import type { Metadata } from "next";
import { CodesView } from "@/components/academy-admin/views/CodesView";

export const metadata: Metadata = { title: "أكواد التسجيل" };

export default function CodesPage() {
  return <CodesView />;
}
