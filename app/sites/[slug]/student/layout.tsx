import type { Metadata } from "next";
import { StudentStoreProvider } from "@/components/student/StudentStore";
import { accentTheme } from "@/components/student/theme";
import { ToastProvider } from "@/components/dashboard/Toaster";
import { AcademyUnavailable } from "@/components/academy/shared/AcademyUnavailable";
import { redirect } from "next/navigation";
import { ACADEMY_API_URL } from "@/lib/academy/config";
import { loadAcademy } from "@/lib/academy/load";
import { academyRoutes } from "@/lib/academy/nav";
import { getAccessToken, getSession } from "@/lib/auth/server";
import { isStudentOf } from "@/lib/auth/session";
import { fetchStudentCourses } from "@/lib/student/courses";
import { buildStudentSeed } from "@/lib/student/seed";
import type { StudentSeed } from "@/lib/student/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The student area of an academy (/student on the academy subdomain), themed
 * with the academy's colour. With a backend, the signed-in STUDENT must
 * belong to this academy, else they are sent to /login; the sample academies
 * stay open.
 */
export default async function StudentLayout({ params, children }: LayoutProps<"/sites/[slug]/student">) {
  const { site } = await loadAcademy(params);
  const seed = buildStudentSeed(site);
  if (!seed) return <AcademyUnavailable name={site.tenant.name} />;
  const session = ACADEMY_API_URL ? await getSession() : null;
  if (ACADEMY_API_URL && !isStudentOf(session, site.tenant.tenantId)) redirect(academyRoutes.login);
  if (!session) {
    // No backend: the sample student of a sample academy.
    return (
      <div style={accentTheme(seed.academy.accent)} className="flex min-h-dvh flex-col">
        <ToastProvider>
          <StudentStoreProvider seed={seed}>{children}</StudentStoreProvider>
        </ToastProvider>
      </div>
    );
  }

  // The signed-in student's own profile and courses (docs/courses-lessons-api.md). Progress, exams and
  // results aren't served by the API yet, so they start empty rather than with sample content.
  const token = await getAccessToken();
  const content = token ? await fetchStudentCourses(token, seed.academy.instructor) : null;
  const courses = content?.ok ? content.courses : [];
  const live: StudentSeed = {
    live: true,
    academy: seed.academy,
    profile: { ...seed.profile, id: session.sub, name: session.name, email: session.email, phone: undefined },
    courses,
    available: content?.ok ? content.available : [],
    loadError: content?.ok ? undefined : (content?.message ?? "انتهت الجلسة. سجّل الدخول مرة أخرى."),
    progress: {},
    exams: [],
    attempts: [],
    activity: [],
    redeemable: {},
  };

  return (
    <div style={accentTheme(seed.academy.accent)} className="flex min-h-dvh flex-col">
      <ToastProvider>
        {/* Keyed by the student's courses: activating one (router.refresh) starts the store from the new list. */}
        <StudentStoreProvider key={courses.map((c) => c.id).join(",")} seed={live}>
          {children}
        </StudentStoreProvider>
      </ToastProvider>
    </div>
  );
}
