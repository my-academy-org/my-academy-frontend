import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { RequestAcademyButton } from "./RequestAcademy";

export function FinalCta() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
          <div className="bg-grid-dark mask-fade-y pointer-events-none absolute inset-0" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-gold-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <LogoMark inverse className="mx-auto size-12" />
            <h2 className="mt-8 text-balance text-3xl font-extrabold leading-[1.35] text-white sm:text-4xl lg:text-5xl lg:leading-[1.3]">
              ابدأ بناء أكاديميتك اليوم
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-8 text-white/70 sm:text-lg">
              أكاديمية بعلامتك ونطاقك الخاص، وقالب احترافي، ولوحة تحكم متكاملة — ونحن نتولّى الجانب التقني بالكامل.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <RequestAcademyButton size="lg" variant="inverse" withArrow />
              <Button href="/#templates" size="lg" variant="inverse-outline">
                تصفّح القوالب
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
