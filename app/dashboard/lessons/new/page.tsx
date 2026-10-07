import type { Metadata } from "next";
import { LessonFormView } from "@/components/academy-admin/views/LessonFormView";

export const metadata: Metadata = { title: "درس جديد" };

export default async function NewLessonPage({ searchParams }: PageProps<"/dashboard/lessons/new">) {
  const { course } = await searchParams;
  return <LessonFormView courseId={typeof course === "string" ? course : undefined} />;
}
