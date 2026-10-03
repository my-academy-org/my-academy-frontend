import type { Metadata } from "next";
import { ResultsView } from "@/components/student/views/ResultsView";

export const metadata: Metadata = { title: "النتائج" };

export default function Page() {
  return <ResultsView />;
}
