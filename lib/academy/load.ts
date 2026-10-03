import { notFound } from "next/navigation";
import { getTemplate } from "@/components/academy/templates/registry";
import { getRenderableSite } from "./data";

/**
 * Shared by every academy route: load the tenant, 404 if it doesn't exist,
 * and resolve the template that renders it.
 */
export async function loadAcademy(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const site = await getRenderableSite(slug);
  if (!site) notFound();
  return { site, template: getTemplate(site.academy.template) };
}
