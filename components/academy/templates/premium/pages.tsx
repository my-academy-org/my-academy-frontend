import Link from "next/link";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { authCopy, TEACHER_LOGIN_NOTE, type AuthMode } from "@/components/academy/shared/auth";
import { ContactForm, ForgotPasswordForm, LoginForm, RegisterForm } from "@/components/academy/shared/forms";
import { featureIcon } from "@/components/academy/shared/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { featuredCourses } from "@/lib/academy/data";
import { DEFAULT_LEARNING_STEPS, formatMinutes, formatYears, telHref, whatsappHref } from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, Course } from "@/lib/academy/types";
import { btn, container, display, formKit } from "./kit";
import { CourseFacts, CourseRow, CTA, Eyebrow, Glow, Heading, PageHeader, Portrait, Section, Story } from "./parts";

type P = { site: AcademySite };

/* ================================================================== */

export function Home({ site }: P) {
  const { hero, about, teacher, features, testimonials } = site.landing;
  const steps = site.landing.learningSteps?.length ? site.landing.learningSteps : DEFAULT_LEARNING_STEPS;

  return (
    <>
      {/* Cinematic hero */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-14 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <AcademyImage media={hero.image ?? teacher.image} label={site.tenant.name} tone="dark" priority monogram={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/70 to-[#0d0d0f]/30" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0d0d0f]/80 via-transparent to-transparent" />
        </div>
        <div className={cn(container, "pt-32")}>
          {hero.eyebrow && <Eyebrow className="animate-fade-up">{hero.eyebrow}</Eyebrow>}
          <h1 className={cn(display, "mt-7 max-w-4xl animate-fade-up text-[2.75rem] leading-[1.3] text-balance text-white [animation-delay:100ms] sm:text-6xl lg:text-[5rem] lg:leading-[1.2]")}>
            {hero.title}
          </h1>
          <p className="mt-7 max-w-xl animate-fade-up text-lg leading-9 text-white/65 [animation-delay:200ms]">{hero.description}</p>
          <div className="mt-10 flex animate-fade-up flex-col gap-5 [animation-delay:300ms] sm:flex-row sm:items-center">
            <Link href={academyRoutes.register} className={btn.primary}>احجز مقعدك</Link>
            <Link href={academyRoutes.courses} className={btn.ghost}>
              استكشف البرامج
              <Icon name="arrow" className="size-4 rtl:rotate-180" />
            </Link>
          </div>
          <dl className="mt-16 grid max-w-2xl grid-cols-3 border-t border-white/12 pt-6 text-sm">
            <div>
              <dt className="text-white/40">المدرّب</dt>
              <dd className="mt-1 font-bold text-white">{teacher.name}</dd>
            </div>
            {teacher.experienceYears != null && (
              <div className="border-s border-white/12 ps-5">
                <dt className="text-white/40">الخبرة</dt>
                <dd className="mt-1 font-bold text-white">{formatYears(teacher.experienceYears)}</dd>
              </div>
            )}
            <div className="border-s border-white/12 ps-5">
              <dt className="text-white/40">البرامج</dt>
              <dd className="mt-1 font-bold text-white" dir="ltr">{site.courses.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Teacher identity */}
      <Section>
        <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Portrait site={site} className="mx-auto w-full max-w-sm" />
          <div>
            <Eyebrow>المدرّب</Eyebrow>
            <Heading className="mt-6 sm:text-6xl">{teacher.name}</Heading>
            {teacher.title && <p className="mt-4 text-xl text-white/55">{teacher.title}</p>}
            {!!teacher.qualifications.length && (
              <ul className="mt-10 divide-y divide-white/8 border-y border-white/8">
                {teacher.qualifications.map((q) => (
                  <li key={q.title} className="flex items-baseline justify-between gap-6 py-4">
                    <span className="font-bold text-white" dir="auto">{q.title}</span>
                    <span className="text-sm text-white/40" dir="auto">{[q.institution, q.year].filter(Boolean).join(" · ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {/* Positioning */}
      {about.description && (
        <section className="relative overflow-hidden border-y border-white/8 py-24 sm:py-32">
          <Glow className="start-1/3" />
          <div className={cn(container, "relative max-w-4xl text-center")}>
            <Icon name="quote" className="mx-auto size-10 text-(--accent)" />
            <h2 className={cn(display, "mt-8 text-3xl leading-[1.5] text-white sm:text-[2.75rem]")}>{about.title}</h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-white/55">{about.description}</p>
          </div>
        </section>
      )}

      {/* Featured courses */}
      <Section>
        <div className="mb-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>البرامج</Eyebrow>
            <Heading className="mt-6">برامج مصمّمة لنتيجة</Heading>
          </div>
          <Link href={academyRoutes.courses} className={btn.outline}>كل البرامج</Link>
        </div>
        {featuredCourses(site).map((c, i) => (
          <CourseRow key={c.id} course={c} index={i} />
        ))}
      </Section>

      {/* Benefits */}
      {features.length > 0 && (
        <section className="border-y border-white/8 bg-[#111114] py-24 sm:py-32">
          <div className={container}>
            <Eyebrow>القيمة</Eyebrow>
            <Heading className="mt-6 max-w-2xl">ما يجعل التجربة مختلفة</Heading>
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/8 sm:grid-cols-2">
              {features.map((f, i) => (
                <div key={f.title} className="bg-[#111114] p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <Icon name={featureIcon(f.icon)} className="size-7 text-(--accent)" />
                    <span className={cn(display, "text-2xl text-white/15")} dir="ltr">0{i + 1}</span>
                  </div>
                  <h3 className={cn(display, "mt-8 text-2xl text-white")}>{f.title}</h3>
                  <p className="mt-3 leading-8 text-white/55">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instructor story */}
      {teacher.bio && (
        <Section>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div>
              <Eyebrow>القصة</Eyebrow>
              <Heading className="mt-6">لماذا أدرّس بهذه الطريقة</Heading>
              {teacher.experienceYears != null && (
                <p className="mt-12">
                  <span className={cn(display, "block text-8xl text-(--accent)")} dir="ltr">{teacher.experienceYears}+</span>
                  <span className="mt-2 block text-white/50">سنوات من التدريب والتدريس</span>
                </p>
              )}
            </div>
            <Story text={teacher.bio} />
          </div>
        </Section>
      )}

      {/* Learning experience */}
      <section className="border-t border-white/8 py-24 sm:py-32">
        <div className={container}>
          <Eyebrow>التجربة</Eyebrow>
          <Heading className="mt-6 max-w-2xl">رحلة التعلّم خطوة بخطوة</Heading>
          <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
            <span className="absolute inset-x-0 top-[0.4375rem] hidden h-px bg-white/10 md:block" aria-hidden="true" />
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative block size-3.5 rounded-full border-2 border-(--accent) bg-[#0d0d0f]" />
                <p className="mt-6 text-sm text-(--accent)" dir="ltr">0{i + 1}</p>
                <h3 className={cn(display, "mt-2 text-2xl text-white")}>{s.title}</h3>
                <p className="mt-3 leading-8 text-white/55">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimonials — manually managed content only, rendered when provided */}
      {!!testimonials?.length && (
        <section className="border-t border-white/8 bg-[#111114] py-24 sm:py-32">
          <div className={container}>
            <Eyebrow>بكلماتهم</Eyebrow>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <figure key={t.quote} className="flex flex-col rounded-3xl border border-white/8 p-8 sm:p-10">
                  <Icon name="quote" className="size-7 text-(--accent)" />
                  <blockquote className={cn(display, "mt-6 flex-1 text-2xl leading-[1.6] text-white/90")}>{t.quote}</blockquote>
                  <figcaption className="mt-8 border-t border-white/8 pt-5 text-sm">
                    <span className="font-bold text-white">{t.author}</span>
                    {t.role && <span className="text-white/45"> — {t.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA site={site} />
    </>
  );
}

/* ================================================================== */

export function Courses({ site }: P) {
  return (
    <>
      <PageHeader eyebrow="البرامج" title="برامج مصمّمة لنتيجة" description={`جميع برامج ${site.tenant.name}. كل برنامج مبني لهدف محدّد وبأعداد محدودة.`} />
      <div className={cn(container, "py-12 sm:py-16")}>
        {site.courses.map((c, i) => (
          <CourseRow key={c.id} course={c} index={i} />
        ))}
        {!site.courses.length && <p className="py-20 text-center text-white/50">لا توجد برامج منشورة حالياً.</p>}
      </div>
    </>
  );
}

/* ================================================================== */

export function CourseDetails({ site, course }: P & { course: Course }) {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-40 pb-16 sm:pt-48 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <AcademyImage media={course.image} label={course.title} tone="dark" priority monogram={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/85 to-[#0d0d0f]/50" />
        </div>
        <div className={container}>
          <Link href={academyRoutes.courses} className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
            <Icon name="arrow" className="size-4 ltr:rotate-180" /> كل البرامج
          </Link>
          {course.category && <Eyebrow className="mt-10">{course.category}</Eyebrow>}
          <Heading as="h1" className="mt-6 max-w-4xl sm:text-6xl lg:text-7xl">{course.title}</Heading>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-white/60">{course.shortDescription}</p>
          <div className="mt-12 max-w-3xl">
            <CourseFacts course={course} />
          </div>
        </div>
      </section>

      <div className={cn(container, "grid gap-16 py-16 sm:py-24 lg:grid-cols-[1fr_22rem] lg:gap-20")}>
        <div className="min-w-0 space-y-20">
          <section>
            <Eyebrow>عن البرنامج</Eyebrow>
            <Story text={course.description} className="mt-8" />
          </section>

          {!!course.outcomes?.length && (
            <section>
              <Eyebrow>ما ستخرج به</Eyebrow>
              <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-2">
                {course.outcomes.map((o, i) => (
                  <li key={o} className="bg-[#0d0d0f] p-6">
                    <span className="text-sm text-(--accent)" dir="ltr">0{i + 1}</span>
                    <p className="mt-2 leading-8 text-white/85">{o}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!course.curriculum?.length && (
            <section>
              <Eyebrow>المنهج</Eyebrow>
              <div className="mt-8 divide-y divide-white/8 border-y border-white/8">
                {course.curriculum.map((s, i) => (
                  <details key={s.title} open={i === 0} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                      <span className={cn(display, "text-2xl text-white")} dir="auto">{s.title}</span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/60 transition group-open:rotate-45 group-open:border-(--accent) group-open:text-(--accent)">
                        <Icon name="plus" className="size-4" />
                      </span>
                    </summary>
                    <ul className="pb-6">
                      {s.lessons.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-4 py-2.5 text-white/65">
                          <span className="flex items-center gap-3" dir="auto">
                            <Icon name={l.isPreview ? "play" : "lock"} className={cn("size-4", l.isPreview ? "text-(--accent)" : "text-white/25")} />
                            {l.title}
                          </span>
                          <span className="shrink-0 text-xs text-white/35">
                            {l.isPreview ? <span className="text-(--accent)">معاينة</span> : formatMinutes(l.durationMinutes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          {!!course.requirements?.length && (
            <section>
              <Eyebrow>قبل أن تنضم</Eyebrow>
              <ul className="mt-6 space-y-3 text-white/70">
                {course.requirements.map((r) => (
                  <li key={r} className="flex gap-3"><span className="text-(--accent)">—</span>{r}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-(--accent)/30 bg-[#111114] p-7">
            <p className={cn(display, "text-2xl text-white")}>انضم إلى البرنامج</p>
            <p className="mt-3 text-sm leading-7 text-white/55">أنشئ حسابك، ثم فعّل البرنامج بكود التسجيل الذي تحصل عليه من المدرّب.</p>
            <Link href={academyRoutes.register} className={cn(btn.primary, "mt-7 w-full")}>احجز مقعدك</Link>
            <Link href={academyRoutes.login} className="mt-4 block text-center text-sm font-semibold text-white/60 hover:text-white">لدي حساب بالفعل</Link>
            <div className="mt-7 flex items-center gap-3 border-t border-white/8 pt-6">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <AcademyImage media={site.landing.teacher.image} label={site.landing.teacher.name} tone="dark" sizes="48px" />
              </span>
              <div>
                <p className="text-xs text-white/40">المدرّب</p>
                <Link href={academyRoutes.teacher} className="font-bold text-white hover:text-(--accent)">{site.landing.teacher.name}</Link>
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
      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
        <Glow />
        <div className={cn(container, "relative grid items-end gap-16 lg:grid-cols-[1.2fr_0.8fr]")}>
          <div className="lg:pb-10">
            <Eyebrow>المدرّب</Eyebrow>
            <Heading as="h1" className="mt-6 sm:text-7xl">{t.name}</Heading>
            {t.title && <p className="mt-5 text-xl text-white/55">{t.title}</p>}
            {t.experienceYears != null && (
              <p className="mt-10 inline-flex items-baseline gap-3 border-t border-white/12 pt-6">
                <span className={cn(display, "text-5xl text-(--accent)")} dir="ltr">{t.experienceYears}+</span>
                <span className="text-white/50">سنوات من الخبرة</span>
              </p>
            )}
          </div>
          <Portrait site={site} priority className="mx-auto w-full max-w-sm" />
        </div>
      </section>

      <Section className="border-t border-white/8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div>
            <Eyebrow>القصة</Eyebrow>
            <Heading className="mt-6">بداية الرحلة</Heading>
          </div>
          <Story text={t.bio} />
        </div>
      </Section>

      {!!t.qualifications.length && (
        <Section className="border-t border-white/8 bg-[#111114]">
          <Eyebrow>المؤهلات</Eyebrow>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/8 md:grid-cols-2">
            {t.qualifications.map((q) => (
              <li key={q.title} className="bg-[#111114] p-8">
                <Icon name="award" className="size-6 text-(--accent)" />
                <p className={cn(display, "mt-5 text-2xl text-white")} dir="auto">{q.title}</p>
                <p className="mt-2 text-sm text-white/45" dir="auto">{[q.institution, q.year].filter(Boolean).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {!!t.methodology?.length && (
        <Section className="border-t border-white/8">
          <Eyebrow>المنهجية</Eyebrow>
          <ol className="mt-10 grid gap-10 md:grid-cols-2">
            {t.methodology.map((m, i) => (
              <li key={m.title} className="border-t border-white/12 pt-6">
                <span className="text-sm text-(--accent)" dir="ltr">0{i + 1}</span>
                <h3 className={cn(display, "mt-2 text-2xl text-white")}>{m.title}</h3>
                <p className="mt-3 leading-8 text-white/55">{m.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <CTA site={site} />
    </>
  );
}

/* ================================================================== */

export function Contact({ site }: P) {
  const c = site.academy.contact;
  const items = [
    c.email && { label: "البريد الإلكتروني", value: c.email, href: `mailto:${c.email}`, ltr: true },
    c.phone && { label: "الهاتف", value: c.phone, href: telHref(c.phone), ltr: true },
    c.whatsapp && { label: "واتساب", value: "محادثة مباشرة", href: whatsappHref(c.whatsapp) },
    c.address && { label: "الموقع", value: c.address },
    c.workingHours && { label: "المواعيد", value: c.workingHours },
  ].filter(Boolean) as { label: string; value: string; href?: string; ltr?: boolean }[];

  return (
    <>
      <PageHeader eyebrow="تواصل" title="لنتحدّث عن هدفك" description="أخبرنا أين أنت الآن وأين تريد أن تصل، وسنقترح البرنامج المناسب لك." />
      <div className={cn(container, "grid gap-16 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24")}>
        <dl className="divide-y divide-white/8 border-y border-white/8">
          {items.map((it) => (
            <div key={it.label} className="py-6">
              <dt className="text-sm text-white/40">{it.label}</dt>
              <dd className={cn(display, "mt-2 text-2xl text-white")} dir={it.ltr ? "ltr" : undefined}>
                {it.href ? <a href={it.href} className="hover:text-(--accent)">{it.value}</a> : it.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="rounded-3xl border border-white/8 bg-[#111114] p-7 sm:p-10">
          <ContactForm kit={formKit} />
        </div>
      </div>
    </>
  );
}

/* ================================================================== */

export function Auth({ site, mode }: P & { mode: AuthMode }) {
  const copy = authCopy[mode];
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <AcademyImage media={site.landing.hero.image ?? site.landing.teacher.image} label={site.tenant.name} tone="dark" monogram={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/50 to-[#0d0d0f]/20" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <p className={cn(display, "max-w-md text-4xl leading-[1.35] text-white")}>{site.landing.hero.title}</p>
          <p className="mt-4 text-white/55">{site.landing.teacher.name}</p>
        </div>
      </div>
      <div className="flex items-center px-5 pt-32 pb-16 sm:px-10 lg:pt-28">
        <div className="mx-auto w-full max-w-md">
          <Eyebrow>{site.tenant.name}</Eyebrow>
          <h1 className={cn(display, "mt-6 text-4xl text-white sm:text-5xl")}>{copy.title}</h1>
          <p className="mt-4 leading-8 text-white/55">{copy.subtitle(site.tenant.name)}</p>
          <div className="mt-10">
            {mode === "login" && <LoginForm kit={formKit} />}
            {mode === "register" && <RegisterForm kit={formKit} academyName={site.tenant.name} />}
            {mode === "forgot" && <ForgotPasswordForm kit={formKit} />}
          </div>
          {copy.switchHref && (
            <p className="mt-8 text-center text-sm text-white/55">
              {copy.switchText} <Link href={copy.switchHref} className={formKit.link}>{copy.switchLabel}</Link>
            </p>
          )}
          {mode === "login" && <p className="mt-8 border-t border-white/8 pt-6 text-xs leading-6 text-white/40">{TEACHER_LOGIN_NOTE}</p>}
        </div>
      </div>
    </div>
  );
}
