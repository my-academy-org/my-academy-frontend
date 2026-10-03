"use client";

import { BackLink, EmptyState, PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { dash } from "@/lib/academy-admin/meta";
import { useAcademy } from "../AcademyStore";
import { CourseForm } from "../CourseForm";

export function EditCourseView({ id }: { id: string }) {
  const course = useAcademy().courseById(id);
  if (!course) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState icon="book" title="الدورة غير موجودة" action={<Button href={dash.courses} variant="secondary">العودة إلى الدورات</Button>} />
      </div>
    );
  }
  return (
    <>
      <PageHeader title="تعديل الدورة" description={course.title}>
        <BackLink href={dash.course(course.id)}>{course.title}</BackLink>
      </PageHeader>
      <CourseForm key={course.id} course={course} />
    </>
  );
}
