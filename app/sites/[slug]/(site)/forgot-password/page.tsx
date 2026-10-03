import type { Metadata } from "next";
import { loadAcademy } from "@/lib/academy/load";

export const metadata: Metadata = { title: "استعادة كلمة المرور" };

export default async function AcademyForgotPasswordPage({ params }: PageProps<"/sites/[slug]/forgot-password">) {
  const { site, template } = await loadAcademy(params);
  return <template.Auth site={site} mode="forgot" />;
}
