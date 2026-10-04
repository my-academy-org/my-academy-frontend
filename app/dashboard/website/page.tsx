import type { Metadata } from "next";
import { WebsiteView } from "@/components/academy-admin/views/WebsiteView";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { fetchOwnLandingPage, type LandingLoad } from "@/lib/academy-admin/landing";
import { getAccessToken } from "@/lib/auth/server";

export const metadata: Metadata = { title: "موقع الأكاديمية" };

export default async function WebsitePage() {
  if (!ACADEMY_API_URL) return <WebsiteView />;

  const token = await getAccessToken();
  const landing: LandingLoad = token ? await fetchOwnLandingPage(token) : { ok: false, message: "انتهت الجلسة. سجّل الدخول مرة أخرى." };
  return <WebsiteView landing={landing} />;
}
