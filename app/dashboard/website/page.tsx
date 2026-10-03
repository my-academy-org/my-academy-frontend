import type { Metadata } from "next";
import { WebsiteView } from "@/components/academy-admin/views/WebsiteView";

export const metadata: Metadata = { title: "موقع الأكاديمية" };

export default function WebsitePage() {
  return <WebsiteView />;
}
