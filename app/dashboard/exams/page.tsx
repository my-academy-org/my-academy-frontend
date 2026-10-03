import type { Metadata } from "next";
import { ExamsView } from "@/components/academy-admin/views/ExamsView";

export const metadata: Metadata = { title: "الاختبارات" };

export default function ExamsPage() {
  return <ExamsView />;
}
