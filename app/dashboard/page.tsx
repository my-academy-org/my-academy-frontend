import type { Metadata } from "next";
import { OverviewView } from "@/components/academy-admin/views/OverviewView";

export const metadata: Metadata = { title: "نظرة عامة" };

export default function DashboardPage() {
  return <OverviewView />;
}
