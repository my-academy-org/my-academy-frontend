import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { DashboardMock } from "@/components/mockups/DashboardMock";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { ROOT_DOMAIN, templates } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

const [modern, , premium] = templates;

export function Hero() {
  return (
    <section id="top" className="overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      <Container>
        <div className="grid items-center gap-x-14 gap-y-14 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-28">
          <div className="animate-fade-up">
            <p className="flex items-center gap-2.5 text-sm font-semibold text-ink-600">
              <span className="size-1.5 rounded-full bg-gold-500" aria-hidden="true" />
              منصة لإدارة الأكاديميات التعليمية
            </p>

            <h1 className="mt-6 text-balance text-[2.375rem] font-bold leading-[1.3] text-ink-950 sm:text-[3.25rem] sm:leading-[1.25] xl:text-[3.625rem]">
              أكاديميتك الإلكترونية الخاصة، بعلامتك{" "}
              <span className="whitespace-nowrap text-brand-700">ونطاقك وطلابك.</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-ink-600 sm:text-lg sm:leading-9">
              My Academy تمنح كل معلّم أكاديمية مستقلة بموقع احترافي ونطاق فرعي خاص، ولوحة تحكم واحدة لإدارة
              الدورات والدروس والطلاب والاختبارات — دون أي تعقيد تقني.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <RequestAcademyButton size="lg" withArrow />
              <Button href="/#platform" variant="secondary" size="lg">
                استكشف المنصة
              </Button>
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-ink-500">
              لا يوجد تسجيل ذاتي: يُنشئ فريقنا أكاديميتك وحسابك ويسلّمك بيانات الدخول.
            </p>
          </div>

          {/* Teacher dashboard running off the page edge, with an academy website laid over it */}
          <div className="relative animate-fade-up [animation-delay:120ms] lg:-me-[24%] xl:-me-[34%]">
            <BrowserFrame url={`${modern.sample.subdomain}.${ROOT_DOMAIN}/dashboard`} className="shadow-float">
              <DashboardMock role="teacher" />
            </BrowserFrame>

            <div className="absolute -bottom-10 -start-3 hidden w-[40%] animate-fade-up [animation-delay:420ms] sm:block lg:-start-10">
              <BrowserFrame url={`${premium.sample.subdomain}.${ROOT_DOMAIN}`} compact dark className="shadow-float">
                <div className="aspect-[4/3] overflow-hidden">
                  <TemplatePreview template="premium" academy={premium.sample} />
                </div>
              </BrowserFrame>
            </div>
          </div>
        </div>
      </Container>

      {/* Tenants */}
      <div className="border-t border-line">
        <Container>
          <div className="grid lg:grid-cols-[1fr_2.8fr]">
            <p className="py-5 text-sm font-semibold leading-6 text-ink-500 lg:py-7 lg:pe-8">
              كل أكاديمية على نطاقها الخاص، ضمن منصة واحدة.
            </p>
            <ul className="grid border-t border-line sm:grid-cols-3 lg:border-t-0">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3.5 border-line py-4 max-sm:border-t max-sm:first:border-t-0 sm:border-s sm:ps-5 sm:max-lg:first:border-s-0 sm:max-lg:first:ps-0 lg:py-7"
                >
                  <span className="flex size-8 shrink-0 overflow-hidden rounded-md ring-1 ring-line" aria-hidden="true">
                    {t.palette.slice(0, 2).map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-end text-[0.9375rem] font-semibold text-ink-900" dir="ltr">
                      {t.sample.subdomain}
                      <span className="text-ink-400">.{ROOT_DOMAIN}</span>
                    </p>
                    <p className="truncate text-xs leading-5 text-ink-500">{t.sample.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
