import type { Metadata } from "next";
import { OwnersView } from "@/components/admin/views/OwnersView";
import { pageParam, statusParam, textParam } from "@/lib/admin/meta";

export const metadata: Metadata = { title: "ملّاك الأكاديميات" };

/** The filters live in the URL; the view loads the matching page from the API in the browser. */
export default async function OwnersPage({ searchParams }: PageProps<"/super-admin/owners">) {
  const sp = await searchParams;
  const filters = { status: statusParam(sp.status), search: textParam(sp.search) };
  return <OwnersView filters={filters} page={pageParam(sp.page)} openCreate={sp.create === "1"} />;
}
