import Link from "next/link";
import type { ReactNode } from "react";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { AcademyMark, currentYear, PoweredBy } from "@/components/academy/shared/brand";
import { featureIcon, socialLabels } from "@/components/academy/shared/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { arabicDigits, formatHours, paragraphs, telHref } from "@/lib/academy/format";
import { academyRoutes, publicNav } from "@/lib/academy/nav";
import type { AcademySite, Course, Feature, Qualification, StudentSession } from "@/lib/academy/types";
import { container } from "./kit";
import { Navbar } from "./Navbar";

/* ---------------- Layout ---------------- */

export function Shell({ site, session, children }: { site: AcademySite; session: StudentSession | null; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f3ea] text-[#1b2333]">
      <Navbar site={site} session={session} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
    </div>
  );
}

export function Section({ children, className, tone = "paper" }: { children: ReactNode; className?: string; tone?: "paper" | "white" }) {
  return (
    <section className={cn("border-b border-[#1b2333]/12 py-16 sm:py-20", tone === "white" && "bg-[#fdfbf6]", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

/** Numbered editorial heading: "٠٢ — المقررات الدراسية". */
export function SectionTitle({
  index,
  label,
  title,
  description,
  action,
}: {
  index?: number;
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#1b2333]/15 pb-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 text-sm font-bold text-[#7a2232]">
          {index != null && <span className="font-serif text-base">{arabicDigits(String(index).padStart(2, "0"))}</span>}
          <span className="h-px w-8 bg-[#7a2232]/50" />
          {label}
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-[1.45] font-bold sm:text-[2.5rem]">{title}</h2>
        {description && <p className="mt-3 leading-8 text-[#1b2333]/70">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-40 items-center gap-2", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-[#7a2232]/40" />
      <span className="size-1.5 rotate-45 bg-[#7a2232]" />
      <span className="h-px flex-1 bg-[#7a2232]/40" />
    </div>
  );
}

export function PageHeader({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <div className="border-b border-[#1b2333]/15">
      <div className={cn(container, "py-14 text-center sm:py-20")}>
        <p className="text-sm font-bold text-[#7a2232]">{label}</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.4] font-bold sm:text-5xl">{title}</h1>
        <Ornament className="mx-auto mt-5" />
        {description && <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#1b2333]/70">{description}</p>}
      </div>
    </div>
  );
}

/* ---------------- Courses: information-dense table ---------------- */

export function CourseTable({ courses, startIndex = 1 }: { courses: Course[]; startIndex?: number }) {
  return (
    <div className="border border-[#1b2333]/15 bg-[#fdfbf6]">
      {/* Column header (desktop) */}
      <div className="hidden grid-cols-[3rem_1fr_9rem_6rem_6rem_6rem_7rem] gap-4 border-b border-[#1b2333]/15 bg-(--accent) px-5 py-3 text-xs font-bold text-white/85 lg:grid">
        <span>#</span>
        <span>المقرر</span>
        <span>المستوى</span>
        <span className="text-center">المحاضرات</span>
        <span className="text-center">الاختبارات</span>
        <span className="text-center">المدة</span>
        <span />
      </div>
      <ol className="divide-y divide-[#1b2333]/12">
        {courses.map((c, i) => (
          <li key={c.id}>
            <Link
              href={academyRoutes.course(c.slug)}
              className="group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 px-5 py-5 transition-colors hover:bg-white lg:grid-cols-[3rem_1fr_9rem_6rem_6rem_6rem_7rem] lg:items-center"
            >
              <span className="font-serif text-xl font-bold text-[#7a2232]">{arabicDigits(startIndex + i)}</span>
              <div className="min-w-0">
                <p className="font-serif text-lg font-bold group-hover:text-(--accent)">{c.title}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-7 text-[#1b2333]/65">{c.shortDescription}</p>
              </div>
              {/* Mobile meta row */}
              <dl className="col-start-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#1b2333]/70 lg:contents">
                <Meta label="المستوى" value={c.level ?? "—"} />
                <Meta label="المحاضرات" value={arabicDigits(c.lessonCount)} center />
                <Meta label="الاختبارات" value={c.examCount != null ? arabicDigits(c.examCount) : "—"} center />
                <Meta label="المدة" value={c.durationHours ? arabicDigits(formatHours(c.durationHours)) : "—"} center />
              </dl>
              <span className="col-start-2 text-sm font-bold text-[#7a2232] lg:col-start-auto lg:text-end">
                تفاصيل المقرر ←
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Meta({ label, value, center }: { label: string; value: string; center?: boolean }) {
  return (
    <div className={cn("flex gap-1.5 lg:block", center && "lg:text-center")}>
      <dt className="font-bold lg:sr-only">{label}:</dt>
      <dd className="lg:text-sm lg:font-semibold lg:text-[#1b2333]">{value}</dd>
    </div>
  );
}

/* ---------------- Features ---------------- */

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid gap-px border border-[#1b2333]/15 bg-[#1b2333]/15 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="bg-[#fdfbf6] p-7">
          <Icon name={featureIcon(f.icon)} className="size-7 text-(--accent)" />
          <h3 className="mt-5 font-serif text-xl font-bold">{f.title}</h3>
          <p className="mt-2 text-[0.9375rem] leading-7 text-[#1b2333]/70">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Teacher ---------------- */

export function QualificationsTable({ items }: { items: Qualification[] }) {
  return (
    <table className="w-full border-collapse text-start">
      <caption className="sr-only">المؤهلات العلمية</caption>
      <tbody>
        {items.map((q) => (
          <tr key={q.title} className="border-b border-[#1b2333]/12 align-top last:border-0">
            <td className="w-20 py-4 pe-4 font-serif text-lg font-bold text-[#7a2232]">{q.year ? arabicDigits(q.year) : "—"}</td>
            <td className="py-4">
              <p className="font-bold">{q.title}</p>
              {q.institution && <p className="mt-0.5 text-sm text-[#1b2333]/60">{q.institution}</p>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TeacherCard({ site }: { site: AcademySite }) {
  const t = site.landing.teacher;
  return (
    <figure className="border border-[#1b2333]/15 bg-[#fdfbf6] p-3">
      <div className="relative aspect-[4/5] overflow-hidden">
        <AcademyImage media={t.image} label={t.name} tone="paper" sizes="(min-width: 1024px) 30vw, 100vw" />
      </div>
      <figcaption className="px-2 pt-4 pb-2 text-center">
        <p className="font-serif text-xl font-bold">{t.name}</p>
        {t.title && <p className="mt-1 text-sm text-[#1b2333]/60">{t.title}</p>}
      </figcaption>
    </figure>
  );
}

export function Prose({ text, lead }: { text: string; lead?: boolean }) {
  return (
    <div className="space-y-5">
      {paragraphs(text).map((p, i) => (
        <p key={i} className={cn("leading-9 text-[#1b2333]/80", lead && i === 0 ? "font-serif text-xl leading-10 text-[#1b2333]" : "text-[1.0625rem]")}>
          {p}
        </p>
      ))}
    </div>
  );
}

/* ---------------- CTA & Footer ---------------- */

export function CTA({ site }: { site: AcademySite }) {
  return (
    <section className="bg-(--accent) text-white">
      <div className={cn(container, "flex flex-col items-center gap-6 py-16 text-center sm:py-20")}>
        <p className="text-sm font-bold text-white/60">التسجيل مفتوح</p>
        <h2 className="max-w-3xl font-serif text-3xl leading-[1.5] font-bold sm:text-[2.6rem]">انضم إلى طلاب {site.tenant.name}</h2>
        <p className="max-w-xl leading-8 text-white/70">أنشئ حساب الطالب، ثم فعّل المقرر بكود التسجيل وابدأ المحاضرة الأولى.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href={academyRoutes.register} className="inline-flex h-12 items-center justify-center bg-white px-8 font-bold text-(--accent) hover:bg-[#f7f3ea]">
            تسجيل طالب جديد
          </Link>
          <Link href={academyRoutes.courses} className="inline-flex h-12 items-center justify-center border border-white/40 px-8 font-bold hover:bg-white/10">
            دليل المقررات
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer({ site }: { site: AcademySite }) {
  const c = site.academy.contact;
  return (
    <footer className="bg-[#141b29] text-white/70">
      <div className={cn(container, "grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1.3fr]")}>
        <div>
          <div className="flex items-center gap-3">
            <AcademyMark site={site} className="size-12 rounded-full border border-white/30 font-serif text-xl font-bold text-white" />
            <p className="font-serif text-xl font-bold text-white">{site.tenant.name}</p>
          </div>
          {site.landing.footer.tagline && <p className="mt-5 max-w-sm text-sm leading-7">{site.landing.footer.tagline}</p>}
        </div>
        <div>
          <p className="border-b border-white/15 pb-3 font-serif text-lg font-bold text-white">روابط</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[...publicNav, { label: "تسجيل الدخول", href: academyRoutes.login }, { label: "تسجيل طالب", href: academyRoutes.register }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="border-b border-white/15 pb-3 font-serif text-lg font-bold text-white">بيانات التواصل</p>
          <dl className="mt-4 space-y-3 text-sm">
            {c.address && <FooterRow label="العنوان" value={c.address} />}
            {c.phone && <FooterRow label="الهاتف" value={c.phone} href={telHref(c.phone)} ltr />}
            {c.email && <FooterRow label="البريد" value={c.email} href={`mailto:${c.email}`} ltr />}
            {c.workingHours && <FooterRow label="المواعيد" value={c.workingHours} />}
          </dl>
          {!!c.socials?.length && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
              {c.socials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener" className="text-white/80 underline-offset-4 hover:text-white hover:underline">
                  {socialLabels[s.platform]}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className={cn(container, "flex flex-col gap-2 py-5 text-xs sm:flex-row sm:justify-between")}>
          <p>© {arabicDigits(currentYear())} {site.tenant.name}</p>
          <PoweredBy className="opacity-70" />
        </div>
      </div>
    </footer>
  );
}

function FooterRow({ label, value, href, ltr }: { label: string; value: string; href?: string; ltr?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-white/45">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined}>{href ? <a href={href} className="hover:text-white">{value}</a> : value}</dd>
    </div>
  );
}

