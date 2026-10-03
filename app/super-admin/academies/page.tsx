import type { Metadata } from "next";
import { AcademiesView } from "@/components/admin/views/AcademiesView";
import { idParam, pageParam, statusParam, textParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "الأكاديميات" };

/** The filters live in the URL; the view loads the matching page from the API in the browser. */
export default async function AcademiesPage({ searchParams }: PageProps<"/super-admin/academies">) {
  const sp = await searchParams;
  const filters = { status: statusParam(sp.status), templateId: idParam(sp.templateId), search: textParam(sp.search) };
  return <AcademiesView filters={filters} page={pageParam(sp.page)} />;
}
