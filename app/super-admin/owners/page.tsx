import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { OwnersView } from "@/components/admin/views/OwnersView";
import { listOwnerlessAcademies, listOwners, load } from "@/lib/admin/api";
import { pageParam, statusParam, textParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "ملّاك الأكاديميات" };

export default async function OwnersPage({ searchParams }: PageProps<"/super-admin/owners">) {
  const sp = await searchParams;
  const filters = { status: statusParam(sp.status), search: textParam(sp.search) };

  const result = await load(() => Promise.all([listOwners({ ...filters, page: pageParam(sp.page) }), listOwnerlessAcademies()]));
  if (!result.ok) return <LoadError message={result.message} />;
  const [list, ownerless] = result.data;
  return <OwnersView list={list} filters={filters} ownerless={ownerless} openCreate={sp.create === "1"} />;
}
