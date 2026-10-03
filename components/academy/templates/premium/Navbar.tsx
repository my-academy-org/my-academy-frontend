"use client";

import Link from "next/link";
import { useAcademyNav } from "@/components/academy/shared/useAcademyNav";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, StudentSession } from "@/lib/academy/types";
import { container } from "./kit";

/** Floats over the cinematic hero; turns solid on scroll. */
export function Navbar({ site, session }: { site: AcademySite; session: StudentSession | null }) {
  const nav = useAcademyNav({ signedIn: !!session });
  const solid = nav.scrolled || nav.open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-500",
        solid ? "border-b border-white/8 bg-[#0d0d0f]/85 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className={cn(container, "flex h-20 items-center justify-between gap-6")}>
        <Link href={academyRoutes.home} className="flex min-w-0 items-center gap-3 text-white">
          <span className="text-(--accent)" aria-hidden="true">◆</span>
          <span className="truncate text-[1.0625rem] font-bold">{site.tenant.name}</span>
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={nav.isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-sm font-semibold transition-colors",
                    nav.isActive(item.href)
                      ? "text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:mx-auto after:h-px after:w-4 after:bg-(--accent)"
                      : "text-white/55 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-5">
          {session ? (
            <span className="hidden text-sm font-semibold text-white/80 sm:block">{session.name}</span>
          ) : (
            <>
              <Link href={academyRoutes.login} className="hidden text-sm font-semibold text-white/70 hover:text-white sm:block">
                تسجيل الدخول
              </Link>
              <Link
                href={academyRoutes.register}
                className="hidden h-10 items-center rounded-full border border-(--accent)/60 px-5 text-sm font-bold text-(--accent) transition hover:bg-(--accent) hover:text-(--accent-fg) sm:inline-flex"
              >
                انضم الآن
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={nav.toggle}
            aria-expanded={nav.open}
            aria-controls="academy-menu"
            aria-label={nav.open ? "إغلاق القائمة" : "فتح القائمة"}
            className="-me-2 grid size-10 place-items-center text-white lg:hidden"
          >
            <Icon name={nav.open ? "x" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      <div id="academy-menu" hidden={!nav.open} className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/8 lg:hidden">
        <div className={cn(container, "flex h-full flex-col py-8")}>
          <ul className="space-y-1">
            {nav.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={nav.close}
                  className={cn(
                    "block py-3 font-[family-name:var(--font-messiri)] text-3xl",
                    nav.isActive(item.href) ? "text-(--accent)" : "text-white/80",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {!session && (
            <div className="mt-auto grid gap-3 border-t border-white/10 pt-6">
              <Link href={academyRoutes.register} onClick={nav.close} className="inline-flex h-12 items-center justify-center rounded-full bg-(--accent) font-bold text-(--accent-fg)">
                انضم الآن
              </Link>
              <Link href={academyRoutes.login} onClick={nav.close} className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 font-bold text-white">
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
