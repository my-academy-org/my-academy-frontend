import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { lifecycle, roleLabels } from "@/lib/site";

const roleTone = {
  admin: "bg-ink-950 text-white",
  teacher: "bg-brand-700 text-white",
  student: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
  system: "bg-gold-50 text-gold-600 ring-1 ring-inset ring-gold-100",
};

export function PlatformOverview() {
  return (
    <Section id="platform" className="border-y border-line bg-white">
      <Container>
        <SectionHeader
          eyebrow="نظرة على المنصة"
          title="منصة واحدة تدير دورة حياة الأكاديمية بالكامل"
          description="من لحظة إنشاء الأكاديمية حتى متابعة نتائج آخر طالب — كل دور يعرف مكانه، وكل خطوة مترابطة مع ما قبلها."
        />

        {/* Desktop: horizontal flow */}
        <ol className="relative mt-16 hidden grid-cols-5 gap-4 lg:grid">
          <span className="absolute inset-x-[10%] top-7 h-px bg-[repeating-linear-gradient(to_left,var(--color-line-strong)_0_6px,transparent_6px_12px)]" aria-hidden="true" />
          {lifecycle.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative grid size-14 place-items-center rounded-2xl border border-line bg-white text-brand-700 shadow-lift">
                <Icon name={step.icon} className="size-6" />
                <span className="absolute -top-2 -end-2 grid size-6 place-items-center rounded-full bg-canvas text-[0.6875rem] font-bold text-ink-500 ring-1 ring-line">
                  {i + 1}
                </span>
              </div>
              <span className={cn("mt-5 rounded-full px-2.5 py-0.5 text-xs font-bold", roleTone[step.role])}>
                {roleLabels[step.role]}
              </span>
              <h3 className="mt-3 text-[1.0625rem] font-bold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-600">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Mobile & tablet: vertical timeline */}
        <ol className="mx-auto mt-12 max-w-xl lg:hidden">
          {lifecycle.map((step, i) => (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {i < lifecycle.length - 1 && (
                <span className="absolute start-6 top-14 bottom-1 w-px bg-line-strong" aria-hidden="true" />
              )}
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-white text-brand-700 shadow-card">
                <Icon name={step.icon} className="size-5" />
              </div>
              <div className="pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-ink-400">0{i + 1}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-bold", roleTone[step.role])}>
                    {roleLabels[step.role]}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-ink-950">{step.title}</h3>
                <p className="mt-1 text-sm leading-7 text-ink-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
