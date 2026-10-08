"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { ROOT_DOMAIN } from "@/lib/site";

/* Illustrative sample data for the product mockup only. */
type Row = { title: string; meta: string; tag: string; tone: "brand" | "neutral" | "gold" };

const tabs: { icon: IconName; label: string; count: string; action: string; rows: Row[] }[] = [
  {
    icon: "book",
    label: "الدورات",
    count: "12",
    action: "دورة جديدة",
    rows: [
      { title: "أساسيات JavaScript", meta: "24 درساً · 412 طالباً", tag: "منشورة", tone: "brand" },
      { title: "React من الصفر", meta: "18 درساً · 286 طالباً", tag: "منشورة", tone: "brand" },
      { title: "تطوير الواجهات", meta: "9 دروس · قيد الإعداد", tag: "مسودة", tone: "neutral" },
    ],
  },
  {
    icon: "play",
    label: "الدروس",
    count: "86",
    action: "درس جديد",
    rows: [
      { title: "المتغيرات وأنواع البيانات", meta: "أساسيات JavaScript · 12:40", tag: "منشور", tone: "brand" },
      { title: "الدوال والنطاقات", meta: "أساسيات JavaScript · 18:05", tag: "منشور", tone: "brand" },
      { title: "المكوّنات والخصائص", meta: "React من الصفر · 21:30", tag: "مسودة", tone: "neutral" },
    ],
  },
  {
    icon: "users",
    label: "الطلاب",
    count: "1,248",
    action: "إضافة طالب",
    rows: [
      { title: "يوسف خالد", meta: "3 دورات · نشط اليوم", tag: "92%", tone: "brand" },
      { title: "مريم عادل", meta: "دورتان · نشطة أمس", tag: "76%", tone: "brand" },
      { title: "نور الهدى", meta: "دورة واحدة · تحتاج متابعة", tag: "21%", tone: "gold" },
    ],
  },
  {
    icon: "exam",
    label: "الاختبارات",
    count: "9",
    action: "اختبار جديد",
    rows: [
      { title: "اختبار الوحدة الثالثة", meta: "React من الصفر · 64 محاولة", tag: "88%", tone: "brand" },
      { title: "اختبار الدوال", meta: "أساسيات JavaScript · 120 محاولة", tag: "91%", tone: "brand" },
      { title: "الاختبار النهائي", meta: "تطوير الواجهات · لم يبدأ", tag: "مجدول", tone: "neutral" },
    ],
  },
];

// Keep in sync with --animate-grow-x in globals.css.
const STEP_MS = 3200;

const tagTones = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-muted text-ink-600",
  gold: "bg-gold-50 text-gold-600",
};

/** Auto-playing miniature of the teacher dashboard, stepping through its sections. */
export function AcademyManageVisual() {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % tabs.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div aria-hidden="true" className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-white shadow-lift select-none">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-base font-bold text-gold-300">أ</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink-900">أكاديمية أحمد للبرمجة</p>
          <p className="truncate text-end text-[0.6875rem] text-ink-500" dir="ltr">ahmed.{ROOT_DOMAIN}</p>
        </div>
      </div>

      {/* Sections sit in a top tab row on phones, and in a sidebar from sm up */}
      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr]">
        <ul className="flex gap-1 border-line bg-canvas p-1.5 max-sm:border-b sm:flex-col sm:border-e sm:p-2">
          {tabs.map((t, i) => (
            <li
              key={t.label}
              className={cn(
                "flex min-w-0 items-center rounded-lg font-semibold ring-1 transition-[background-color,color,box-shadow] duration-300 max-sm:flex-1 max-sm:flex-col max-sm:gap-1 max-sm:px-1 max-sm:py-1.5 max-sm:text-[0.625rem] sm:gap-2 sm:px-2.5 sm:py-2 sm:text-xs",
                i === active ? "bg-white text-brand-700 shadow-card ring-line" : "text-ink-500 ring-transparent",
              )}
            >
              <Icon name={t.icon} className="size-4 shrink-0" />
              <span className="max-w-full truncate sm:flex-1">{t.label}</span>
              <span className="text-[0.6875rem] tabular-nums text-ink-400 max-sm:hidden" dir="ltr">{t.count}</span>
            </li>
          ))}
        </ul>

        <div className="min-w-0">
          <div className="h-0.5 bg-muted">
            <span key={active} className="block h-full animate-grow-x bg-brand-600 ltr:origin-left rtl:origin-right" />
          </div>
          <div key={active} className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink-950">{tab.label}</p>
              <span className="flex items-center gap-1 rounded-md bg-ink-950 px-2 py-1 text-[0.6875rem] font-bold text-white">
                <Icon name="plus" className="size-3" strokeWidth={2.5} />
                {tab.action}
              </span>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {tab.rows.map((r, i) => (
                <li
                  key={r.title}
                  className="flex animate-fade-up items-center justify-between gap-3 py-2.5 [animation-duration:0.45s]"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink-900">{r.title}</p>
                    <p className="mt-0.5 truncate text-[0.6875rem] text-ink-500">{r.meta}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold", tagTones[r.tone])} dir="auto">
                    {r.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
