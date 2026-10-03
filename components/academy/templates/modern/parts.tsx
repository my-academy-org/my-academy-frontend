import Link from "next/link";
import type { ReactNode } from "react";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { AcademyMark, currentYear, PoweredBy } from "@/components/academy/shared/brand";
import { featureIcon, socialLabels } from "@/components/academy/shared/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatLessons, formatYears, telHref } from "@/lib/academy/format";
import { academyRoutes, publicNav } from "@/lib/academy/nav";
import type { AcademySite, Course, Feature, StudentSession } from "@/lib/academy/types";
import { btn, container } from "./kit";
import { Navbar } from "./Navbar";

/* ---------------- Layout ---------------- */

export function Shell({ site, session, children }: { site: AcademySite; session: StudentSession | null; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <Navbar site={site} session={session} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
    </div>
  );
}

export function Section({ className, children, id }: { className?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 md:flex-row md:items-end">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-3 text-sm font-bold text-(--accent)">{eyebrow}</p>}
        <h2 className="text-3xl leading-[1.35] font-extrabold text-balance sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Top banner for inner pages. */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70">
      <div className={cn(container, "py-14 sm:py-20")}>
        {children}
        <h1 className="text-4xl leading-[1.3] font-extrabold text-balance sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}

/* ---------------- Cards ---------------- */

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={academyRoutes.course(course.slug)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-24px_rgb(15_23_42/0.25)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <AcademyImage
          media={course.image}
          label={course.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {course.category && (
          <span className="absolute top-4 start-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-sm">
            {course.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-extrabold">{course.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[0.9375rem] leading-7 text-slate-600">{course.shortDescription}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Icon name="play" className="size-4" />
            {formatLessons(course.lessonCount)}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-(--accent)">
            عرض الدورة
            <Icon name="arrow" className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-7 transition-colors hover:bg-(--accent-soft)">
      <span className="grid size-12 place-items-center rounded-2xl bg-white text-(--accent) shadow-sm">
        <Icon name={featureIcon(feature.icon)} className="size-6" />
      </span>
      <h3 className="mt-6 text-lg font-extrabold">{feature.title}</h3>
      <p className="mt-2 text-[0.9375rem] leading-7 text-slate-600">{feature.description}</p>
    </div>
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-extrabold sm:text-3xl" dir="ltr">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* ---------------- Teacher ---------------- */

export function TeacherSection({ site, full }: { site: AcademySite; full?: boolean }) {
  const t = site.landing.teacher;
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem]">
        <AcademyImage media={t.image} label={t.name} sizes="(min-width: 1024px) 40vw, 100vw" />
      </div>
      <div>
        <p className="mb-3 text-sm font-bold text-(--accent)">تعرّف على المعلّم</p>
        <h2 className="text-3xl font-extrabold sm:text-4xl">{t.name}</h2>
        {t.title && <p className="mt-2 text-lg font-semibold text-slate-500">{t.title}</p>}
        <p className={cn("mt-6 text-base leading-8 whitespace-pre-line text-slate-600 sm:text-lg", !full && "line-clamp-4")}>
          {t.bio}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {t.experienceYears != null && (
            <span className="rounded-2xl bg-(--accent-soft) px-4 py-3 text-sm font-bold text-(--accent)">
              خبرة {formatYears(t.experienceYears)}
            </span>
          )}
          {t.qualifications.slice(0, full ? undefined : 2).map((q) => (
            <span key={q.title} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <Icon name="award" className="size-4 text-(--accent)" />
              {q.title}
              {full && q.institution && <span className="text-slate-400">· {q.institution}</span>}
            </span>
          ))}
        </div>

        {!full && (
          <Link href={academyRoutes.teacher} className={cn(btn.secondary, "mt-8")}>
            المزيد عن المعلّم
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ---------------- CTA & Footer ---------------- */

export function CTA({ site }: { site: AcademySite }) {
  return (
    <Section className="pt-0">
      <div className="relative overflow-hidden rounded-[2rem] bg-(--accent) px-6 py-14 text-center text-(--accent-fg) sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -start-16 size-72 rounded-full bg-white/10" aria-hidden="true" />
        <h2 className="relative text-3xl leading-[1.35] font-extrabold text-balance sm:text-4xl">ابدأ التعلّم في {site.tenant.name}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base leading-8 opacity-85 sm:text-lg">
          أنشئ حسابك الآن، وفعّل دورتك بكود التسجيل، وابدأ من الدرس الأول.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={academyRoutes.register} className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 font-bold text-slate-900 transition hover:bg-slate-100">
            إنشاء حساب طالب
          </Link>
          <Link href={academyRoutes.courses} className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 font-bold transition hover:bg-white/10">
            تصفّح الدورات
          </Link>
        </div>
      </div>
    </Section>
  );
}

function Footer({ site }: { site: AcademySite }) {
  const { contact } = site.academy;
  return (
    <footer className="border-t border-slate-100 bg-slate-50/60">
      <div className={cn(container, "grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]")}>
        <div>
          <div className="flex items-center gap-3">
            <AcademyMark site={site} className="size-10 rounded-xl bg-(--accent) text-lg font-extrabold text-(--accent-fg)" />
            <span className="font-extrabold">{site.tenant.name}</span>
          </div>
          {site.landing.footer.tagline && <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">{site.landing.footer.tagline}</p>}
        </div>
        <FooterCol title="الأكاديمية" links={publicNav} />
        <FooterCol
          title="حسابي"
          links={[
            { label: "تسجيل الدخول", href: academyRoutes.login },
            { label: "إنشاء حساب", href: academyRoutes.register },
          ]}
        />
        <div>
          <p className="text-sm font-extrabold">تواصل</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-(--accent)" dir="ltr">{contact.email}</a>
              </li>
            )}
            {contact.phone && (
              <li>
                <a href={telHref(contact.phone)} className="hover:text-(--accent)" dir="ltr">{contact.phone}</a>
              </li>
            )}
            {!!contact.socials?.length && (
              <li className="flex flex-wrap gap-2 pt-1">
                {contact.socials.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:border-(--accent) hover:text-(--accent)">
                    {socialLabels[s.platform]}
                  </a>
                ))}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className={cn(container, "flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between")}>
          <p>© {currentYear()} {site.tenant.name}. جميع الحقوق محفوظة.</p>
          <PoweredBy className="opacity-80" />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-sm font-extrabold">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-600 hover:text-(--accent)">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
