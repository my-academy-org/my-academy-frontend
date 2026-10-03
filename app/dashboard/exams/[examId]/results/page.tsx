import type { Metadata } from "next";
import { ExamResultsView } from "@/components/academy-admin/views/ExamResultsView";

export const metadata: Metadata = { title: "نتائج الاختبار" };

export default async function ExamResultsPage({ params }: PageProps<"/dashboard/exams/[examId]/results">) {
  const { examId } = await params;
  return <ExamResultsView id={examId} />;
}
