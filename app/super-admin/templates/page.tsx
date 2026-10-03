import type { Metadata } from "next";
import { TemplatesView } from "@/components/admin/views/TemplatesView";

export const metadata: Metadata = { title: "القوالب" };

export default function TemplatesPage() {
  return <TemplatesView />;
}
