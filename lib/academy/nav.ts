/**
 * Academy routes as seen in the browser (on the academy subdomain).
 * proxy.ts rewrites them internally to /sites/<slug>/…
 */
export const academyRoutes = {
  home: "/",
  courses: "/courses",
  course: (slug: string) => `/courses/${slug}`,
  teacher: "/teacher",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  student: {
    dashboard: "/student",
    courses: "/student/courses",
    exams: "/student/exams",
    exam: (id: string) => `/student/exams/${id}`,
    results: "/student/results",
    profile: "/student/profile",
    lesson: (courseId: string, lessonId: string) => `/student/learn/${courseId}/${lessonId}`,
  },
} as const;

export type NavItem = { label: string; href: string };

export const publicNav: NavItem[] = [
  { label: "الرئيسية", href: academyRoutes.home },
  { label: "الدورات", href: academyRoutes.courses },
  { label: "عن المعلّم", href: academyRoutes.teacher },
  { label: "تواصل معنا", href: academyRoutes.contact },
];

export const studentNav: NavItem[] = [
  { label: "الرئيسية", href: academyRoutes.student.dashboard },
  { label: "دوراتي", href: academyRoutes.student.courses },
  { label: "الاختبارات", href: academyRoutes.student.exams },
  { label: "النتائج", href: academyRoutes.student.results },
  { label: "الملف الشخصي", href: academyRoutes.student.profile },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
