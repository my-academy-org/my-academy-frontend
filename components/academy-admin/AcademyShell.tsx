"use client";

import type { ReactNode } from "react";
import { DashboardShell, ShellAccount } from "@/components/dashboard/DashboardShell";
import { Avatar } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/Icon";
import { ROOT_DOMAIN } from "@/lib/academy/config";
import { dash } from "@/lib/academy-admin/meta";
import { planLabels } from "@/lib/academy-admin/plan";
import { useAcademy } from "./AcademyStore";
import { AcademyLogo } from "./parts";
import { useUpgrade } from "./Upgrade";

export function AcademyShell({ children }: { children: ReactNode }) {
  const { profile, website, courses, students } = useAcademy();
  const upgrade = useUpgrade();
  const pro = profile.plan === "PRO";

  return (
    <DashboardShell
      brandHref={dash.home}
      brand={
        <span className="flex min-w-0 items-center gap-3">
          <AcademyLogo name={profile.name} logoUrl={website.logoUrl} color={profile.brandColor} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-ink-950">{profile.name}</span>
            {profile.slug && (
              <span className="block truncate text-xs text-ink-500">
                <bdi>
                  {profile.slug}.{ROOT_DOMAIN}
                </bdi>
              </span>
            )}
          </span>
        </span>
      }
      rootLabel="لوحة الأكاديمية"
      nav={[
        {
          label: "التعليم",
          items: [
            { href: dash.home, label: "نظرة عامة", icon: "home", exact: true },
            { href: dash.courses, label: "الدورات", icon: "book", badge: courses.length },
            { href: dash.lessons(), label: "الدروس", icon: "play" },
            { href: dash.students, label: "الطلاب", icon: "users", badge: students.length },
            { href: dash.codes, label: "أكواد التسجيل", icon: "ticket" },
            { href: dash.exams, label: "الاختبارات", icon: "exam" },
          ],
        },
        {
          label: "الأكاديمية",
          items: [
            { href: dash.website, label: "موقع الأكاديمية", icon: "globe" },
            { href: dash.settings, label: "الإعدادات", icon: "settings" },
          ],
        },
      ]}
      sidebarExtra={
        <div className="rounded-xl border border-line bg-canvas p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-ink-500">الخطة الحالية</p>
            <span className="rounded-md bg-ink-950 px-1.5 py-px text-[0.6875rem] font-bold text-white">{planLabels[profile.plan]}</span>
          </div>
          {pro ? (
            <p className="mt-1.5 text-xs leading-5 text-ink-600">كل المميزات متاحة، بما فيها تحرير الموقع والوسائط.</p>
          ) : (
            <>
              <p className="mt-1.5 text-xs leading-5 text-ink-600">حرّر موقع أكاديميتك بنفسك مع خطة Pro.</p>
              <button
                type="button"
                onClick={() => upgrade()}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                اعرف المزيد عن Pro
                <Icon name="chevron-side" className="size-3 rtl:rotate-180" />
              </button>
            </>
          )}
        </div>
      }
      account={
        <ShellAccount
          avatar={<Avatar name={profile.owner.name} />}
          name={profile.owner.name}
          meta="مالك الأكاديمية"
        />
      }
      topbarActions={
        profile.siteUrl && (
          <a
            href={profile.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-line-strong bg-white px-3 text-sm font-semibold text-ink-800 shadow-card transition-colors hover:border-ink-300"
          >
            <Icon name="eye" className="size-4" />
            <span className="hidden sm:inline">معاينة الأكاديمية</span>
          </a>
        )
      }
    >
      {children}
    </DashboardShell>
  );
}
