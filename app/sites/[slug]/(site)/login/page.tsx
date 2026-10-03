import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function AcademyLoginPage({ params }: PageProps<"/sites/[slug]/login">) {
  const { site, template } = await loadAcademy(params);
  return <template.Auth site={site} mode="login" />;
}
