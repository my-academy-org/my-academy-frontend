import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { AcademiesView } from "@/components/admin/views/AcademiesView";
import { listAcademies, listTemplates, load } from "@/lib/admin/api";
import { idParam, pageParam, statusParam, textParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "الأكاديميات" };

export default async function AcademiesPage({ searchParams }: PageProps<"/super-admin/academies">) {
  const sp = await searchParams;
  const filters = { status: statusParam(sp.status), templateId: idParam(sp.templateId), search: textParam(sp.search) };

  const result = await load(() => Promise.all([listAcademies({ ...filters, page: pageParam(sp.page) }), listTemplates()]));
  if (!result.ok) return <LoadError message={result.message} />;
  const [list, templates] = result.data;
  return <AcademiesView list={list} templates={templates} filters={filters} />;
}
