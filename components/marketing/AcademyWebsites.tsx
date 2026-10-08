import { Container, Section } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
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
    <Section id="academies" className="overflow-hidden border-y border-line bg-canvas">
      <Container>
        <SectionHeader
          index="03"
          eyebrow="مواقع الأكاديميات"
          title="كل معلّم يحصل على موقع أكاديمية خاص به"
          description="موقع جاهز على نطاق فرعي مستقل، بقالب احترافي وهوية المعلّم — يعمل بالكامل على بنية My Academy ويُدار من نفس لوحة التحكم."
        />

        {/* Tenant sites */}
        <div className="-mx-4 mt-12 sm:mx-0 sm:mt-16">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {templates.map((t, i) => (
              <Reveal as="li" delay={i * 90} key={t.id} className="w-[82%] shrink-0 snap-center sm:w-[60%] md:w-auto">
                <BrowserFrame url={`${t.sample.subdomain}.${ROOT_DOMAIN}`} compact className="shadow-lift">
                  <div className="aspect-[4/3.3] overflow-hidden">
                    <TemplatePreview template={t.id} academy={t.sample} />
                  </div>
                </BrowserFrame>
                <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{t.sample.name}</p>
                    <p className="text-xs leading-5 text-ink-500">{t.sample.teacher}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">قالب {t.name}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Shared platform base */}
        <div className="relative mt-5 hidden h-8 md:block" aria-hidden="true">
          {["left-[calc(16.667%-0.5rem)]", "left-1/2", "left-[calc(83.333%+0.5rem)]"].map((pos) => (
            <span key={pos} className={`absolute top-0 h-full w-px bg-line-strong ${pos}`} />
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-ink-950 px-6 py-5 text-center sm:flex-row sm:text-start md:mt-0">
          <div className="flex items-center gap-3.5">
            <LogoMark inverse className="size-8" />
            <div>
              <p className="font-bold text-white">منصة My Academy</p>
              <p className="text-sm text-white/55">بنية واحدة · لوحة تحكم موحّدة · أكاديميات مستقلة</p>
            </div>
          </div>
          <p className="font-mono text-sm font-semibold text-gold-300" dir="ltr">
            *.{ROOT_DOMAIN}
          </p>
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <Reveal as="li" delay={i * 70} key={p.title} className="border-t border-line-strong pt-5">
              <Icon name={p.icon} className="size-5 text-brand-700" />
              <p className="mt-4 font-bold text-ink-950">{p.title}</p>
              <p className="mt-1.5 text-sm leading-7 text-ink-600">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
