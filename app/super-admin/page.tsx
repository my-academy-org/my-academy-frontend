import type { Metadata } from "next";
import { LoadError } from "@/components/admin/ui";
import { OverviewView } from "@/components/admin/views/OverviewView";
import { getStatistics, listRecentAcademies, load } from "@/lib/admin/api";

export const metadata: Metadata = { title: "نظرة عامة" };

export default async function AdminOverviewPage() {
  const result = await load(() => Promise.all([getStatistics(), listRecentAcademies(5)]));
  if (!result.ok) return <LoadError message={result.message} />;
  const [stats, recent] = result.data;
  return <OverviewView stats={stats} recent={recent} />;
}
