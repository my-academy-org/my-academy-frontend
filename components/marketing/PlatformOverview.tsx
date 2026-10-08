import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { lifecycle, roleLabels } from "@/lib/site";

const roleDot = {
  admin: "bg-ink-950",
  teacher: "bg-brand-600",
  student: "bg-brand-300",
  system: "bg-gold-500",
};

export function PlatformOverview() {
  return (
    <Section id="platform" className="border-y border-line bg-canvas">
      <Container>
        <SectionHeader
          index="01"
          eyebrow="نظرة على المنصة"
          title="منصة واحدة تدير دورة حياة الأكاديمية بالكامل"
          description="من لحظة إنشاء الأكاديمية حتى متابعة نتائج آخر طالب — كل دور يعرف مكانه، وكل خطوة مترابطة مع ما قبلها."
        />

        <ol className="mt-12 border-t border-ink-900 sm:mt-16">
          {lifecycle.map((step, i) => (
            <Reveal
              as="li"
              delay={i * 60}
              key={step.title}
              className="grid grid-cols-[2.25rem_1fr] gap-x-4 gap-y-1.5 border-b border-line py-6 lg:grid-cols-[3.5rem_10rem_18rem_1fr] lg:items-baseline lg:gap-x-8 lg:py-7"
            >
              <span className="text-sm font-semibold tabular-nums text-ink-400 lg:text-base">0{i + 1}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-600">
                <span className={cn("size-2 rounded-full", roleDot[step.role])} aria-hidden="true" />
                {roleLabels[step.role]}
              </span>
              <h3 className="col-start-2 text-lg font-bold text-ink-950 lg:col-start-auto lg:text-xl">{step.title}</h3>
              <p className="col-start-2 text-[0.9375rem] leading-7 text-ink-600 lg:col-start-auto">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
