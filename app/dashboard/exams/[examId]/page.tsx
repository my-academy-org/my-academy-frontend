import type { Metadata } from "next";
import { ExamBuilderView } from "@/components/academy-admin/views/ExamBuilderView";

export const metadata: Metadata = { title: "الاختبار" };

export default async function ExamPage({ params }: PageProps<"/dashboard/exams/[examId]">) {
  const { examId } = await params;
  return <ExamBuilderView key={examId} id={examId} />;
}
