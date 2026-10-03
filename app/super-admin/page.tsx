import type { Metadata } from "next";
import { OverviewView } from "@/components/admin/views/OverviewView";

export const metadata: Metadata = { title: "نظرة عامة" };

export default function AdminOverviewPage() {
  return <OverviewView />;
}
