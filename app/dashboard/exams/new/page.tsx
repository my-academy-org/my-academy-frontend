import type { Metadata } from "next";
import { ExamBuilderView } from "@/components/academy-admin/views/ExamBuilderView";

export const metadata: Metadata = { title: "اختبار جديد" };

export default function NewExamPage() {
  return <ExamBuilderView />;
}
