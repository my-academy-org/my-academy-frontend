import type { Metadata } from "next";
import { CoursesView } from "@/components/academy-admin/views/CoursesView";

export const metadata: Metadata = { title: "الدورات" };

export default function CoursesPage() {
  return <CoursesView />;
}
