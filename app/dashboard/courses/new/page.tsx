import type { Metadata } from "next";
import { CourseForm } from "@/components/academy-admin/CourseForm";
import { BackLink, PageHeader } from "@/components/dashboard/ui";
import { dash } from "@/lib/academy-admin/meta";

export const metadata: Metadata = { title: "دورة جديدة" };

export default function NewCoursePage() {
  return (
    <>
      <PageHeader title="دورة جديدة" description="أنشئ الدورة كمسودة، ثم أضف دروسها وانشرها عندما تكون جاهزة.">
        <BackLink href={dash.courses}>الدورات</BackLink>
      </PageHeader>
      <CourseForm />
    </>
  );
}
