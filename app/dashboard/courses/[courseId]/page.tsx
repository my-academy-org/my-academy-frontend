import type { Metadata } from "next";
import { CourseDetailView } from "@/components/academy-admin/views/CourseDetailView";

export const metadata: Metadata = { title: "الدورة" };

export default async function CoursePage({ params, searchParams }: PageProps<"/dashboard/courses/[courseId]">) {
  const [{ courseId }, { tab }] = await Promise.all([params, searchParams]);
  const initialTab = tab === "students" || tab === "lessons" ? tab : "overview";
  return <CourseDetailView key={`${courseId}-${initialTab}`} id={courseId} initialTab={initialTab} />;
}
