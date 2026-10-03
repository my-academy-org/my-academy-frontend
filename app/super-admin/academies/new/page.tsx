import type { Metadata } from "next";
import { AcademyForm } from "@/components/admin/AcademyForm";
import { LoadError } from "@/components/admin/ui";
import { BackLink, PageHeader } from "@/components/dashboard/ui";
import { listTemplates, load } from "@/lib/admin/api";

export const metadata: Metadata = { title: "إنشاء أكاديمية" };

export default async function NewAcademyPage() {
  const templates = await load(listTemplates);
  if (!templates.ok) return <LoadError message={templates.message} />;

  return (
    <>
      <PageHeader title="إنشاء أكاديمية" description="أنشئ أكاديمية مستقلة بنطاقها الفرعي وقالبها، ثم أضف مالكها في الخطوة التالية.">
        <BackLink href="/super-admin/academies">الأكاديميات</BackLink>
      </PageHeader>
      <AcademyForm templates={templates.data} />
    </>
  );
}
