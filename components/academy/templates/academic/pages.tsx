import Link from "next/link";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { authCopy, TEACHER_LOGIN_NOTE, type AuthMode } from "@/components/academy/shared/auth";
import { AcademyMark } from "@/components/academy/shared/brand";
import { ContactForm, ForgotPasswordForm, LoginForm, RegisterForm } from "@/components/academy/shared/forms";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  arabicDigits,
  formatHours,
  formatMinutes,
  groupByCategory,
  telHref,
  totalExams,
  totalLessons,
  whatsappHref,
} from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, Course } from "@/lib/academy/types";
import { btn, container, formKit } from "./kit";
import {
  CourseTable,
  CTA,
  FeatureGrid,
  Ornament,
  PageHeader,
  Prose,
  QualificationsTable,
  Section,
  SectionTitle,
  TeacherCard,
} from "./parts";

type P = { site: AcademySite };

/* ================================================================== */

export function Home({ site }: P) {
  const { hero, about, teacher, features, benefits } = site.landing;
  let n = 0;

  const facts = [
    teacher.experienceYears != null && { value: arabicDigits(teacher.experienceYears), label: "سنة من الخبرة" },
    { value: arabicDigits(site.courses.length), label: "مقرراً دراسياً" },
    { value: arabicDigits(totalLessons(site.courses)), label: "محاضرة مسجّلة" },
    { value: arabicDigits(totalExams(site.courses)), label: "اختباراً" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <>
      {/* Institutional hero */}
      <section className="border-b border-[#1b2333]/12">
        <div className={cn(container, "grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20")}>
          <div>
            {hero.eyebrow && <p className="text-sm font-bold text-[#7a2232]">{hero.eyebrow}</p>}
            <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.45] font-bold text-balance sm:text-5xl lg:text-[3.4rem]">{hero.title}</h1>
            <Ornament className="mt-6" />
            <p className="mt-6 max-w-2xl text-lg leading-9 text-[#1b2333]/75">{hero.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={academyRoutes.courses} className={btn.primary}>دليل المقررات</Link>
              <Link href={academyRoutes.register} className={btn.outline}>تسجيل طالب جديد</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border border-[#7a2232]/40" aria-hidden="true" />
            <div className="relative border border-[#1b2333]/20 bg-[#fdfbf6] p-3">
              <div className="relative aspect-[4/5] overflow-hidden">
                <AcademyImage media={hero.image ?? teacher.image} label={teacher.name} tone="paper" priority sizes="(min-width: 1024px) 30vw, 90vw" />
              </div>
              <p className="pt-3 text-center text-sm font-bold">{teacher.name}</p>
            </div>
          </div>
        </div>

        {/* Facts bar */}
        <div className="border-t border-[#1b2333]/12 bg-[#fdfbf6]">
          <dl className={cn(container, "grid grid-cols-2 divide-[#1b2333]/12 lg:grid-cols-4 lg:divide-x lg:divide-x-reverse")}>
            {facts.map((f) => (
              <div key={f.label} className="px-2 py-7 text-center">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="block font-serif text-4xl font-bold text-(--accent)">{f.value}</span>
                  <span className="mt-1 block text-sm text-[#1b2333]/65">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Academic introduction */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle index={++n} label="التعريف" title={about.title} />
          <div className="lg:pt-10">
            <Prose text={about.description} lead />
          </div>
        </div>
      </Section>

      {/* Teacher: qualifications & experience */}
      <Section tone="white">
        <SectionTitle
          index={++n}
          label="المعلّم"
          title="المؤهلات والخبرة"
          action={<Link href={academyRoutes.teacher} className={btn.text}>السيرة الكاملة ←</Link>}
        />
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <TeacherCard site={site} />
          <div>
            <p className="font-serif text-xl leading-10">{teacher.bio.split("\n")[0]}</p>
            <div className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr]">
              {teacher.experienceYears != null && (
                <div className="border border-[#1b2333]/15 px-8 py-6 text-center">
                  <p className="font-serif text-5xl font-bold text-[#7a2232]">{arabicDigits(teacher.experienceYears)}</p>
                  <p className="mt-2 text-sm font-bold">سنة في التدريس</p>
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-bold text-[#1b2333]/60">المؤهلات العلمية</p>
                <QualificationsTable items={teacher.qualifications} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Courses */}
      <Section>
        <SectionTitle
          index={++n}
          label="المقررات"
          title="المقررات الدراسية"
          description="كل مقرر مقسّم إلى وحدات ومحاضرات، مع اختبارات لقياس الفهم."
          action={<Link href={academyRoutes.courses} className={btn.text}>جميع المقررات ←</Link>}
        />
        <CourseTable courses={site.courses.slice(0, 5)} />
      </Section>

      {/* Methodology */}
      {!!teacher.methodology?.length && (
        <Section tone="white">
          <SectionTitle index={++n} label="المنهجية" title="منهجية التدريس" />
          <ol className="grid gap-x-16 gap-y-10 md:grid-cols-2">
            {teacher.methodology.map((m, i) => (
              <li key={m.title} className="flex gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#7a2232] font-serif text-xl font-bold text-[#7a2232]">
                  {arabicDigits(i + 1)}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">{m.title}</h3>
                  <p className="mt-2 leading-8 text-[#1b2333]/70">{m.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <Section>
          <SectionTitle index={++n} label="الخدمات التعليمية" title="ما تقدّمه الأكاديمية" />
          <FeatureGrid features={features} />
        </Section>
      )}

      {/* Student benefits */}
      {!!benefits?.length && (
        <Section tone="white">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionTitle index={++n} label="للطالب" title="ما يحصل عليه الطالب" />
            <ul className="grid gap-x-10 sm:grid-cols-2 lg:pt-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 border-b border-[#1b2333]/12 py-4">
                  <Icon name="check" className="mt-1 size-4 shrink-0 text-[#7a2232]" strokeWidth={2.5} />
                  <span className="font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <CTA site={site} />
    </>
  );
}

/* ================================================================== */

export function Courses({ site }: P) {
  // Continuous numbering across category groups.
  const groups = groupByCategory(site.courses).map((g, i, all) => ({
    ...g,
    start: 1 + all.slice(0, i).reduce((sum, prev) => sum + prev.items.length, 0),
  }));
  return (
    <>
      <PageHeader label="دليل المقررات" title="المقررات الدراسية" description={`جميع المقررات المتاحة في ${site.tenant.name}، مرتّبة حسب الفصل والموضوع.`} />
      <div className={cn(container, "space-y-14 py-14 sm:py-20")}>
        {groups.map((g) => (
            <section key={g.category}>
              <h2 className="mb-5 flex items-center gap-4 font-serif text-2xl font-bold">
                {g.category}
                <span className="h-px flex-1 bg-[#1b2333]/15" />
                <span className="text-sm font-normal text-[#1b2333]/55">{arabicDigits(g.items.length)} مقرر</span>
              </h2>
              <CourseTable courses={g.items} startIndex={g.start} />
            </section>
        ))}
        {!site.courses.length && <p className="text-center text-[#1b2333]/60">لا توجد مقررات منشورة حالياً.</p>}
      </div>
    </>
  );
}

/* ================================================================== */

export function CourseDetails({ site, course }: P & { course: Course }) {
  const facts = [
    { label: "المستوى", value: course.level },
    { label: "التصنيف", value: course.category },
    { label: "عدد المحاضرات", value: arabicDigits(course.lessonCount) },
    { label: "عدد الاختبارات", value: course.examCount != null ? arabicDigits(course.examCount) : undefined },
    { label: "المدة الإجمالية", value: course.durationHours ? arabicDigits(formatHours(course.durationHours)) : undefined },
    { label: "المعلّم", value: site.landing.teacher.name },
  ].filter((f) => f.value);

  return (
    <>
      <div className="border-b border-[#1b2333]/15">
        <div className={cn(container, "py-12 sm:py-16")}>
          <nav aria-label="مسار الصفحة" className="text-sm text-[#1b2333]/60">
            <Link href={academyRoutes.home} className="hover:text-[#7a2232]">الرئيسية</Link>
            <span className="mx-2">/</span>
            <Link href={academyRoutes.courses} className="hover:text-[#7a2232]">المقررات</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1b2333]">{course.title}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.4] font-bold sm:text-5xl">{course.title}</h1>
          <Ornament className="mt-5" />
          <p className="mt-5 max-w-2xl text-lg leading-9 text-[#1b2333]/75">{course.shortDescription}</p>
        </div>
      </div>

      <div className={cn(container, "grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_20rem] lg:gap-16")}>
        <div className="min-w-0 space-y-14">
          <section>
            <h2 className="mb-5 border-b border-[#1b2333]/15 pb-3 font-serif text-2xl font-bold">وصف المقرر</h2>
            <Prose text={course.description} />
          </section>

          {!!course.outcomes?.length && (
            <section>
              <h2 className="mb-5 border-b border-[#1b2333]/15 pb-3 font-serif text-2xl font-bold">أهداف المقرر</h2>
              <p className="mb-4 text-[#1b2333]/70">بنهاية المقرر يكون الطالب قادراً على:</p>
              <ol className="space-y-3">
                {course.outcomes.map((o, i) => (
                  <li key={o} className="flex gap-4 leading-8">
                    <span className="font-serif font-bold text-[#7a2232]">{arabicDigits(i + 1)}.</span>
                    {o}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {!!course.curriculum?.length && (
            <section>
              <h2 className="mb-5 border-b border-[#1b2333]/15 pb-3 font-serif text-2xl font-bold">خطة المقرر</h2>
              <div className="space-y-6">
                {course.curriculum.map((unit) => (
                  <div key={unit.title} className="border border-[#1b2333]/15 bg-[#fdfbf6]">
                    <p className="border-b border-[#1b2333]/15 bg-[#efe8d8] px-5 py-3 font-serif text-lg font-bold">{unit.title}</p>
                    <table className="w-full text-sm">
                      <tbody>
                        {unit.lessons.map((l, i) => (
                          <tr key={l.id} className="border-b border-[#1b2333]/8 last:border-0">
                            <td className="w-12 px-5 py-3 font-serif font-bold text-[#7a2232]">{arabicDigits(i + 1)}</td>
                            <td className="py-3 font-semibold">{l.title}</td>
                            <td className="w-28 px-3 py-3 text-xs whitespace-nowrap">
                              {l.isPreview ? <span className="font-bold text-emerald-800">معاينة مجانية</span> : <Icon name="lock" className="size-3.5 opacity-40" />}
                            </td>
                            <td className="w-20 px-5 py-3 text-end text-xs whitespace-nowrap text-[#1b2333]/55">{arabicDigits(formatMinutes(l.durationMinutes) ?? "")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!course.requirements?.length && (
            <section>
              <h2 className="mb-5 border-b border-[#1b2333]/15 pb-3 font-serif text-2xl font-bold">المتطلبات السابقة</h2>
              <ul className="list-disc space-y-2 ps-5 leading-8 marker:text-[#7a2232]">
                {course.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          )}
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-6 lg:self-start">
          <div className="border border-[#1b2333]/20 bg-[#fdfbf6]">
            <p className="bg-(--accent) px-5 py-3 font-serif text-lg font-bold text-white">بطاقة المقرر</p>
            <dl className="divide-y divide-[#1b2333]/10 px-5">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-[#1b2333]/60">{f.label}</dt>
                  <dd className="text-end font-bold">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2 border-t border-[#1b2333]/15 p-5">
              <Link href={academyRoutes.register} className={cn(btn.primary, "w-full")}>التسجيل في المقرر</Link>
              <Link href={academyRoutes.login} className={cn(btn.outline, "w-full")}>دخول الطلاب</Link>
              <p className="pt-2 text-xs leading-6 text-[#1b2333]/60">يُفعَّل المقرر بكود التسجيل الذي يصدره المعلّم.</p>
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
  let n = 0;
  return (
    <>
      <PageHeader label="الملف التعريفي" title={t.name} description={t.title} />
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="space-y-6">
            <TeacherCard site={site} />
            {t.experienceYears != null && (
              <div className="border border-[#1b2333]/15 p-6 text-center">
                <p className="font-serif text-5xl font-bold text-[#7a2232]">{arabicDigits(t.experienceYears)}</p>
                <p className="mt-2 text-sm font-bold">سنة في التدريس</p>
              </div>
            )}
          </div>
          <div className="space-y-14">
            <section>
              <SectionTitle index={++n} label="السيرة" title="السيرة الذاتية" />
              <Prose text={t.bio} lead />
            </section>
            {!!t.qualifications.length && (
              <section>
                <SectionTitle index={++n} label="المؤهلات" title="المؤهلات العلمية" />
                <QualificationsTable items={t.qualifications} />
              </section>
            )}
            {!!t.methodology?.length && (
              <section>
                <SectionTitle index={++n} label="المنهجية" title="منهجية التدريس" />
                <ol className="space-y-6">
                  {t.methodology.map((m, i) => (
                    <li key={m.title} className="flex gap-5">
                      <span className="font-serif text-2xl font-bold text-[#7a2232]">{arabicDigits(i + 1)}</span>
                      <div>
                        <h3 className="font-serif text-xl font-bold">{m.title}</h3>
                        <p className="mt-1 leading-8 text-[#1b2333]/70">{m.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </Section>
      <Section>
        <SectionTitle label="المقررات" title={`مقررات ${t.name}`} />
        <CourseTable courses={site.courses} />
      </Section>
    </>
  );
}

/* ================================================================== */

export function Contact({ site }: P) {
  const c = site.academy.contact;
  const rows = [
    c.address && { label: "العنوان", value: c.address },
    c.phone && { label: "الهاتف", value: c.phone, href: telHref(c.phone), ltr: true },
    c.whatsapp && { label: "واتساب", value: c.whatsapp, href: whatsappHref(c.whatsapp), ltr: true },
    c.email && { label: "البريد الإلكتروني", value: c.email, href: `mailto:${c.email}`, ltr: true },
    c.workingHours && { label: "مواعيد التواصل", value: c.workingHours },
  ].filter(Boolean) as { label: string; value: string; href?: string; ltr?: boolean }[];

  return (
    <>
      <PageHeader label="التواصل" title="تواصل مع الأكاديمية" description="للاستفسار عن المقررات أو التسجيل، يسعدنا تواصلكم عبر القنوات التالية أو النموذج." />
      <div className={cn(container, "grid gap-12 py-14 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16")}>
        <div>
          <h2 className="mb-4 border-b border-[#1b2333]/15 pb-3 font-serif text-2xl font-bold">بيانات التواصل</h2>
          <dl className="divide-y divide-[#1b2333]/12">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[8rem_1fr] gap-4 py-4">
                <dt className="text-sm font-bold text-[#1b2333]/60">{r.label}</dt>
                <dd dir={r.ltr ? "ltr" : undefined} className="text-start font-semibold">
                  {r.href ? <a href={r.href} className="hover:text-[#7a2232]">{r.value}</a> : r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="border border-[#1b2333]/15 bg-[#fdfbf6] p-6 sm:p-9">
          <h2 className="mb-6 font-serif text-2xl font-bold">نموذج المراسلة</h2>
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
    <div className={cn(container, "flex justify-center py-14 sm:py-20")}>
      <div className="w-full max-w-lg border border-[#1b2333]/20 bg-[#fdfbf6]">
        <div className="border-b border-[#1b2333]/15 px-6 pt-8 pb-6 text-center sm:px-10">
          <AcademyMark site={site} className="mx-auto size-14 rounded-full border-2 border-[#7a2232] font-serif text-2xl font-bold text-[#7a2232]" />
          <h1 className="mt-5 font-serif text-3xl font-bold">{copy.title}</h1>
          <p className="mt-2 text-sm leading-7 text-[#1b2333]/65">{copy.subtitle(site.tenant.name)}</p>
        </div>
        <div className="px-6 py-8 sm:px-10">
          {mode === "login" && <LoginForm kit={formKit} />}
          {mode === "register" && <RegisterForm kit={formKit} academyName={site.tenant.name} />}
          {mode === "forgot" && <ForgotPasswordForm kit={formKit} />}
          {copy.switchHref && (
            <p className="mt-6 text-center text-sm">
              {copy.switchText} <Link href={copy.switchHref} className={formKit.link}>{copy.switchLabel}</Link>
            </p>
          )}
        </div>
        {mode === "login" && <p className="border-t border-[#1b2333]/15 px-6 py-4 text-xs leading-6 text-[#1b2333]/60 sm:px-10">{TEACHER_LOGIN_NOTE}</p>}
      </div>
    </div>
  );
}

