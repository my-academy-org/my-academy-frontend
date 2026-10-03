import type { AdminAcademyDetail, AdminTemplate } from "@/lib/admin/types";
import { AcademyForm } from "../AcademyForm";
import { BackLink, PageHeader } from "@/components/dashboard/ui";

export function EditAcademyView({ academy, templates }: { academy: AdminAcademyDetail; templates: AdminTemplate[] }) {
  return (
    <>
      <PageHeader title="تعديل الأكاديمية" description={academy.name}>
        <BackLink href={`/super-admin/academies/${academy.id}`}>تفاصيل الأكاديمية</BackLink>
      </PageHeader>
      <AcademyForm key={academy.id} academy={academy} templates={templates} />
    </>
  );
}
