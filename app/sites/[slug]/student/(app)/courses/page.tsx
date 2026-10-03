import type { Metadata } from "next";
import { CoursesView } from "@/components/student/views/CoursesView";

export const metadata: Metadata = { title: "دوراتي" };

export default function Page() {
  return <CoursesView />;
}
