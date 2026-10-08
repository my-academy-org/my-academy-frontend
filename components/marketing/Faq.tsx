import { Accordion } from "@/components/ui/Accordion";
import { Container, Section } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { faqs } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Faq() {
  return (
    <Section id="faq">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            layout="stack"
            index="08"
            eyebrow="الأسئلة الشائعة"
            title="أسئلة قبل أن تبدأ"
            description="إجابات مختصرة عن الأكاديميات والنطاقات والقوالب والخطط."
          />
          <div id="contact" className="mt-10 border-t border-line pt-6">
            <p className="font-bold text-ink-950">لديك سؤال آخر؟</p>
            <p className="mt-1.5 max-w-sm text-sm leading-7 text-ink-600">
              أرسل لنا تفاصيل أكاديميتك، وسيتواصل معك فريقنا للإجابة عن كل استفساراتك.
            </p>
            <RequestAcademyButton variant="secondary" size="sm" className="mt-5">
              تواصل مع الفريق
            </RequestAcademyButton>
          </div>
        </div>

        <Reveal>
          <Accordion group="faq" items={faqs} />
        </Reveal>
      </Container>
    </Section>
  );
}
