import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { steps } from "@/lib/site";

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-y border-line bg-canvas">
      <Container>
        <SectionHeader
          index="07"
          eyebrow="كيف تعمل المنصة"
          title="من الفكرة إلى أكاديمية تعمل في أربع خطوات"
          description="لا تحتاج إلى مطوّر أو استضافة أو إعدادات تقنية. نحن نجهّز البنية، وأنت تركّز على التعليم."
        />

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" delay={i * 90} key={step.title} className="border-t-2 border-ink-900 pt-6">
              <span className="block text-[3.25rem] font-bold leading-none tabular-nums text-brand-700">{i + 1}</span>
              <h3 className="mt-6 text-lg font-bold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-7 text-ink-600">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
