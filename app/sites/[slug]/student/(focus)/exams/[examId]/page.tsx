import type { Metadata } from "next";
import { ExamTakeView } from "@/components/student/views/ExamTakeView";

export const metadata: Metadata = { title: "الاختبار" };

export default async function ExamPage({ params }: PageProps<"/sites/[slug]/student/exams/[examId]">) {
  const { examId } = await params;
  return <ExamTakeView key={examId} examId={examId} />;
}
