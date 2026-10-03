import type { Metadata } from "next";
import { SettingsView } from "@/components/academy-admin/views/SettingsView";

export const metadata: Metadata = { title: "الإعدادات" };

export default function SettingsPage() {
  return <SettingsView />;
}
