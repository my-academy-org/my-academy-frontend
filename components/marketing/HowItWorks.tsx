import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { steps } from "@/lib/site";

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="border-y border-line bg-white">
      <Container>
        <SectionHeader
          eyebrow="كيف تعمل المنصة"
          title="من الفكرة إلى أكاديمية تعمل في أربع خطوات"
          description="لا تحتاج إلى مطوّر أو استضافة أو إعدادات تقنية. نحن نجهّز البنية، وأنت تركّز على التعليم."
        />

        <ol className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="group relative flex flex-col rounded-2xl border border-line bg-canvas p-6 transition-colors hover:border-brand-200 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-white text-brand-700 shadow-card ring-1 ring-line transition-colors group-hover:bg-brand-700 group-hover:text-white group-hover:ring-brand-700">
                  <Icon name={step.icon} />
                </span>
                <span className="text-4xl font-extrabold text-ink-300/60" dir="ltr">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-bold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-7 text-ink-600">{step.body}</p>
              {i < steps.length - 1 && (
                <Icon
                  name="chevron-side"
                  className="absolute -end-4 top-1/2 z-10 hidden size-7 -translate-y-1/2 rounded-full border border-line bg-white p-1.5 text-ink-400 rtl:rotate-180 lg:block"
                />
              )}
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
