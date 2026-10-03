import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export const metadata: Metadata = { title: "إنشاء حساب طالب" };

export default async function AcademyRegisterPage({ params }: PageProps<"/sites/[slug]/register">) {
  const { site, template } = await loadAcademy(params);
  return <template.Auth site={site} mode="register" />;
}
