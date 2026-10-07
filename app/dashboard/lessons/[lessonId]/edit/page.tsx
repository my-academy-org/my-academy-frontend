import type { Metadata } from "next";
import { LessonFormView } from "@/components/academy-admin/views/LessonFormView";

export const metadata: Metadata = { title: "تعديل الدرس" };

export default async function EditLessonPage({ params }: PageProps<"/dashboard/lessons/[lessonId]/edit">) {
  const { lessonId } = await params;
  return <LessonFormView lessonId={lessonId} />;
}
