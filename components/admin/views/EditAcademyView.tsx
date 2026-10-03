"use client";

import { getAcademy, listTemplates } from "@/lib/admin/api";
import { AcademyForm } from "../AcademyForm";
import { BackLink, PageHeader } from "@/components/dashboard/ui";
import { Loading, LoadError } from "../ui";
import { useApiQuery } from "../useApiQuery";
import { AcademyNotFound } from "./AcademyDetailView";

export function EditAcademyView({ id }: { id: number }) {
  // Loaded once: a refetch must not reset a form that is being edited.
  const loaded = useApiQuery(
    `edit-academy:${id}`,
    async () => {
      const [academy, templates] = await Promise.all([getAcademy(id), listTemplates()]);
      return { academy, templates };
    },
    { refresh: false },
  );

  if (loaded.error) return <LoadError message={loaded.error} />;
  if (!loaded.data) return <Loading />;
  const { academy, templates } = loaded.data;
  if (!academy) return <AcademyNotFound />;

  return (
    <>
      <PageHeader title="تعديل الأكاديمية" description={academy.name}>
        <BackLink href={`/super-admin/academies/${academy.id}`}>تفاصيل الأكاديمية</BackLink>
      </PageHeader>
      <AcademyForm key={academy.id} academy={academy} templates={templates} />
    </>
  );
}

export function NewAcademyView() {
  const templates = useApiQuery("new-academy:templates", listTemplates, { refresh: false });

  return (
    <>
      <PageHeader title="إنشاء أكاديمية" description="أنشئ أكاديمية مستقلة بنطاقها الفرعي وقالبها، ثم أضف مالكها في الخطوة التالية.">
        <BackLink href="/super-admin/academies">الأكاديميات</BackLink>
      </PageHeader>
      {templates.error ? <LoadError message={templates.error} /> : templates.data ? <AcademyForm templates={templates.data} /> : <Loading />}
    </>
  );
}
