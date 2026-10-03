"use client";

import type { ReactNode } from "react";
import { DashboardShell, ShellAccount } from "@/components/dashboard/DashboardShell";
import { Avatar } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ROOT_DOMAIN } from "@/lib/admin/meta";

export function AdminShell({
  user,
  counts,
  children,
}: {
  user: { name: string; email: string };
  /** Sidebar badges; absent when the statistics couldn't be loaded. */
  counts?: { academies: number; owners: number };
  children: ReactNode;
}) {
  return (
    <DashboardShell
      brand={<Logo />}
      brandHref="/super-admin"
      rootLabel="لوحة المشرف العام"
      nav={[
        {
          label: "إدارة المنصة",
          items: [
            { href: "/super-admin", label: "نظرة عامة", icon: "home", exact: true },
            { href: "/super-admin/academies", label: "الأكاديميات", icon: "academy", badge: counts?.academies },
            { href: "/super-admin/owners", label: "ملّاك الأكاديميات", icon: "users", badge: counts?.owners },
            { href: "/super-admin/templates", label: "القوالب", icon: "layout" },
            { href: "/super-admin/settings", label: "الإعدادات", icon: "settings" },
          ],
        },
      ]}
      account={<ShellAccount avatar={<Avatar name={user.name} className="bg-brand-800" />} name={user.name} meta={<bdi>{user.email}</bdi>} />}
      topbarActions={
        <a
          href={`https://${ROOT_DOMAIN}`}
          target="_blank"
          rel="noreferrer"
          className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-muted hover:text-ink-900 sm:inline-flex"
        >
          <Icon name="external" className="size-4" />
          الموقع العام
        </a>
      }
    >
      {children}
    </DashboardShell>
  );
}
