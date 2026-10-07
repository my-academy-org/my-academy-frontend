import type { Metadata } from "next";
import { AcademyShell } from "@/components/academy-admin/AcademyShell";
import { AcademyStoreProvider } from "@/components/academy-admin/AcademyStore";
import { UpgradeProvider } from "@/components/academy-admin/Upgrade";
import { AccountProblem } from "@/components/dashboard/AccountProblem";
import { ToastProvider } from "@/components/dashboard/Toaster";
import { Notice } from "@/components/dashboard/ui";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { getAcademySite } from "@/lib/academy/data";
import { TEMPLATE_BY_TYPE } from "@/lib/academy/landing";
import { fetchDashboardContent } from "@/lib/academy-admin/courses";
import { buildAcademySeed, emptyAcademySeed } from "@/lib/academy-admin/seed";
import type { AcademySeed } from "@/lib/academy-admin/types";
import { backendTenant } from "@/lib/auth/backend";
import { academyOrigin, getAccessToken, requireRole } from "@/lib/auth/server";
import type { Session } from "@/lib/auth/session";
import { ownedAcademySlug } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: { default: "لوحة الأكاديمية", template: "%s · لوحة الأكاديمية" },
  robots: { index: false, follow: false },
};

/**
 * With a backend, an ACADEMY_ADMIN account only exists linked to an academy
 * (it is created through POST /auth/academy-admin/verify-otp for one tenant —
 * docs/auth-api.md §4), so the owner always goes straight in. Courses and
 * lessons come from the API (docs/courses-lessons-api.md); the rest of the
 * dashboard's data isn't served yet, so it starts empty rather than with
 * sample content.
 */
async function backendSeed(session: Session): Promise<AcademySeed> {
  const token = await getAccessToken();
  const [tenant, content] = await Promise.all([
    token && session.tenantId != null ? backendTenant(token, session.tenantId) : null,
    token ? fetchDashboardContent(token) : null,
  ]);
  const seed = emptyAcademySeed({
    slug: tenant?.slug ?? "",
    name: tenant?.name ?? "أكاديميتي",
    plan: tenant?.plan === "PRO" ? "PRO" : "BASIC",
    template: TEMPLATE_BY_TYPE[tenant?.templateType ?? ""] ?? "MODERN",
    owner: { name: session.name, email: session.email },
  });
  if (tenant?.slug) seed.profile.siteUrl = await academyOrigin(tenant.slug);
  seed.live = true;
  if (content?.ok) {
    seed.courses = content.courses;
    seed.lessons = content.lessons;
  } else {
    seed.loadError = content?.message ?? "انتهت الجلسة. سجّل الدخول مرة أخرى.";
  }
  return seed;
}

/**
 * The academy owner's dashboard, on the main platform domain at /dashboard.
 *
 * Which academy is shown comes only from the signed-in account, never from the
 * URL, so every owner shares the same URLs and can only ever load their own
 * academy. Only that academy's data is sent to the browser; with a backend,
 * the API enforces the same scoping.
 */
export default async function AcademyDashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireRole("ACADEMY_ADMIN", "/dashboard");

  let seed: AcademySeed;
  if (ACADEMY_API_URL) {
    seed = await backendSeed(session);
  } else {
    // Demo sign-in: the bundled sample academies.
    const slug = await ownedAcademySlug(session);
    const site = slug ? await getAcademySite(slug) : null;
    if (!site) {
      return <AccountProblem title="لا توجد أكاديمية مرتبطة بحسابك" text="تواصل مع فريق My Academy لربط حسابك بأكاديميتك." />;
    }
    if (site.tenant.status !== "ACTIVE") {
      return <AccountProblem title={`${site.tenant.name} موقوفة حالياً`} text="لا يمكن إدارة الأكاديمية أثناء إيقافها. تواصل مع فريق My Academy." />;
    }
    seed = buildAcademySeed(site);
    seed.profile.siteUrl = await academyOrigin(site.tenant.slug);
  }

  return (
    <ToastProvider>
      <AcademyStoreProvider seed={seed}>
        <UpgradeProvider>
          <AcademyShell>
            {ACADEMY_API_URL && (
              <Notice tone="warning" className="mb-6">
                الدورات والدروس وصفحة الهبوط في «موقع الأكاديمية» تُحفظ على الخادم. باقي أقسام اللوحة لم تُربط بعد: ما تضيفه أو تعدّله فيها لا يُحفظ حالياً.
              </Notice>
            )}
            {seed.loadError && (
              <Notice tone="warning" className="mb-6">
                تعذّر تحميل الدورات والدروس: {seed.loadError}
              </Notice>
            )}
            {children}
          </AcademyShell>
        </UpgradeProvider>
      </AcademyStoreProvider>
    </ToastProvider>
  );
}
