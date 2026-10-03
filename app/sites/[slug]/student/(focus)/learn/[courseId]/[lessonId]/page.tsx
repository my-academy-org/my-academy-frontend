import type { Metadata } from "next";
import { LessonView } from "@/components/student/views/LessonView";

export const metadata: Metadata = { title: "الدرس" };

export default async function LessonPage({ params }: PageProps<"/sites/[slug]/student/learn/[courseId]/[lessonId]">) {
  const { courseId, lessonId } = await params;
  return <LessonView courseId={courseId} lessonId={lessonId} />;
}
