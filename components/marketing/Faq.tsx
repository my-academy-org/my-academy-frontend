import { Accordion } from "@/components/ui/Accordion";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { faqs } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Faq() {
  return (
    <Section id="faq">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            align="start"
            eyebrow="الأسئلة الشائعة"
            title="أسئلة قبل أن تبدأ"
            description="إجابات مختصرة عن الأكاديميات والنطاقات والقوالب والخطط."
          />
          <div id="contact" className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-gold-50 text-gold-600 ring-1 ring-gold-100">
              <Icon name="chat" />
            </span>
            <p className="mt-4 font-bold text-ink-950">لديك سؤال آخر؟</p>
            <p className="mt-1 text-sm leading-6 text-ink-600">
              أرسل لنا تفاصيل أكاديميتك، وسيتواصل معك فريقنا للإجابة عن كل استفساراتك.
            </p>
            <RequestAcademyButton variant="secondary" size="sm" className="mt-5">
              تواصل مع الفريق
            </RequestAcademyButton>
          </div>
        </div>

        <Accordion group="faq" items={faqs} />
      </Container>
    </Section>
  );
}
