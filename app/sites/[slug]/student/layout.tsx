import type { Metadata } from "next";
import { StudentStoreProvider } from "@/components/student/StudentStore";
import { accentTheme } from "@/components/student/theme";
import { ToastProvider } from "@/components/dashboard/Toaster";
import { AcademyUnavailable } from "@/components/academy/shared/AcademyUnavailable";
import { loadAcademy } from "@/lib/academy/load";
import { buildStudentSeed } from "@/lib/student/seed";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The student area of an academy (/student on the academy subdomain), themed
 * with the academy's colour. Gate on the student session once auth is wired:
 * the signed-in STUDENT must belong to `slug`, else redirect to /login.
 */
export default async function StudentLayout({ params, children }: LayoutProps<"/sites/[slug]/student">) {
  const { site } = await loadAcademy(params);
  const seed = buildStudentSeed(site);
  if (!seed) return <AcademyUnavailable name={site.tenant.name} />;

  return (
    <div style={accentTheme(seed.academy.accent)} className="flex min-h-dvh flex-col">
      <ToastProvider>
        <StudentStoreProvider seed={seed}>{children}</StudentStoreProvider>
      </ToastProvider>
    </div>
  );
}
