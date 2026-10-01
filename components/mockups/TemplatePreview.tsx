import { cn } from "@/lib/cn";
import type { SampleAcademy, TemplateId } from "@/lib/site";

/**
 * Miniature renderings of the three academy website templates.
 * Every size is in `em`, and the root font-size is tied to the container
 * width (cqw), so a preview scales like an image at any size.
 */
export function TemplatePreview({
  template,
  academy,
  detailed,
  className,
}: {
  template: TemplateId;
  academy: SampleAcademy;
  /** Renders extra sections (used in the full-screen preview modal). */
  detailed?: boolean;
  className?: string;
}) {
  const Body = { modern: Modern, academic: Academic, premium: Premium }[template];
  return (
    <div className={cn("@container", className)} aria-hidden="true">
      <div className="text-[1.6cqw] select-none">
        <Body academy={academy} detailed={detailed} />
      </div>
    </div>
  );
}

type BodyProps = { academy: SampleAcademy; detailed?: boolean };

const courseNames = {
  modern: ["أساسيات JavaScript", "React من الصفر", "تطوير الواجهات"],
  academic: ["الكيمياء العضوية", "الاتزان الكيميائي", "الكيمياء الكهربائية"],
  premium: ["Business English", "IELTS Mastery", "Public Speaking"],
};

/* ------------------------------------------------------------------ */

