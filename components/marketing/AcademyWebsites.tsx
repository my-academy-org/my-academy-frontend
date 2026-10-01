import { Container, Section } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { ROOT_DOMAIN, templates } from "@/lib/site";

const points: { icon: IconName; title: string; body: string }[] = [
  { icon: "globe", title: "نطاق فرعي خاص", body: `عنوان مستقل لكل أكاديمية مثل name.${ROOT_DOMAIN}` },
  { icon: "palette", title: "هوية المعلّم", body: "الاسم والشعار والألوان والقالب الذي يختاره المعلّم." },
  { icon: "users", title: "تسجيل داخل الأكاديمية", body: "يسجّل الطلاب ويدخلون من موقع الأكاديمية مباشرةً." },
  { icon: "lock", title: "بيانات معزولة", body: "طلاب كل أكاديمية ومحتواها منفصلون تماماً." },
];

export function AcademyWebsites() {
  return (
    <Section id="academies" className="overflow-hidden border-y border-line bg-white">
      <Container>
        <SectionHeader
          eyebrow="مواقع الأكاديميات"
          title="كل معلّم يحصل على موقع أكاديمية خاص به"
          description="موقع جاهز على نطاق فرعي مستقل، بقالب احترافي وهوية المعلّم — يعمل بالكامل على بنية My Academy ويُدار من نفس لوحة التحكم."
        />

        {/* Tenant sites */}
        <div className="-mx-4 mt-14 sm:mx-0 sm:mt-16">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {templates.map((t) => (
              <li key={t.id} className="w-[82%] shrink-0 snap-center sm:w-[60%] md:w-auto">
                <BrowserFrame url={`${t.sample.subdomain}.${ROOT_DOMAIN}`} compact className="shadow-lift">
                  <div className="aspect-[4/3.3] overflow-hidden">
                    <TemplatePreview template={t.id} academy={t.sample} />
                  </div>
                </BrowserFrame>
                <div className="mt-4 flex items-center justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{t.sample.name}</p>
                    <p className="text-xs text-ink-500">{t.sample.teacher}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[0.6875rem] font-bold text-ink-600">
                    قالب {t.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Shared platform base */}
        <div className="relative mt-6 hidden h-10 md:block" aria-hidden="true">
          {["left-[calc(16.667%-0.5rem)]", "left-1/2", "left-[calc(83.333%+0.5rem)]"].map((pos) => (
            <span key={pos} className={`absolute top-0 h-full border-l-2 border-dashed border-line-strong ${pos}`} />
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-brand-900 md:mt-0 px-6 py-5 text-center sm:flex-row sm:text-start">
          <div className="flex items-center gap-3">
            <LogoMark inverse className="size-9" />
            <div>
              <p className="font-bold text-white">منصة My Academy</p>
              <p className="text-sm text-white/60">بنية واحدة · لوحة تحكم موحّدة · أكاديميات مستقلة</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gold-300" dir="ltr">
            *.{ROOT_DOMAIN}
          </p>
        </div>

        <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <li key={p.title} className="flex gap-3.5">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name={p.icon} className="size-[1.125rem]" />
              </span>
              <div>
                <p className="font-bold text-ink-900">{p.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-600">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
