import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { ROOT_DOMAIN, templates } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

const [modern, academic, premium] = templates;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40">
      <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-[28rem] w-[56rem] max-w-full -translate-x-1/2 rounded-full bg-brand-100/40 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-up">
            <Badge tone="outline" className="py-1 ps-1 pe-3 shadow-card">
              <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[0.6875rem] text-white">جديد</span>
              منصة SaaS متكاملة لإدارة الأكاديميات التعليمية
            </Badge>
          </div>

          <h1 className="mt-7 animate-fade-up text-balance text-[2.125rem] font-extrabold leading-[1.3] text-ink-950 [animation-delay:80ms] sm:text-5xl sm:leading-[1.25] lg:text-[3.5rem] lg:leading-[1.25]">
            أكاديميتك الإلكترونية الخاصة،
            <br className="hidden sm:block" />{" "}
            <span className="relative whitespace-nowrap text-brand-700">
              بعلامتك ونطاقك
              <svg
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute inset-x-0 -bottom-1 h-2.5 w-full text-gold-400 sm:-bottom-2"
                aria-hidden="true"
              >
                <path d="M2 9C80 3 220 3 298 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{" "}
            وطلابك.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-pretty text-base leading-8 text-ink-600 [animation-delay:160ms] sm:text-lg sm:leading-9">
            My Academy تمنح كل معلّم أكاديمية مستقلة بموقع احترافي ونطاق فرعي خاص، ولوحة تحكم واحدة لإدارة
            الدورات والدروس والطلاب والاختبارات — دون أي تعقيد تقني.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col items-stretch justify-center gap-3 [animation-delay:240ms] sm:flex-row sm:items-center">
            <RequestAcademyButton size="lg" withArrow />
            <Button href="/#platform" variant="secondary" size="lg">
              استكشف المنصة
            </Button>
          </div>

          <ul className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500 [animation-delay:320ms]">
            {["نطاق فرعي لكل أكاديمية", "3 قوالب احترافية", "لوحات تحكم حسب الدور"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Icon name="check" className="size-4 text-brand-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Product composition: teacher dashboard + academy websites on their own subdomains */}
        <div className="relative mx-auto mt-14 max-w-5xl animate-fade-up [animation-delay:380ms] sm:mt-20">
          <BrowserFrame url={`${modern.sample.subdomain}.${ROOT_DOMAIN}/dashboard`} className="shadow-float">
            <DashboardMock role="teacher" />
          </BrowserFrame>

          <AcademyCard
            className="-end-16 top-10 w-[30%] -rotate-2 xl:-end-24"
            template="premium"
          />
          <AcademyCard
            className="-start-14 -bottom-10 w-[32%] rotate-2 xl:-start-24"
            template="academic"
          />
        </div>

        {/* Tenants strip */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:mt-24">
          <p className="text-sm font-semibold text-ink-500">كل أكاديمية على نطاقها الخاص — ضمن منصة واحدة</p>
          <ul className="flex flex-wrap justify-center gap-2" dir="ltr">
            {[modern, academic, premium].map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 ps-1.5 pe-3.5 text-sm font-semibold text-ink-700 shadow-card"
              >
                <span className="flex size-6 overflow-hidden rounded-full ring-1 ring-line" aria-hidden="true">
                  {t.palette.slice(0, 2).map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span>
                  {t.sample.subdomain}
                  <span className="text-ink-400">.{ROOT_DOMAIN}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function AcademyCard({ template, className }: { template: "academic" | "premium"; className: string }) {
  const t = template === "academic" ? academic : premium;
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <BrowserFrame url={`${t.sample.subdomain}.${ROOT_DOMAIN}`} compact dark={template === "premium"} className="shadow-float">
        <div className="h-[13.5rem] overflow-hidden">
          <TemplatePreview template={template} academy={t.sample} />
        </div>
      </BrowserFrame>
    </div>
  );
}
