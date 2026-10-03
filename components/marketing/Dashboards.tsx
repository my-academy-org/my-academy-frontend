"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { cn } from "@/lib/cn";
import { dashboardRoles, ROOT_DOMAIN, type DashboardRole } from "@/lib/site";

const urls: Record<DashboardRole, string> = {
  teacher: `${ROOT_DOMAIN}/dashboard`,
  student: `ahmed.${ROOT_DOMAIN}/my-courses`,
};

export function Dashboards() {
  const [active, setActive] = useState<DashboardRole>("teacher");
  const role = dashboardRoles.find((r) => r.id === active)!;

  return (
    <Section id="dashboards" className="relative overflow-hidden bg-brand-950 text-white">
      <div className="bg-grid-dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" aria-hidden="true" />
      <Container className="relative">
        <SectionHeader
          inverse
          eyebrow="منظومة لوحات التحكم"
          title="تجربة إدارة واحدة، بصلاحيات حسب الدور"
          description="المعلّم والطالب يعملان على نفس النظام وبنفس لغة التصميم — كلٌّ يرى ما يخصّه فقط."
        />

        <div
          role="tablist"
          aria-label="لوحات التحكم"
          className="mx-auto mt-12 flex w-full max-w-md gap-1 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10"
        >
          {dashboardRoles.map((r) => (
            <button
              key={r.id}
              role="tab"
              id={`tab-${r.id}`}
              aria-selected={active === r.id}
              aria-controls="dashboard-panel"
              onClick={() => setActive(r.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-bold transition-colors sm:text-[0.9375rem]",
                active === r.id ? "bg-white text-brand-900 shadow-lift" : "text-white/65 hover:text-white",
              )}
            >
              <Icon name={r.icon} className="hidden size-4 sm:block" />
              {r.title.replace("لوحة ", "")}
            </button>
          ))}
        </div>

        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-12"
        >
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-extrabold">{role.title}</h3>
            <p className="mt-2 leading-7 text-white/65">{role.summary}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {role.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 text-[0.9375rem] text-white/85">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-400/15 text-gold-300">
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <BrowserFrame url={urls[active]} className="order-1 shadow-float ring-1 ring-white/10 lg:order-2">
            <DashboardMock key={active} role={active} className="animate-fade-up [animation-duration:0.4s]" />
          </BrowserFrame>
        </div>

        <ul className="mt-16 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
          {([
            { icon: "layers", title: "نظام تصميم موحّد", body: "نفس المكوّنات والتنقّل في كل اللوحات." },
            { icon: "shield", title: "صلاحيات دقيقة", body: "كل دور يصل فقط إلى ما يخصّه من بيانات." },
            { icon: "globe", title: "على نطاق الأكاديمية", body: "المعلّم والطالب يعملان من نطاق أكاديميتهم." },
          ] satisfies { icon: IconName; title: string; body: string }[]).map((p) => (
            <li key={p.title} className="flex gap-3">
              <Icon name={p.icon} className="mt-0.5 size-5 shrink-0 text-gold-300" />
              <div>
                <p className="font-bold">{p.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/60">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
