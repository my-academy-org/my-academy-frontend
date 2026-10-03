import type { Metadata } from "next";
import { ExamsView } from "@/components/student/views/ExamsView";

export const metadata: Metadata = { title: "الاختبارات" };

export default function Page() {
  return <ExamsView />;
}
