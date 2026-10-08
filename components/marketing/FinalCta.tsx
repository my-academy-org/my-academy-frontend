import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { RequestAcademyButton } from "./RequestAcademy";

export function FinalCta() {
  return (
    <section className="bg-brand-900 text-white">
      <Container className="grid grid-cols-1 gap-10 py-16 sm:py-24 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16 lg:py-28">
        <Reveal>
          <LogoMark inverse className="size-10" />
          <h2 className="mt-8 text-balance text-[2rem] font-bold leading-[1.3] sm:text-5xl sm:leading-[1.25] lg:text-[3.5rem]">
            ابدأ بناء أكاديميتك اليوم
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-8 text-white/70 sm:text-lg">
            أكاديمية بعلامتك ونطاقك الخاص، وقالب احترافي، ولوحة تحكم متكاملة — ونحن نتولّى الجانب التقني بالكامل.
          </p>
        </Reveal>
        <Reveal delay={120} className="flex flex-col gap-3 sm:flex-row lg:justify-end lg:pb-1.5">
          <RequestAcademyButton size="lg" variant="inverse" withArrow />
          <Button href="/#templates" size="lg" variant="inverse-outline">
            تصفّح القوالب
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
