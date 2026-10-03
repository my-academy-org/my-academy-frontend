import type { Metadata } from "next";
import { StudentsView } from "@/components/academy-admin/views/StudentsView";

export const metadata: Metadata = { title: "الطلاب" };

export default function StudentsPage() {
  return <StudentsView />;
}
