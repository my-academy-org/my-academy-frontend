import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { TemplatesView } from "@/components/admin/views/TemplatesView";
import { listTemplates, load } from "@/lib/admin/api";

export const metadata: Metadata = { title: "القوالب" };

export default async function TemplatesPage() {
  const templates = await load(listTemplates);
  if (!templates.ok) return <LoadError message={templates.message} />;
  return <TemplatesView templates={templates.data} />;
}
