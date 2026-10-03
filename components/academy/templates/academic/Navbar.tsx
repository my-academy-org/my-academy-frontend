"use client";

import Link from "next/link";
import { AcademyMark } from "@/components/academy/shared/brand";
import { useAcademyNav } from "@/components/academy/shared/useAcademyNav";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, StudentSession } from "@/lib/academy/types";
import { container } from "./kit";

/** Institutional header: utility bar → centred masthead → ruled navigation. */
export function Navbar({ site, session }: { site: AcademySite; session: StudentSession | null }) {
  const nav = useAcademyNav({ signedIn: !!session });
  const { contact } = site.academy;

  return (
    <header className="bg-[#f7f3ea]">
      {/* Utility bar */}
      <div className="bg-(--accent) text-xs text-white/80">
        <div className={cn(container, "flex h-9 items-center justify-between gap-4")}>
          <div className="flex min-w-0 items-center gap-5">
            {contact.phone && (
              <a href={telHref(contact.phone)} dir="ltr" className="hidden items-center gap-1.5 hover:text-white sm:flex">
                <Icon name="phone" className="size-3.5" /> {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} dir="ltr" className="truncate hover:text-white">
                {contact.email}
              </a>
            )}
          </div>
          {session ? (
            <span className="font-bold text-white">{session.name}</span>
          ) : (
            <div className="flex shrink-0 items-center gap-4 font-bold">
              <Link href={academyRoutes.login} className="hover:text-white">تسجيل الدخول</Link>
              <span className="h-3 w-px bg-white/30" />
              <Link href={academyRoutes.register} className="text-white hover:underline">تسجيل طالب جديد</Link>
            </div>
          )}
        </div>
      </div>

      {/* Masthead */}
      <div className={cn(container, "flex items-center justify-between gap-4 py-5 lg:flex-col lg:justify-center lg:py-7")}>
        <Link href={academyRoutes.home} className="flex min-w-0 items-center gap-3 lg:flex-col lg:gap-3 lg:text-center">
          <AcademyMark
            site={site}
            className="size-12 rounded-full border-2 border-[#7a2232] font-serif text-xl font-bold text-[#7a2232] ring-4 ring-[#7a2232]/10 lg:size-16 lg:text-2xl"
          />
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl font-bold text-[#1b2333] lg:text-[1.75rem]">{site.tenant.name}</span>
            {site.landing.teacher.title && (
              <span className="mt-0.5 block truncate text-xs text-[#1b2333]/60 lg:text-sm">{site.landing.teacher.title}</span>
            )}
          </span>
        </Link>
        <button
          type="button"
          onClick={nav.toggle}
          aria-expanded={nav.open}
          aria-controls="academy-menu"
          aria-label={nav.open ? "إغلاق القائمة" : "فتح القائمة"}
          className="-me-2 grid size-11 shrink-0 place-items-center border border-[#1b2333]/20 text-[#1b2333] lg:hidden"
        >
          <Icon name={nav.open ? "x" : "menu"} className="size-5" />
        </button>
      </div>

      {/* Ruled navigation */}
      <nav aria-label="القائمة الرئيسية" className="hidden border-y border-[#1b2333]/15 lg:block">
        <ul className={cn(container, "flex justify-center gap-10")}>
          {nav.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={nav.isActive(item.href) ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b-2 py-3.5 text-[0.9375rem] font-bold transition-colors",
                  nav.isActive(item.href)
                    ? "border-[#7a2232] text-[#1b2333]"
                    : "border-transparent text-[#1b2333]/60 hover:text-[#1b2333]",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div id="academy-menu" hidden={!nav.open} className="border-t border-[#1b2333]/15 lg:hidden">
        <ul className={cn(container, "divide-y divide-[#1b2333]/10 py-2")}>
          {nav.items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={nav.close}
                className={cn(
                  "flex items-center justify-between py-3.5 font-bold",
                  nav.isActive(item.href) ? "text-[#7a2232]" : "text-[#1b2333]",
                )}
              >
                {item.label}
                <Icon name="chevron-side" className="size-4 opacity-40 rtl:rotate-180" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-px bg-[#1b2333]/15 lg:hidden" />
    </header>
  );
}
