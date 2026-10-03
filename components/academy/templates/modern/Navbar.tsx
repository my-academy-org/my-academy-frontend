"use client";

import Link from "next/link";
import { AcademyMark } from "@/components/academy/shared/brand";
import { useAcademyNav } from "@/components/academy/shared/useAcademyNav";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { academyRoutes } from "@/lib/academy/nav";
import type { AcademySite, StudentSession } from "@/lib/academy/types";
import { btn, container } from "./kit";

export function Navbar({ site, session }: { site: AcademySite; session: StudentSession | null }) {
  const nav = useAcademyNav({ signedIn: !!session });

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow] duration-300",
        nav.scrolled || nav.open ? "bg-white/90 shadow-[0_1px_0_#e2e8f0] backdrop-blur-md" : "bg-white",
      )}
    >
      <div className={cn(container, "flex h-[4.25rem] items-center justify-between gap-6")}>
        <Link href={academyRoutes.home} className="flex min-w-0 items-center gap-3">
          <AcademyMark site={site} className="size-10 rounded-xl bg-(--accent) text-lg font-extrabold text-(--accent-fg)" />
          <span className="truncate text-base font-extrabold text-slate-900">{site.tenant.name}</span>
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full bg-slate-100/70 p-1">
            {nav.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={nav.isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    nav.isActive(item.href) ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {session ? (
            <span className="hidden items-center gap-2 text-sm font-bold text-slate-700 sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                <Icon name="user" className="size-4" />
              </span>
              {session.name}
            </span>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href={academyRoutes.login} className={btn.ghost}>
                تسجيل الدخول
              </Link>
              <Link href={academyRoutes.register} className={btn.small}>
                إنشاء حساب
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={nav.toggle}
            aria-expanded={nav.open}
            aria-controls="academy-menu"
            aria-label={nav.open ? "إغلاق القائمة" : "فتح القائمة"}
            className="-me-2 grid size-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 lg:hidden"
          >
            <Icon name={nav.open ? "x" : "menu"} className="size-6" />
          </button>
        </div>
      </div>

      <div id="academy-menu" hidden={!nav.open} className="border-t border-slate-100 bg-white lg:hidden">
        <div className={cn(container, "py-4")}>
          <ul className="flex flex-col gap-1">
            {nav.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={nav.close}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-base font-bold",
                    nav.isActive(item.href) ? "bg-(--accent-soft) text-(--accent)" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {!session && (
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <Link href={academyRoutes.login} onClick={nav.close} className={btn.secondary}>
                تسجيل الدخول
              </Link>
              <Link href={academyRoutes.register} onClick={nav.close} className={btn.primary}>
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
