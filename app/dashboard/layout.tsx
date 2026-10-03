import type { Metadata } from "next";
import { AcademyShell } from "@/components/academy-admin/AcademyShell";
import { AcademyStoreProvider } from "@/components/academy-admin/AcademyStore";
import { UpgradeProvider } from "@/components/academy-admin/Upgrade";
import { AccountProblem } from "@/components/dashboard/AccountProblem";
import { ToastProvider } from "@/components/dashboard/Toaster";
import { getAcademySite } from "@/lib/academy/data";
import { buildAcademySeed } from "@/lib/academy-admin/seed";
import { academyOrigin, requireRole } from "@/lib/auth/server";
import { ownedAcademySlug } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: { default: "لوحة الأكاديمية", template: "%s · لوحة الأكاديمية" },
  robots: { index: false, follow: false },
};

/**
 * The academy owner's dashboard, on the main platform domain at /dashboard.
 *
 * Which academy is shown comes only from the signed-in account (session →
 * ownedAcademySlug), never from the URL, so every owner shares the same URLs
 * and can only ever load their own academy. Only that academy's data is sent
 * to the browser; with a backend, the API enforces the same scoping.
 */
export default async function AcademyDashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireRole("ACADEMY_ADMIN", "/dashboard");
  const slug = await ownedAcademySlug(session);
  const site = slug ? await getAcademySite(slug) : null;

  if (!site) {
    return <AccountProblem title="لا توجد أكاديمية مرتبطة بحسابك" text="تواصل مع فريق My Academy لربط حسابك بأكاديميتك." />;
  }
  if (site.tenant.status !== "ACTIVE") {
    return <AccountProblem title={`${site.tenant.name} موقوفة حالياً`} text="لا يمكن إدارة الأكاديمية أثناء إيقافها. تواصل مع فريق My Academy." />;
  }

  const seed = buildAcademySeed(site);
  seed.profile.siteUrl = await academyOrigin(site.tenant.slug);

  return (
    <ToastProvider>
      <AcademyStoreProvider seed={seed}>
        <UpgradeProvider>
          <AcademyShell>{children}</AcademyShell>
        </UpgradeProvider>
      </AcademyStoreProvider>
    </ToastProvider>
  );
}
