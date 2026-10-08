import { Badge } from "@/components/ui/Badge";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { planComparison, plans } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Pricing() {
  return (
    <Section id="pricing">
      <Container>
        <SectionHeader
          index="06"
          eyebrow="الخطط"
          title="خطتان واضحتان، بلا تعقيد"
          description="الفرق الوحيد هو من يدير محتوى موقع أكاديميتك: فريقنا نيابةً عنك، أو أنت مباشرةً."
        />

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 md:gap-6">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} delay={i * 100} />
          ))}
        </div>

        {/* Comparison */}
        <Reveal className="mt-14">
          <table className="w-full border-t border-ink-900 text-sm sm:text-[0.9375rem]">
            <caption className="sr-only">مقارنة بين خطتي Basic و Pro</caption>
            <thead>
              <tr className="border-b border-line text-ink-500">
                <th scope="col" className="py-4 pe-4 text-start font-semibold">الميزة</th>
                <th scope="col" className="w-[26%] px-2 py-4 text-center font-bold text-ink-900" dir="ltr">Basic</th>
                <th scope="col" className="w-[26%] px-2 py-4 text-center font-bold text-brand-700" dir="ltr">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-b border-line">
              {planComparison.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-4 pe-4 text-start font-semibold text-ink-800">{row.label}</th>
                  <Cell value={row.basic} />
                  <Cell value={row.pro} />
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </Section>
  );
}

function Cell({ value }: { value: string | boolean }) {
  return (
    <td className="px-2 py-4 text-center">
      {typeof value === "string" ? (
        <span className="text-xs font-semibold text-ink-600 sm:text-sm">{value}</span>
      ) : value ? (
        <Icon name="check" className="mx-auto size-5 text-brand-600" aria-label="متاح" />
      ) : (
        <Icon name="minus" className="mx-auto size-5 text-ink-300" aria-label="غير متاح" />
      )}
    </td>
  );
}

export function PlanCard({ plan, delay }: { plan: (typeof plans)[number]; delay?: number }) {
  const featured = plan.featured;
  return (
    <Reveal
      delay={delay}
      className={cn(
        "flex flex-col rounded-2xl p-7 sm:p-9",
        featured ? "bg-ink-950 text-white" : "bg-white ring-1 ring-inset ring-line-strong",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold" dir="ltr">{plan.name}</h3>
        {featured && <Badge tone="accent">الأكثر مرونة</Badge>}
      </div>
      <p className={cn("mt-3 min-h-14 text-[0.9375rem] leading-7", featured ? "text-white/65" : "text-ink-600")}>
        {plan.tagline}
      </p>

      <div className={cn("mt-6 border-y py-5", featured ? "border-white/10" : "border-line")}>
        {plan.price ? (
          <p className="text-4xl font-bold">{plan.price}</p>
        ) : (
          <>
            <p className="text-xl font-bold">سعر حسب حجم الأكاديمية</p>
            <p className={cn("mt-1 text-sm", featured ? "text-white/55" : "text-ink-500")}>
              يتواصل معك فريقنا بعرض مناسب لعدد طلابك.
            </p>
          </>
        )}
      </div>

      {plan.includesLabel && (
        <p className={cn("mt-6 text-sm font-bold", featured ? "text-gold-300" : "text-ink-900")}>
          {plan.includesLabel}
        </p>
      )}
      <ul className={cn("flex-1 space-y-3.5", plan.includesLabel ? "mt-4" : "mt-6")}>
        {plan.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[0.9375rem]">
            <Icon
              name="check"
              className={cn("mt-1 size-4 shrink-0", featured ? "text-gold-300" : "text-brand-600")}
              strokeWidth={2.5}
            />
            <span className={featured ? "text-white/90" : "text-ink-700"}>{item}</span>
          </li>
        ))}
      </ul>

      <RequestAcademyButton
        plan={plan.id}
        size="lg"
        variant={featured ? "inverse" : "secondary"}
        withArrow
        className="mt-9 w-full"
      >
        {`ابدأ بخطة ${plan.name}`}
      </RequestAcademyButton>
    </Reveal>
  );
}
