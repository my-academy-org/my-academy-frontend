import type { Metadata } from "next";
import { StudentDetailView } from "@/components/academy-admin/views/StudentDetailView";

export const metadata: Metadata = { title: "ملف الطالب" };

export default async function StudentPage({ params }: PageProps<"/dashboard/students/[studentId]">) {
  const { studentId } = await params;
  return <StudentDetailView id={studentId} />;
}
