import type { Metadata } from "next";
import { EditCourseView } from "@/components/academy-admin/views/EditCourseView";

export const metadata: Metadata = { title: "تعديل الدورة" };

export default async function EditCoursePage({ params }: PageProps<"/dashboard/courses/[courseId]/edit">) {
  const { courseId } = await params;
  return <EditCourseView id={courseId} />;
}
