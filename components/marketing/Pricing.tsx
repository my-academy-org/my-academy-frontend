import { Badge } from "@/components/ui/Badge";
import { Container, Section } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import { planComparison, plans } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Pricing() {
  return (
    <Section id="pricing">
      <Container>
        <SectionHeader
          eyebrow="الخطط"
          title="خطتان واضحتان، بلا تعقيد"
          description="الفرق الوحيد هو من يدير محتوى موقع أكاديميتك: فريقنا نيابةً عنك، أو أنت مباشرةً."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:mt-16 md:grid-cols-2 md:gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Comparison */}
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm sm:text-[0.9375rem]">
            <caption className="sr-only">مقارنة بين خطتي Basic و Pro</caption>
            <thead>
              <tr className="border-b border-line bg-canvas text-ink-500">
                <th scope="col" className="px-4 py-3.5 text-start font-semibold sm:px-6">الميزة</th>
                <th scope="col" className="w-[26%] px-2 py-3.5 text-center font-bold text-ink-900" dir="ltr">Basic</th>
                <th scope="col" className="w-[26%] px-2 py-3.5 text-center font-bold text-brand-700" dir="ltr">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {planComparison.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-4 py-3.5 text-start font-semibold text-ink-800 sm:px-6">{row.label}</th>
                  <Cell value={row.basic} />
                  <Cell value={row.pro} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

function Cell({ value }: { value: string | boolean }) {
  return (
    <td className="px-2 py-3.5 text-center">
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

export function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const featured = plan.featured;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl p-7 sm:p-8",
        featured
          ? "bg-brand-900 text-white shadow-float ring-1 ring-brand-800"
          : "border border-line bg-white shadow-card",
      )}
    >
      {featured && (
        <div className="bg-grid-dark pointer-events-none absolute inset-0 rounded-3xl [mask-image:linear-gradient(to_bottom,#000,transparent_60%)]" aria-hidden="true" />
      )}
      <div className="relative flex items-center justify-between">
        <h3 className="text-2xl font-extrabold" dir="ltr">{plan.name}</h3>
        {featured && <Badge tone="accent">الأكثر مرونة</Badge>}
      </div>
      <p className={cn("relative mt-3 min-h-14 text-[0.9375rem] leading-7", featured ? "text-white/70" : "text-ink-600")}>
        {plan.tagline}
      </p>

      <div className={cn("relative mt-6 border-y py-5", featured ? "border-white/10" : "border-line")}>
        {plan.price ? (
          <p className="text-4xl font-extrabold">{plan.price}</p>
        ) : (
          <>
            <p className="text-2xl font-extrabold">سعر حسب حجم الأكاديمية</p>
            <p className={cn("mt-1 text-sm", featured ? "text-white/55" : "text-ink-500")}>
              يتواصل معك فريقنا بعرض مناسب لعدد طلابك.
            </p>
          </>
        )}
      </div>

      {plan.includesLabel && (
        <p className={cn("relative mt-6 text-sm font-bold", featured ? "text-gold-300" : "text-ink-900")}>
          {plan.includesLabel}
        </p>
      )}
      <ul className={cn("relative flex-1 space-y-3.5", plan.includesLabel ? "mt-4" : "mt-6")}>
        {plan.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[0.9375rem]">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                featured ? "bg-gold-400/15 text-gold-300" : "bg-brand-50 text-brand-700",
              )}
            >
              <Icon name="check" className="size-3" strokeWidth={3} />
            </span>
            <span className={featured ? "text-white/90" : "text-ink-700"}>{item}</span>
          </li>
        ))}
      </ul>

      <RequestAcademyButton
        plan={plan.id}
        size="lg"
        variant={featured ? "inverse" : "secondary"}
        withArrow
        className="relative mt-8 w-full"
      >
        {`ابدأ بخطة ${plan.name}`}
      </RequestAcademyButton>
    </div>
  );
}
