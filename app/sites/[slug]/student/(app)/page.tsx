import type { Metadata } from "next";
import { HomeView } from "@/components/student/views/HomeView";

export const metadata: Metadata = { title: "لوحتي" };

export default function Page() {
  return <HomeView />;
}
