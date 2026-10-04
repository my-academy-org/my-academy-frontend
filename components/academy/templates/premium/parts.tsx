import Link from "next/link";
import type { ReactNode } from "react";
import { AcademyImage } from "@/components/academy/shared/AcademyImage";
import { currentYear, PoweredBy } from "@/components/academy/shared/brand";
import { socialLabels } from "@/components/academy/shared/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatExams, formatHours, formatLessons, paragraphs, telHref } from "@/lib/academy/format";
import { academyRoutes, publicNav } from "@/lib/academy/nav";
import type { AcademySite, Course, StudentSession } from "@/lib/academy/types";
import { btn, container, display } from "./kit";
import { Navbar } from "./Navbar";

/* ---------------- Layout ---------------- */

export function Shell({ site, session, children }: { site: AcademySite; session: StudentSession | null; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0d0d0f] text-[#f3eee4] selection:bg-(--accent) selection:text-(--accent-fg)">
      <Navbar site={site} session={session} />
      <main className="flex-1">{children}</main>
      <Footer site={site} />
    </div>
  );
}

export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("py-24 sm:py-32", className)}>
      <div className={container}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-sm font-semibold text-(--accent)", className)}>
      <span className="h-px w-10 bg-(--accent)/60" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Heading({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return <Tag className={cn(display, "text-4xl leading-[1.35] text-balance text-white sm:text-5xl", className)}>{children}</Tag>;
}

/** Dark page opener for inner pages (sits under the floating navbar). */
export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="relative overflow-hidden border-b border-white/8 pt-40 pb-20 sm:pt-48 sm:pb-24">
      <Glow />
      <div className={cn(container, "relative")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h1" className="mt-6 max-w-4xl sm:text-6xl">{title}</Heading>
        {description && <p className="mt-6 max-w-2xl text-lg leading-9 text-white/55">{description}</p>}
      </div>
    </div>
  );
}

export function Glow({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute -top-40 start-1/4 h-[30rem] w-[50rem] max-w-full rounded-full bg-(--accent)/[0.07] blur-3xl", className)}
      aria-hidden="true"
    />
  );
}

/* ---------------- Courses ---------------- */

/** Large editorial row; alternates image side for rhythm. */
export function CourseRow({ course, index }: { course: Course; index: number }) {
  return (
    <Link
      href={academyRoutes.course(course.slug)}
      className="group grid items-center gap-8 border-t border-white/8 py-12 first:border-t-0 md:grid-cols-2 md:gap-14 lg:py-16"
    >
      <div className={cn("relative aspect-[16/11] overflow-hidden rounded-2xl", index % 2 === 1 && "md:order-2")}>
        <AcademyImage
          media={course.image}
          label={course.title}
          tone="dark"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 ring-inset" />
      </div>
      <div>
        <p className="flex items-baseline gap-4">
          <span className={cn(display, "text-5xl text-(--accent)")} dir="ltr">{String(index + 1).padStart(2, "0")}</span>
          {course.category && <span className="text-sm text-white/45">{course.category}</span>}
        </p>
        <h3 className={cn(display, "mt-5 text-3xl leading-[1.35] text-white sm:text-4xl")}>{course.title}</h3>
        <p className="mt-4 max-w-md text-lg leading-8 text-white/55">{course.shortDescription}</p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/45">
          {course.lessonCount != null && <li>{formatLessons(course.lessonCount)}</li>}
          {course.durationHours && <li>{formatHours(course.durationHours)}</li>}
          {course.level && <li>{course.level}</li>}
        </ul>
        <span className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-(--accent)">
          اكتشف البرنامج
          <span className="h-px w-8 bg-(--accent) transition-all duration-300 group-hover:w-14" />
        </span>
      </div>
    </Link>
  );
}

export function CourseFacts({ course }: { course: Course }) {
  const items = [
    course.lessonCount != null ? { label: "الدروس", value: formatLessons(course.lessonCount) } : null,
    course.examCount ? { label: "الاختبارات", value: formatExams(course.examCount) } : null,
    course.durationHours ? { label: "المدة", value: formatHours(course.durationHours) } : null,
    course.level ? { label: "المستوى", value: course.level } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/8 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="bg-[#111114] px-5 py-5">
          <dt className="text-xs text-white/45">{it.label}</dt>
          <dd className="mt-1.5 font-bold text-white">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- Teacher ---------------- */

export function Portrait({ site, className, priority }: { site: AcademySite; className?: string; priority?: boolean }) {
  const t = site.landing.teacher;
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -inset-3 rounded-t-full border border-(--accent)/30" aria-hidden="true" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full">
        <AcademyImage media={t.image} label={t.name} tone="dark" priority={priority} sizes="(min-width: 1024px) 35vw, 90vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f]/70 via-transparent to-transparent" />
      </div>
    </div>
  );
}

export function Story({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-6 text-lg leading-9 text-white/65", className)}>
      {paragraphs(text).map((p, i) => (
        <p key={i} className={i === 0 ? "text-xl leading-10 text-white/85" : undefined}>{p}</p>
      ))}
    </div>
  );
}

/* ---------------- CTA & Footer ---------------- */

export function CTA({ site }: { site: AcademySite }) {
  return (
    <section className="relative overflow-hidden border-t border-white/8 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 w-[60rem] max-w-full -translate-y-1/2 rounded-full bg-(--accent)/10 blur-3xl" aria-hidden="true" />
      <div className={cn(container, "relative text-center")}>
        <p className="text-sm font-semibold text-(--accent)">المقاعد محدودة في كل برنامج</p>
        <h2 className={cn(display, "mx-auto mt-6 max-w-3xl text-4xl leading-[1.35] text-white sm:text-6xl")}>
          ابدأ رحلتك مع {site.landing.teacher.name}
        </h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link href={academyRoutes.register} className={btn.primary}>احجز مقعدك الآن</Link>
          <Link href={academyRoutes.contact} className={btn.ghost}>
            تحدّث معنا أولاً
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer({ site }: { site: AcademySite }) {
  const c = site.academy.contact;
  return (
    <footer className="border-t border-white/8">
      <div className={cn(container, "grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]")}>
        <div>
          <p className="flex items-center gap-3 text-lg font-bold text-white">
            <span className="text-(--accent)">◆</span> {site.tenant.name}
          </p>
          {site.landing.footer.tagline && <p className="mt-4 max-w-sm leading-8 text-white/45">{site.landing.footer.tagline}</p>}
        </div>
        <ul className="space-y-3 text-sm">
          {publicNav.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-white/55 hover:text-white">{l.label}</Link>
            </li>
          ))}
        </ul>
        <ul className="space-y-3 text-sm text-white/55">
          {c.email && <li><a href={`mailto:${c.email}`} dir="ltr" className="hover:text-white">{c.email}</a></li>}
          {c.phone && <li><a href={telHref(c.phone)} dir="ltr" className="hover:text-white">{c.phone}</a></li>}
          {c.address && <li>{c.address}</li>}
          {!!c.socials?.length && (
            <li className="flex gap-4 pt-2">
              {c.socials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener" className="text-white/70 hover:text-(--accent)">{socialLabels[s.platform]}</a>
              ))}
            </li>
          )}
        </ul>
      </div>
      <div className="border-t border-white/8">
        <div className={cn(container, "flex flex-col gap-2 py-6 text-xs text-white/35 sm:flex-row sm:justify-between")}>
          <p>© {currentYear()} {site.tenant.name}</p>
          <PoweredBy className="opacity-80" />
        </div>
      </div>
    </footer>
  );
}
