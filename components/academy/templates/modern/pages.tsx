import Link from "next/link";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { authCopy, TEACHER_LOGIN_NOTE, type AuthMode } from "@/components/academy/shared/auth";
import { AcademyMark } from "@/components/academy/shared/brand";
import { ContactForm, ForgotPasswordForm, LoginForm, RegisterForm } from "@/components/academy/shared/forms";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { featuredCourses } from "@/lib/academy/data";
import {
  DEFAULT_LEARNING_STEPS,
  formatExams,
  formatHours,
  formatLessons,
  formatMinutes,
  telHref,
  totalLessons,
  whatsappHref,
} from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, Course } from "@/lib/academy/types";
import { btn, container, formKit } from "./kit";
import { CourseCard, CTA, FeatureCard, PageHeader, Section, SectionHeading, Stat, TeacherSection } from "./parts";

type P = { site: AcademySite };

/* ================================================================== */

export function Home({ site }: P) {
  const { hero, about, features, teacher } = site.landing;
  const steps = site.landing.learningSteps?.length ? site.landing.learningSteps : DEFAULT_LEARNING_STEPS;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={cn(container, "grid items-center gap-12 pt-10 pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-20 lg:pb-28")}>
          <div className="animate-fade-up">
            {hero.eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full bg-(--accent-soft) px-3.5 py-1.5 text-sm font-bold text-(--accent)">
                <span className="size-1.5 rounded-full bg-(--accent)" />
                {hero.eyebrow}
              </span>
            )}
            <h1 className="mt-6 text-[2.5rem] leading-[1.25] font-extrabold text-balance sm:text-5xl lg:text-[3.6rem]">{hero.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-9 text-slate-600">{hero.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={academyRoutes.courses} className={btn.primary}>
                تصفّح الدورات
                <Icon name="arrow" className="size-4 rtl:rotate-180" />
              </Link>
              <Link href={academyRoutes.register} className={btn.secondary}>
                أنشئ حسابك 
              </Link>
            </div>
            <div className="mt-12 flex gap-10 border-t border-slate-100 pt-8">
              <Stat value={site.courses.length} label="الدورات" />
              {totalLessons(site.courses) > 0 && <Stat value={totalLessons(site.courses)} label="إجمالي الدروس" />}
              {teacher.experienceYears != null && <Stat value={`+${teacher.experienceYears}`} label="سنوات الخبرة" />}
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative aspect-[4/4.3] overflow-hidden rounded-[2.5rem] bg-(--accent-soft)">
              <AcademyImage media={hero.image ?? teacher.image} label={teacher.name} priority sizes="(min-width: 1024px) 45vw, 100vw" />
            </div>
            <div className="absolute -bottom-6 start-6 flex items-center gap-3 rounded-2xl bg-white p-3 pe-5 shadow-[0_20px_40px_-16px_rgb(15_23_42/0.3)] sm:start-[-1.5rem]">
              <span className="relative size-12 overflow-hidden rounded-xl">
                <AcademyImage media={teacher.image} label={teacher.name} sizes="48px" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{teacher.name}</p>
                {teacher.title && <p className="max-w-[14rem] truncate text-xs text-slate-500">{teacher.title}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value statement */}
      {about.description && (
        <section className="bg-slate-50/80 py-20 sm:py-24">
          <div className={cn(container, "max-w-4xl text-center")}>
            <h2 className="text-3xl leading-[1.4] font-extrabold text-balance sm:text-4xl">{about.title}</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 whitespace-pre-line text-slate-600">{about.description}</p>
            {!!site.landing.benefits?.length && (
              <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
                {site.landing.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
                    <Icon name="check" className="size-4 text-(--accent)" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Featured courses */}
      <Section>
        <SectionHeading
          eyebrow="الدورات"
          title="ابدأ بإحدى دوراتنا المميّزة"
          action={
            <Link href={academyRoutes.courses} className={btn.secondary}>
              كل الدورات
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses(site).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </Section>

      {/* Teacher */}
      <Section className="pt-4">
        <TeacherSection site={site} />
      </Section>

      {/* Features */}
      {features.length > 0 && (
        <Section>
          <SectionHeading eyebrow="لماذا تتعلّم معنا" title="كل ما تحتاجه لتتعلّم بثقة" />
          <div className={cn("grid gap-4 sm:grid-cols-2", features.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
            {features.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </Section>
      )}

      {/* Learning process */}
      <Section className="pt-4">
        <SectionHeading eyebrow="كيف تبدأ" title="أربع خطوات وتبدأ رحلتك" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-slate-200/80 p-7">
              <span className="text-5xl font-extrabold text-(--accent-muted)" dir="ltr">
                0{i + 1}
              </span>
              <h3 className="mt-5 text-lg font-extrabold">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-7 text-slate-600">{s.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CTA site={site} />
    </>
  );
}

/* ================================================================== */

export function Courses({ site }: P) {
  return (
    <>
      <PageHeader title="الدورات" description={`جميع دورات ${site.tenant.name}، مرتّبة لتبدأ من المستوى المناسب لك.`} />
      <Section className="pt-12 sm:pt-16">
        {site.courses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">لا توجد دورات منشورة حالياً. تابعنا قريباً.</p>
        )}
      </Section>
    </>
  );
}

/* ================================================================== */

export function CourseDetails({ site, course }: P & { course: Course }) {
  const meta = [
    course.lessonCount != null ? { icon: "play" as const, label: formatLessons(course.lessonCount) } : null,
    course.examCount ? { icon: "exam" as const, label: formatExams(course.examCount) } : null,
    course.durationHours ? { icon: "clock" as const, label: formatHours(course.durationHours) } : null,
    course.level ? { icon: "progress" as const, label: course.level } : null,
  ].filter(Boolean) as { icon: "play"; label: string }[];

  return (
    <>
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className={cn(container, "py-12 sm:py-16")}>
          <Link href={academyRoutes.courses} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900">
            <Icon name="arrow" className="size-4 ltr:rotate-180" />
            كل الدورات
          </Link>
          {course.category && <p className="mt-6 text-sm font-bold text-(--accent)">{course.category}</p>}
          <h1 className="mt-2 max-w-3xl text-4xl leading-[1.3] font-extrabold text-balance sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{course.shortDescription}</p>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {meta.map((m) => (
              <li key={m.label} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                <Icon name={m.icon} className="size-4 text-(--accent)" />
                {m.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(container, "grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_22rem] lg:gap-14")}>
        <div className="min-w-0 space-y-12">
          <div>
            <h2 className="text-2xl font-extrabold">عن الدورة</h2>
            <p className="mt-4 text-lg leading-9 whitespace-pre-line text-slate-600">{course.description}</p>
          </div>

          {!!course.outcomes?.length && (
            <div className="rounded-3xl bg-slate-50 p-7 sm:p-8">
              <h2 className="text-2xl font-extrabold">ماذا ستتعلّم</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 leading-7 text-slate-700">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-(--accent) text-(--accent-fg)">
                      <Icon name="check" className="size-3" strokeWidth={3} />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!course.curriculum?.length && (
            <div>
              <h2 className="text-2xl font-extrabold">محتوى الدورة</h2>
              <div className="mt-6 space-y-3">
                {course.curriculum.map((section, i) => (
                  <details key={section.title} open={i === 0} className="group overflow-hidden rounded-3xl border border-slate-200">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
                      <span className="font-extrabold">{section.title}</span>
                      <span className="flex items-center gap-3 text-sm text-slate-500">
                        {formatLessons(section.lessons.length)}
                        <Icon name="chevron-down" className="size-4 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <ul className="border-t border-slate-100">
                      {section.lessons.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-4 px-6 py-3.5 text-[0.9375rem] odd:bg-slate-50/60">
                          <span className="flex items-center gap-3">
                            <Icon name={l.isPreview ? "play" : "lock"} className={cn("size-4", l.isPreview ? "text-(--accent)" : "text-slate-400")} />
                            {l.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                            {l.isPreview && <span className="rounded-full bg-(--accent-soft) px-2 py-0.5 font-bold text-(--accent)">معاينة</span>}
                            {formatMinutes(l.durationMinutes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}

          {!!course.requirements?.length && (
            <div>
              <h2 className="text-2xl font-extrabold">المتطلبات</h2>
              <ul className="mt-4 list-disc space-y-2 ps-5 leading-8 text-slate-600 marker:text-(--accent)">
                {course.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_48px_-28px_rgb(15_23_42/0.3)]">
            <div className="relative aspect-[16/10]">
              <AcademyImage media={course.image} label={course.title} sizes="352px" />
            </div>
            <div className="p-6">
              <Link href={academyRoutes.register} className={cn(btn.primary, "w-full")}>
                سجّل وابدأ الدورة
              </Link>
              <Link href={academyRoutes.login} className={cn(btn.secondary, "mt-2 w-full")}>
                لدي حساب بالفعل
              </Link>
              <p className="mt-4 flex gap-2 text-xs leading-6 text-slate-500">
                <Icon name="ticket" className="mt-0.5 size-4 shrink-0" />
                تُفعَّل الدورة بكود تسجيل تحصل عليه من المعلّم بعد إنشاء حسابك.
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-100 p-6">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                <AcademyImage media={site.landing.teacher.image} label={site.landing.teacher.name} sizes="44px" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">المعلّم</p>
                <Link href={academyRoutes.teacher} className="font-extrabold hover:text-(--accent)">{site.landing.teacher.name}</Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/* ================================================================== */

export function Teacher({ site }: P) {
  const t = site.landing.teacher;
  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <TeacherSection site={site} full />
      </Section>
      {!!t.methodology?.length && (
        <Section className="bg-slate-50/80">
          <SectionHeading eyebrow="طريقة التدريس" title="كيف نتعلّم معاً" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.methodology.map((m, i) => (
              <div key={m.title} className="rounded-3xl bg-white p-7">
                <span className="text-sm font-extrabold text-(--accent)" dir="ltr">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-extrabold">{m.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-7 text-slate-600">{m.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section>
        <SectionHeading title={`دورات ${t.name}`} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {site.courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </Section>
    </>
  );
}

/* ================================================================== */

export function Contact({ site }: P) {
  const c = site.academy.contact;
  const items = [
    c.email && { icon: "mail" as const, label: "البريد الإلكتروني", value: c.email, href: `mailto:${c.email}`, ltr: true },
    c.phone && { icon: "phone" as const, label: "الهاتف", value: c.phone, href: telHref(c.phone), ltr: true },
    c.whatsapp && { icon: "chat" as const, label: "واتساب", value: "راسلنا على واتساب", href: whatsappHref(c.whatsapp) },
    c.address && { icon: "pin" as const, label: "العنوان", value: c.address },
    c.workingHours && { icon: "clock" as const, label: "مواعيد التواصل", value: c.workingHours },
  ].filter(Boolean) as { icon: "mail"; label: string; value: string; href?: string; ltr?: boolean }[];

  return (
    <>
      <PageHeader title="تواصل معنا" description="لديك سؤال عن الدورات أو التسجيل؟ راسلنا وسنرد عليك في أقرب وقت." />
      <Section className="pt-12 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.label} className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-(--accent) shadow-sm">
                  <Icon name={it.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">{it.label}</p>
                  {it.href ? (
                    <a href={it.href} dir={it.ltr ? "ltr" : undefined} className="block truncate font-extrabold hover:text-(--accent)">{it.value}</a>
                  ) : (
                    <p className="font-extrabold">{it.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="rounded-[2rem] border border-slate-200 p-6 sm:p-10">
            <h2 className="mb-6 text-2xl font-extrabold">أرسل رسالة</h2>
            <ContactForm kit={formKit} />
          </div>
        </div>
      </Section>
    </>
  );
}

/* ================================================================== */

export function Auth({ site, mode }: P & { mode: AuthMode }) {
  const copy = authCopy[mode];
  return (
    <div className={cn(container, "grid gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16")}>
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 leading-8 text-slate-600">{copy.subtitle(site.tenant.name)}</p>
        <div className="mt-8">
          {mode === "login" && <LoginForm kit={formKit} />}
          {mode === "register" && <RegisterForm kit={formKit} academyName={site.tenant.name} />}
          {mode === "forgot" && <ForgotPasswordForm kit={formKit} />}
        </div>
        {copy.switchHref && (
          <p className="mt-6 text-center text-sm text-slate-600">
            {copy.switchText}{" "}
            <Link href={copy.switchHref} className={formKit.link}>{copy.switchLabel}</Link>
          </p>
        )}
        {mode === "login" && <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">{TEACHER_LOGIN_NOTE}</p>}
      </div>

      <div className="relative hidden overflow-hidden rounded-[2.5rem] bg-(--accent) p-12 text-(--accent-fg) lg:block">
        <div className="pointer-events-none absolute -top-20 -end-20 size-64 rounded-full bg-white/10" aria-hidden="true" />
        <AcademyMark site={site} className="relative size-14 rounded-2xl bg-white/15 text-2xl font-extrabold" />
        <p className="relative mt-10 text-3xl leading-[1.4] font-extrabold">{site.landing.hero.title}</p>
        <ul className="relative mt-10 space-y-4">
          {site.landing.features.slice(0, 3).map((f) => (
            <li key={f.title} className="flex items-center gap-3 font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-white/15">
                <Icon name="check" className="size-4" />
              </span>
              {f.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