function Modern({ academy, detailed }: BodyProps) {
  return (
    <div className="bg-white font-sans text-[#0f172a]">
      <header className="flex items-center justify-between px-[2.4em] py-[1.3em]">
        <div className="flex items-center gap-[0.6em]">
          <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#2f5bea] text-[1em] font-extrabold text-white">
            أ
          </span>
          <span className="text-[1.1em] font-extrabold">{academy.name}</span>
        </div>
        <nav className="flex items-center gap-[1.6em] text-[0.9em] text-slate-500">
          <span className="font-bold text-[#0f172a]">الرئيسية</span>
          <span>الدورات</span>
          <span>عن المعلّم</span>
          <span className="rounded-full bg-[#2f5bea] px-[1.2em] py-[0.55em] font-bold text-white">سجّل الآن</span>
        </nav>
      </header>

      <section className="grid grid-cols-[1.1fr_1fr] items-center gap-[2.4em] px-[2.4em] pt-[1.6em] pb-[2.6em]">
        <div>
          <span className="inline-block rounded-full bg-[#eef2ff] px-[0.9em] py-[0.3em] text-[0.85em] font-bold text-[#2f5bea]">
            دفعة جديدة متاحة الآن
          </span>
          <p className="mt-[0.8em] text-[2.5em] leading-[1.3] font-extrabold">
            تعلّم البرمجة <span className="text-[#2f5bea]">خطوة بخطوة</span> حتى الاحتراف
          </p>
          <p className="mt-[0.8em] text-[1em] leading-[1.8] text-slate-500">
            دورات عملية في {academy.subject} مع {academy.teacher}، ومشاريع حقيقية واختبارات بعد كل وحدة.
          </p>
          <div className="mt-[1.3em] flex gap-[0.6em] text-[0.95em] font-bold">
            <span className="rounded-[0.7em] bg-[#2f5bea] px-[1.3em] py-[0.7em] text-white">ابدأ التعلّم</span>
            <span className="rounded-[0.7em] border border-slate-200 px-[1.3em] py-[0.7em]">تصفّح الدورات</span>
          </div>
        </div>
        <div className="relative aspect-[5/4] rounded-[1.6em] bg-[#eef2ff]">
          <div className="absolute inset-[12%] rounded-[1em] bg-white shadow-[0_1em_2em_-1em_rgba(47,91,234,0.35)]">
            <div className="flex gap-[0.35em] p-[0.8em]">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-[0.55em] rounded-full bg-slate-200" />
              ))}
            </div>
            <div className="space-y-[0.5em] px-[1em]" dir="ltr">
              <span className="block h-[0.55em] w-[70%] rounded bg-[#2f5bea]/70" />
              <span className="block h-[0.55em] w-[50%] rounded bg-slate-200" />
              <span className="block h-[0.55em] w-[80%] rounded bg-slate-200" />
              <span className="block h-[0.55em] w-[40%] rounded bg-[#22c55e]/60" />
            </div>
          </div>
          <div className="absolute -bottom-[1em] start-[-1em] rounded-[0.9em] bg-white px-[1em] py-[0.7em] text-[0.85em] shadow-[0_0.6em_1.6em_-0.6em_rgba(15,23,42,0.3)]">
            <p className="font-extrabold">+1,200 طالب</p>
            <p className="text-slate-500">انضموا هذا العام</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] px-[2.4em] py-[2em]">
        <div className="mb-[1.2em] flex items-end justify-between">
          <p className="text-[1.5em] font-extrabold">أحدث الدورات</p>
          <span className="text-[0.9em] font-bold text-[#2f5bea]">عرض الكل</span>
        </div>
        <div className="grid grid-cols-3 gap-[1.2em]">
          {courseNames.modern.map((c, i) => (
            <div key={c} className="overflow-hidden rounded-[1em] border border-slate-200 bg-white">
              <div className={cn("aspect-[16/9]", ["bg-[#dbe4ff]", "bg-[#d1fae5]", "bg-[#fde68a]/60"][i])} />
              <div className="p-[0.9em]">
                <p className="text-[1em] font-bold">{c}</p>
                <p className="mt-[0.3em] text-[0.8em] text-slate-500">{12 + i * 4} درساً · مستوى {["مبتدئ", "متوسط", "متقدم"][i]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {detailed && (
        <>
          <section className="grid grid-cols-3 gap-[1.2em] px-[2.4em] py-[2.4em]">
            {["مشاريع عملية", "اختبارات بعد كل وحدة", "متابعة تقدّمك"].map((t) => (
              <div key={t} className="rounded-[1em] border border-slate-200 p-[1.2em]">
                <span className="mb-[0.8em] block size-[2.2em] rounded-[0.6em] bg-[#eef2ff]" />
                <p className="text-[1.05em] font-bold">{t}</p>
                <p className="mt-[0.4em] text-[0.85em] leading-[1.7] text-slate-500">محتوى منظّم يساعدك على التعلّم بثقة وبالسرعة المناسبة لك.</p>
              </div>
            ))}
          </section>
          <section className="mx-[2.4em] mb-[2.4em] flex items-center justify-between rounded-[1.4em] bg-[#2f5bea] px-[2em] py-[1.8em] text-white">
            <p className="text-[1.5em] font-extrabold">جاهز تبدأ رحلتك؟</p>
            <span className="rounded-[0.7em] bg-white px-[1.3em] py-[0.7em] text-[0.95em] font-bold text-[#2f5bea]">أنشئ حسابك</span>
          </section>
          <footer className="border-t border-slate-200 px-[2.4em] py-[1.2em] text-[0.8em] text-slate-500" dir="ltr">
            {academy.subdomain}.myacademy.com
          </footer>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Academic({ academy, detailed }: BodyProps) {
  return (
    <div className="bg-[#f6f1e6] text-[#1c2b4a]">
      <div className="flex justify-between bg-[#1c2b4a] px-[2.4em] py-[0.45em] text-[0.75em] text-white/70">
        <span>{academy.subject}</span>
        <span dir="ltr">{academy.subdomain}.myacademy.com</span>
      </div>
      <header className="border-b border-[#1c2b4a]/15 px-[2.4em] pt-[1.4em] pb-[1em] text-center">
        <span className="mx-auto grid size-[3em] place-items-center rounded-full border-[0.15em] border-[#7a2232] font-serif text-[1.1em] font-bold text-[#7a2232]">
          س
        </span>
        <p className="mt-[0.4em] font-serif text-[1.5em] font-bold">{academy.name}</p>
        <nav className="mt-[0.6em] flex justify-center gap-[1.8em] text-[0.88em] text-[#1c2b4a]/70">
          <span className="border-b-[0.15em] border-[#7a2232] font-bold text-[#1c2b4a]">الرئيسية</span>
          <span>المقررات</span>
          <span>الجدول</span>
          <span>الاختبارات</span>
          <span>تسجيل الدخول</span>
        </nav>
      </header>

      <section className="px-[3em] pt-[2.4em] pb-[2.4em] text-center">
        <p className="text-[0.85em] font-bold text-[#7a2232]">مرحباً بكم في</p>
        <p className="mt-[0.4em] font-serif text-[2.6em] leading-[1.35] font-bold">
          منهج متكامل لفهم الكيمياء
          <br />
          بعمق ووضوح
        </p>
        <div className="mx-auto my-[1em] flex w-[10em] items-center gap-[0.5em]">
          <span className="h-px flex-1 bg-[#7a2232]/40" />
          <span className="size-[0.45em] rotate-45 bg-[#7a2232]" />
          <span className="h-px flex-1 bg-[#7a2232]/40" />
        </div>
        <p className="mx-auto max-w-[34em] text-[1em] leading-[1.9] text-[#1c2b4a]/70">
          شروحات مرتّبة حسب المنهج مع {academy.teacher}، وبنوك أسئلة واختبارات دورية لقياس مستواك.
        </p>
        <div className="mt-[1.4em] flex justify-center gap-[0.7em] text-[0.95em] font-bold">
          <span className="bg-[#1c2b4a] px-[1.5em] py-[0.7em] text-[#f6f1e6]">التسجيل في المقرر</span>
          <span className="border border-[#1c2b4a] px-[1.5em] py-[0.7em]">تصفّح الوحدات</span>
        </div>
      </section>

      <section className="border-t border-[#1c2b4a]/15 bg-[#fbf8f1] px-[2.4em] py-[2em]">
        <p className="mb-[1.2em] text-center font-serif text-[1.45em] font-bold">المقررات الدراسية</p>
        <div className="grid grid-cols-3 gap-[1.2em]">
          {courseNames.academic.map((c, i) => (
            <div key={c} className="border border-[#1c2b4a]/15 border-t-[0.25em] border-t-[#7a2232] bg-white p-[1.1em]">
              <p className="text-[0.78em] font-bold text-[#7a2232]">الوحدة {["الأولى", "الثانية", "الثالثة"][i]}</p>
              <p className="mt-[0.3em] font-serif text-[1.2em] font-bold">{c}</p>
              <p className="mt-[0.5em] text-[0.82em] leading-[1.7] text-[#1c2b4a]/60">{8 + i * 3} محاضرات · {2 + i} اختبارات</p>
            </div>
          ))}
        </div>
      </section>

      {detailed && (
        <>
          <section className="grid grid-cols-[1fr_1.3fr] items-center gap-[2em] px-[2.4em] py-[2.4em]">
            <div className="aspect-[4/5] border border-[#1c2b4a]/15 bg-[#e9e1cf] p-[0.6em]">
              <div className="h-full border border-[#7a2232]/30" />
            </div>
            <div>
              <p className="text-[0.85em] font-bold text-[#7a2232]">عن المعلّمة</p>
              <p className="mt-[0.3em] font-serif text-[1.8em] font-bold">{academy.teacher}</p>
              <p className="mt-[0.6em] text-[0.95em] leading-[1.9] text-[#1c2b4a]/70">
                خبرة في تدريس {academy.subject}، بأسلوب يربط المفاهيم بالتطبيق ويهيّئ الطالب للاختبارات.
              </p>
            </div>
          </section>
          <footer className="bg-[#1c2b4a] px-[2.4em] py-[1.4em] text-center text-[0.8em] text-white/60">
            <span className="font-serif text-[1.2em] text-white">{academy.name}</span>
          </footer>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Premium({ academy, detailed }: BodyProps) {
  return (
    <div className="bg-[#0f0f11] text-[#f3eee4]">
      <header className="flex items-center justify-between border-b border-white/10 px-[2.4em] py-[1.3em]">
        <span className="text-[1.05em] font-bold">
          <span className="text-[#d4b483]">◆</span> {academy.name}
        </span>
        <nav className="flex items-center gap-[1.6em] text-[0.88em] text-white/55">
          <span className="text-white">البرامج</span>
          <span>المنهجية</span>
          <span>آراء الطلاب</span>
          <span className="rounded-full border border-[#d4b483]/60 px-[1.2em] py-[0.5em] font-bold text-[#d4b483]">احجز مقعدك</span>
        </nav>
      </header>

      <section className="grid grid-cols-[1.25fr_1fr] items-center gap-[2em] px-[2.4em] py-[2.8em]">
        <div>
          <p className="text-[0.85em] font-bold text-[#d4b483]">{academy.teacher}</p>
          <p className="mt-[0.6em] text-[2.8em] leading-[1.3] font-light">
            إنجليزية بمستوى
            <br />
            <span className="font-extrabold text-[#d4b483]">احترافي</span> يفتح لك الأبواب
          </p>
          <p className="mt-[0.9em] max-w-[28em] text-[0.98em] leading-[1.9] text-white/55">
            برامج مكثّفة بأعداد محدودة، ومتابعة شخصية لكل طالب حتى يصل إلى هدفه.
          </p>
          <div className="mt-[1.5em] flex items-center gap-[1.2em] text-[0.95em] font-bold">
            <span className="rounded-full bg-[#d4b483] px-[1.5em] py-[0.75em] text-[#0f0f11]">انضم إلى البرنامج</span>
            <span className="text-white/70">شاهد المنهجية ←</span>
          </div>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-[78%]">
          <div className="absolute inset-0 rounded-t-full border border-[#d4b483]/40" />
          <div className="absolute inset-[0.8em] rounded-t-full bg-gradient-to-b from-[#2a2620] to-[#141311]" />
          <div className="absolute -start-[1.4em] bottom-[1.6em] rounded-[0.8em] border border-white/10 bg-[#18181b] px-[1em] py-[0.7em]">
            <p className="text-[1.3em] font-extrabold text-[#d4b483]">IELTS 7.5+</p>
            <p className="text-[0.75em] text-white/55">متوسط نتائج الدفعة</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-[2.4em] py-[2em]">
        <p className="mb-[1.2em] text-[1.4em] font-bold">البرامج</p>
        <div className="grid grid-cols-3 gap-[1em]">
          {courseNames.premium.map((c, i) => (
            <div key={c} className="rounded-[1em] border border-white/10 bg-[#18181b] p-[1.1em]">
              <p className="text-[1.6em] font-light text-[#d4b483]" dir="ltr">0{i + 1}</p>
              <p className="mt-[0.4em] text-[1.05em] font-bold" dir="ltr">{c}</p>
              <p className="mt-[0.4em] text-[0.8em] text-white/50">{6 + i * 2} أسابيع · مباشر ومسجّل</p>
            </div>
          ))}
        </div>
      </section>

      {detailed && (
        <>
          <section className="px-[2.4em] py-[2.4em] text-center">
            <p className="mx-auto max-w-[30em] text-[1.4em] leading-[1.7] font-light text-white/85">
              «تغيّرت طريقة تعاملي مع اللغة بالكامل، والمتابعة الشخصية كانت الفارق الحقيقي.»
            </p>
            <p className="mt-[0.8em] text-[0.85em] text-[#d4b483]">— إحدى طالبات البرنامج</p>
          </section>
          <footer className="border-t border-white/10 px-[2.4em] py-[1.2em] text-[0.8em] text-white/40" dir="ltr">
            {academy.subdomain}.myacademy.com
          </footer>
        </>
      )}
    </div>
  );
}
