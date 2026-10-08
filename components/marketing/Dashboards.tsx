"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
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
    <Section id="dashboards" className="overflow-hidden bg-ink-950 text-white">
      <Container>
        <SectionHeader
          inverse
          index="05"
          eyebrow="منظومة لوحات التحكم"
          title="تجربة إدارة واحدة، بصلاحيات حسب الدور"
          description="المعلّم والطالب يعملان على نفس النظام وبنفس لغة التصميم — كلٌّ يرى ما يخصّه فقط."
        />

        <div role="tablist" aria-label="لوحات التحكم" className="mt-12 flex gap-8 border-b border-white/10 sm:mt-14">
          {dashboardRoles.map((r) => (
            <button
              key={r.id}
              role="tab"
              id={`tab-${r.id}`}
              aria-selected={active === r.id}
              aria-controls="dashboard-panel"
              onClick={() => setActive(r.id)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 pb-4 text-base font-bold transition-colors",
                active === r.id
                  ? "border-gold-400 text-white"
                  : "border-transparent text-white/50 hover:text-white/80",
              )}
            >
              <Icon name={r.icon} className="size-[1.125rem]" />
              {r.title}
            </button>
          ))}
        </div>

        <div
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-14"
        >
          <div className="order-2 lg:order-1">
            <p className="text-lg leading-8 text-white/80">{role.summary}</p>
            <ul className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
              {role.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 border-t border-white/10 py-3.5 text-[0.9375rem] text-white/85">
                  <Icon name="check" className="mt-1 size-4 shrink-0 text-gold-300" strokeWidth={2.5} />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <BrowserFrame url={urls[active]} className="order-1 ring-1 ring-white/10 lg:order-2">
            <DashboardMock key={active} role={active} className="animate-fade-up [animation-duration:0.4s]" />
          </BrowserFrame>
        </div>

        <ul className="mt-16 grid gap-x-8 gap-y-8 sm:grid-cols-3">
          {([
            { icon: "layers", title: "نظام تصميم موحّد", body: "نفس المكوّنات والتنقّل في كل اللوحات." },
            { icon: "shield", title: "صلاحيات دقيقة", body: "كل دور يصل فقط إلى ما يخصّه من بيانات." },
            { icon: "globe", title: "على نطاق الأكاديمية", body: "المعلّم والطالب يعملان من نطاق أكاديميتهم." },
          ] satisfies { icon: IconName; title: string; body: string }[]).map((p, i) => (
            <Reveal as="li" delay={i * 90} key={p.title} className="border-t border-white/15 pt-5">
              <Icon name={p.icon} className="size-5 text-gold-300" />
              <p className="mt-4 font-bold">{p.title}</p>
              <p className="mt-1.5 text-sm leading-7 text-white/60">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
