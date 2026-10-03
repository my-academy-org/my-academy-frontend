"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { academyRoutes, isActivePath } from "@/lib/academy/nav";
import { AcademyLogo } from "@/components/academy-admin/parts";
import { useStudent } from "./StudentStore";
import { StudentAvatar } from "./parts";

const r = academyRoutes.student;
const items: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: r.dashboard, label: "الرئيسية", icon: "home", exact: true },
  { href: r.courses, label: "دوراتي", icon: "book" },
  { href: r.exams, label: "الاختبارات", icon: "exam" },
  { href: r.results, label: "النتائج", icon: "progress" },
  { href: r.profile, label: "حسابي", icon: "user" },
];

/** Calm learning shell: top navigation on desktop, bottom tab bar on phones. */
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { academy, profile } = useStudent();
  const active = (item: (typeof items)[number]) => (item.exact ? pathname === item.href : isActivePath(pathname, item.href));

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#student-main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
      >
        تخطَّ إلى المحتوى
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href={r.dashboard} className="flex min-w-0 items-center gap-2.5">
            <AcademyLogo name={academy.name} logoUrl={academy.logoUrl} color={academy.accent} />
            <span className="truncate text-[0.9375rem] font-extrabold text-ink-950">{academy.name}</span>
          </Link>

          <nav aria-label="القائمة الرئيسية" className="mx-auto hidden items-center gap-1 md:flex">
            {items.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active(item) ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-muted hover:text-ink-950",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href={r.profile}
            aria-label="حسابي"
            className={cn(
              "ms-auto flex items-center gap-2.5 rounded-full py-1 ps-1 pe-1 transition-colors hover:bg-muted md:ms-0 md:pe-3",
              active(items[4]) && "bg-muted",
            )}
          >
            <StudentAvatar profile={profile} className="size-8 text-xs" />
            <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-ink-800 md:inline">{profile.name}</span>
          </Link>
        </div>
      </header>

      <main id="student-main" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-28 sm:px-6 md:pb-16">
        {children}
      </main>

      <nav
        aria-label="التنقل"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active(item) ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 pt-2.5 pb-2 text-[0.6875rem] font-semibold", active(item) ? "text-brand-700" : "text-ink-500")}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
