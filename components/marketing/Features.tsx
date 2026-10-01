import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { features as f, ROOT_DOMAIN, templates } from "@/lib/site";
import { FeatureCard } from "./FeatureCard";

export function Features() {
  return (
    <Section id="features">
      <Container>
        <SectionHeader
          eyebrow="المميزات"
          title="كل ما تحتاجه لإدارة أكاديمية حقيقية"
          description="أدوات متكاملة صُممت حول طريقة عمل المعلّم الفعلية: من إعداد الأكاديمية إلى متابعة نتائج كل طالب."
        />

        <div className="mt-14 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <FeatureCard feature={f.academy} className="md:col-span-2">
            <AcademySettingsVisual />
          </FeatureCard>
          <FeatureCard feature={f.codes}>
            <CodesVisual />
          </FeatureCard>
          <FeatureCard feature={f.exams}>
            <ExamVisual />
          </FeatureCard>
          <FeatureCard feature={f.progress}>
            <ProgressVisual />
          </FeatureCard>
          <FeatureCard feature={f.tenancy} className="md:col-span-2 lg:col-span-1">
            <TenancyVisual />
          </FeatureCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-5 lg:grid-cols-5 lg:gap-5">
          {[f.courses, f.lessons, f.students, f.landing, f.media].map((feature, i, all) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              className={cn(i === all.length - 1 && "sm:col-span-2 lg:col-span-1")}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------- Mini product visuals (decorative) ---------------- */

function AcademySettingsVisual() {
  return (
    <div aria-hidden="true" className="w-full max-w-lg rounded-xl border border-line bg-white p-4 shadow-lift sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-[#2f5bea] text-lg font-extrabold text-white">أ</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-900">أكاديمية أحمد للبرمجة</p>
          <p className="text-xs text-ink-500" dir="ltr">ahmed.{ROOT_DOMAIN}</p>
        </div>
        <span className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink-600">تغيير الشعار</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">القالب</p>
          <div className="flex gap-1.5">
            {templates.map((t, i) => (
              <span
                key={t.id}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-center text-[0.6875rem] font-bold",
                  i === 0 ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line text-ink-500",
                )}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-ink-500">اللون الأساسي</p>
          <div className="flex gap-1.5">
            {["#2f5bea", "#105544", "#7a2232", "#0f0f11", "#c3913a"].map((c, i) => (
              <span
                key={c}
                className={cn("size-7 rounded-full ring-offset-2", i === 0 && "ring-2 ring-ink-900")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodesVisual() {
  const codes = [
    { code: "JS-7KQ2-M9", state: "مُستخدم", used: true },
    { code: "JS-P4XA-2C", state: "متاح" },
    { code: "RX-91LD-QE", state: "متاح" },
  ];
  return (
    <ul aria-hidden="true" className="flex w-full max-w-64 flex-col gap-2">
      {codes.map((c, i) => (
        <li
          key={c.code}
          className={cn(
            "flex items-center justify-between rounded-xl border border-dashed bg-white px-3.5 py-2.5 shadow-card",
            c.used ? "border-line-strong" : "border-brand-300",
            i === 1 && "translate-x-3 rtl:-translate-x-3",
          )}
        >
          <span dir="ltr" className={cn("font-mono text-sm font-bold tracking-wider", c.used ? "text-ink-400 line-through" : "text-ink-900")}>
            {c.code}
          </span>
          <span className={cn("text-[0.6875rem] font-bold", c.used ? "text-ink-400" : "text-brand-600")}>{c.state}</span>
        </li>
      ))}
    </ul>
  );
}

function ExamVisual() {
  const score = 88;
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div aria-hidden="true" className="flex w-full max-w-64 items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-lift">
      <div className="relative size-20 shrink-0">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--color-brand-500)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - score / 100)}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-lg font-extrabold text-ink-900" dir="ltr">
          {score}%
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-xs font-bold text-ink-900">اختبار الوحدة الثالثة</p>
        {[true, true, false, true].map((ok, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={cn("grid size-3.5 place-items-center rounded-full", ok ? "bg-brand-500" : "bg-red-400")}>
              <Icon name={ok ? "check" : "x"} className="size-2.5 text-white" strokeWidth={3} />
            </span>
            <span className="h-1.5 flex-1 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressVisual() {
  const rows = [
    { name: "يوسف", value: 92 },
    { name: "مريم", value: 76 },
    { name: "عمر", value: 48 },
    { name: "نور", value: 21, flag: true },
  ];
  return (
    <ul aria-hidden="true" className="w-full max-w-64 space-y-3 rounded-xl border border-line bg-white p-4 shadow-lift">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-2.5 text-xs">
          <span className="w-9 shrink-0 font-semibold text-ink-700">{r.name}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full rounded-full", r.flag ? "bg-gold-400" : "bg-brand-500")}
              style={{ width: `${r.value}%` }}
            />
          </span>
          <span className="w-8 shrink-0 text-end font-bold text-ink-500" dir="ltr">
            {r.value}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function TenancyVisual() {
  return (
    <div aria-hidden="true" className="w-full max-w-64">
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card">
            <span className="size-2.5 rounded-full" style={{ background: t.palette[0] }} />
            <span className="flex-1 truncate text-xs font-bold text-ink-800" dir="ltr">
              {t.sample.subdomain}.{ROOT_DOMAIN}
            </span>
            <Icon name="lock" className="size-3.5 text-ink-400" />
          </div>
        ))}
      </div>
      <div className="mx-6 flex justify-between" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-3 w-px bg-line-strong" />
        ))}
      </div>
      <div className="rounded-xl bg-brand-800 px-3 py-2.5 text-center text-xs font-bold text-white">
        بنية My Academy المشتركة
      </div>
    </div>
  );
}
