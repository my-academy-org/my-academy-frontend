import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/marketing/PlaceholderPage";

export const metadata: Metadata = { title: "الشروط والأحكام" };

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="الشروط والأحكام"
      body="يجري إعداد الشروط والأحكام الخاصة باستخدام منصة My Academy، وستُنشر في هذه الصفحة قريباً."
    />
  );
}
