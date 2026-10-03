"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { SignOutButton } from "./SignOutButton";

export type ShellNavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Match the href exactly (for the dashboard root). */
  exact?: boolean;
  /** Trailing count or chip. */
  badge?: ReactNode;
};

export type ShellNavGroup = { label?: string; items: ShellNavItem[] };

/**
 * Sidebar + top bar layout shared by the Super Admin and Academy Admin dashboards.
 * On small screens the sidebar becomes a drawer.
 */
export function DashboardShell({
  brand,
  brandHref,
  nav,
  sidebarExtra,
  account,
  rootLabel,
  topbarActions,
  children,
}: {
  brand: ReactNode;
  brandHref: string;
  nav: ShellNavGroup[];
  /** Rendered above the account block (e.g. the plan card). */
  sidebarExtra?: ReactNode;
  account: ReactNode;
  /** First breadcrumb segment, e.g. "لوحة المشرف العام". */
  rootLabel: string;
  topbarActions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = nav.flatMap((g) => g.items).find((item) => isActive(item, pathname));

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Link href={brandHref} onClick={onNavigate} className="min-w-0">
          {brand}
        </Link>
      </div>

      <nav aria-label="القائمة الرئيسية" className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        {nav.map((group, gi) => (
          <div key={group.label ?? gi} className={cn(gi > 0 && "mt-6")}>
            {group.label && <p className="mb-2 px-3 text-[0.6875rem] font-bold tracking-wide text-ink-400">{group.label}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-semibold transition-colors",
                        active ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-muted hover:text-ink-950",
                      )}
                    >
                      {active && <span className="absolute inset-y-2 -start-4 w-1 rounded-e-full bg-brand-600" aria-hidden="true" />}
                      <Icon name={item.icon} className={cn("size-[1.15rem] shrink-0", active ? "text-brand-700" : "text-ink-400")} />
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={cn("ms-auto text-xs tabular-nums", active ? "text-brand-700" : "text-ink-400")}>{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {sidebarExtra && <div className="px-4 pb-4">{sidebarExtra}</div>}
      <div className="border-t border-line p-4">{account}</div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
      >
        تخطَّ إلى المحتوى
      </a>

      <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 border-e border-line bg-white lg:block">{sidebar()}</aside>

      <div className={cn("fixed inset-0 z-50 lg:hidden", !drawerOpen && "pointer-events-none")} aria-hidden={!drawerOpen}>
        <div
          className={cn("absolute inset-0 bg-ink-950/50 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 start-0 w-[17rem] bg-white shadow-float transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full",
          )}
          inert={!drawerOpen}
        >
          {sidebar(() => setDrawerOpen(false))}
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="فتح القائمة"
            className="-ms-2 grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-muted lg:hidden"
          >
            <Icon name="menu" className="size-5" />
          </button>
          <nav aria-label="مسار الصفحة" className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden truncate text-ink-500 sm:inline">{rootLabel}</span>
            {current && (
              <>
                <Icon name="chevron-side" className="hidden size-3.5 shrink-0 text-ink-300 sm:block rtl:rotate-180" />
                <span className="truncate font-semibold text-ink-900">{current.label}</span>
              </>
            )}
          </nav>
          {topbarActions && <div className="ms-auto flex items-center gap-2">{topbarActions}</div>}
        </header>

        <main id="dashboard-main" className="mx-auto w-full max-w-[80rem] flex-1 px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function isActive(item: ShellNavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Signed-in user block for the sidebar footer. */
export function ShellAccount({
  avatar,
  name,
  meta,
  onSignOut,
}: {
  avatar: ReactNode;
  name: string;
  meta: ReactNode;
  /** Signs out from the browser instead of posting to /logout. */
  onSignOut?: () => void;
}) {
  const signOutClass = "grid size-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-muted hover:text-ink-900";
  const signOutIcon = <Icon name="logout" className="size-[1.1rem] rtl:rotate-180" />;
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink-950">{name}</p>
        <p className="truncate text-xs text-ink-500">{meta}</p>
      </div>
      {onSignOut ? (
        <button type="button" aria-label="تسجيل الخروج" onClick={onSignOut} className={signOutClass}>
          {signOutIcon}
        </button>
      ) : (
        <SignOutButton label="تسجيل الخروج" className={signOutClass}>
          {signOutIcon}
        </SignOutButton>
      )}
    </div>
  );
}
