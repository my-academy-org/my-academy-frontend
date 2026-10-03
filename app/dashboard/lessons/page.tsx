import type { Metadata } from "next";
import { LessonsView } from "@/components/academy-admin/views/LessonsView";

export const metadata: Metadata = { title: "الدروس" };

export default async function LessonsPage({ searchParams }: PageProps<"/dashboard/lessons">) {
  const { course } = await searchParams;
  const courseId = typeof course === "string" ? course : undefined;
  return <LessonsView key={courseId ?? "all"} initialCourseId={courseId} />;
}
