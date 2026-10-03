import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { academyUrl, formatDate, formatNumber } from "@/lib/admin/meta";
import type { AdminAcademy, PlatformStats } from "@/lib/admin/types";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { AcademyMark, AcademyStatusBadge } from "../ui";

export function OverviewView({ stats, recent }: { stats: PlatformStats; recent: AdminAcademy[] }) {
  const { academies, owners, students, courses } = stats;

  const cards: { label: string; value: number; note: string; href?: string; meter?: number }[] = [
    { label: "إجمالي الأكاديميات", value: academies.total, note: `${academies.inactive} غير مفعّلة · ${academies.suspended} موقوفة`, href: "/super-admin/academies" },
    { label: "الأكاديميات النشطة", value: academies.active, note: `${academies.activePercentage}% من الأكاديميات`, meter: academies.activePercentage },
    {
      label: "ملّاك الأكاديميات",
      value: owners.total,
      note: owners.pendingFirstLogin ? `${owners.pendingFirstLogin} بانتظار أول دخول` : "جميعهم سجّلوا الدخول",
      href: "/super-admin/owners",
    },
    { label: "إجمالي الطلاب", value: students.total, note: "عبر جميع الأكاديميات" },
    { label: "إجمالي الدورات", value: courses.total, note: academies.total ? `بمعدل ${courses.averagePerAcademy} لكل أكاديمية` : "—" },
  ];

  return (
    <>
      <PageHeader
        title="نظرة عامة"
        description="حالة المنصة في لمحة: الأكاديميات وملّاكها وطلابها."
        actions={
          <>
            <Button href="/super-admin/owners?create=1" variant="secondary">
              <Icon name="user" className="size-4" />
              إضافة مالك
            </Button>
            <Button href="/super-admin/academies/new">
              <Icon name="plus" className="size-4" />
              إنشاء أكاديمية
            </Button>
          </>
        }
      />

      <section aria-label="مؤشرات المنصة" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card lg:grid-cols-5">
        {cards.map((s, i) => {
          const body = (
            <>
              <p className="text-sm font-semibold text-ink-500">{s.label}</p>
              <p className="mt-3 text-[1.75rem] leading-none font-extrabold tracking-tight text-ink-950 tabular-nums sm:text-[2rem]">{formatNumber(s.value)}</p>
              {s.meter !== undefined ? (
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${s.meter}%` }} />
                  </div>
                  <span className="text-xs text-ink-500 tabular-nums">{s.meter}%</span>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-5 text-ink-500">{s.note}</p>
              )}
            </>
          );
          const cell = cn("block bg-white p-6", i === cards.length - 1 && "col-span-2 lg:col-span-1");
          return s.href ? (
            <Link key={s.label} href={s.href} className={cn(cell, "group transition-colors hover:bg-canvas")}>
              {body}
            </Link>
          ) : (
            <div key={s.label} className={cell}>
              {body}
            </div>
          );
        })}
      </section>

      <Panel
        className="mt-8"
        title="أحدث الأكاديميات"
        description="آخر الأكاديميات التي أُنشئت على المنصة."
        bodyClassName="p-0"
        action={
          <Link href="/super-admin/academies" className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-brand-700 hover:text-brand-800">
            عرض الكل
            <Icon name="chevron-side" className="size-3.5 rtl:rotate-180" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon="academy"
            title="لا توجد أكاديميات بعد"
            description="أنشئ أول أكاديمية ثم أضف مالكها لتظهر هنا."
            action={
              <Button href="/super-admin/academies/new" size="sm">
                إنشاء أكاديمية
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((a) => (
              <li key={a.id}>
                <Link href={`/super-admin/academies/${a.id}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-canvas/60">
                  <AcademyMark name={a.name} logoUrl={a.logoUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-950">{a.name}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-500">
                      <span>{a.owner?.name ?? "بدون مالك"}</span>
                      <span aria-hidden="true">·</span>
                      <span dir="ltr">{academyUrl(a.slug)}</span>
                    </p>
                  </div>
                  <div className="hidden text-end sm:block">
                    <AcademyStatusBadge status={a.status} />
                    <p className="mt-1 text-xs text-ink-400">{formatDate(a.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
