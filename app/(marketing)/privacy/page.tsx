import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";

export const metadata: Metadata = { title: "سياسة الخصوصية" };

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="سياسة الخصوصية"
      body="يجري إعداد سياسة الخصوصية الخاصة بمنصة My Academy، وستُنشر في هذه الصفحة قريباً."
    />
  );
}
