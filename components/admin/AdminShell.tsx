"use client";

import { useEffect, type ReactNode } from "react";
import { DashboardShell, ShellAccount } from "@/components/dashboard/DashboardShell";
import { Avatar } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { getCurrentUser, getStatistics, logout, type CurrentUser } from "@/lib/admin/api";
import { ROOT_DOMAIN } from "@/lib/admin/meta";
import { homePathFor } from "@/lib/auth/session";
import { Loading, LoadError } from "./ui";
import { useApiQuery } from "./useApiQuery";

/** POST /auth/logout from the browser, so the API clears its own httpOnly cookie. */
async function signOut() {
  await logout().catch(() => {});
  // A full page load, so nothing rendered for the old session survives.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional full page load
  window.location.href = "/login";
}

/**
 * Super Admin chrome and its gate: the signed-in user comes from GET /auth/me,
 * called from the browser. Nothing renders until the API confirms a
 * SUPER_ADMIN session (the API enforces the role on every request regardless).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const me = useApiQuery("me", getCurrentUser, { refresh: false });
  const user = me.data;
  const allowed = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    // Signed in with another role: off to that role's own home.
    if (user && !allowed) window.location.replace(homePathFor(user.role) ?? "/");
  }, [user, allowed]);

  if (me.error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <LoadError message={me.error} />
        <div className="mt-6 text-center">
          <Button href="/login" variant="secondary">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }
  if (!user || !allowed) return <Loading className="min-h-dvh" />;

  return <AdminChrome user={user}>{children}</AdminChrome>;
}

function AdminChrome({ user, children }: { user: CurrentUser; children: ReactNode }) {
  // Sidebar badges; they stay empty if the statistics can't be loaded.
  const stats = useApiQuery("statistics", getStatistics);

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
            { href: "/super-admin/academies", label: "الأكاديميات", icon: "academy", badge: stats.data?.academies.total },
            { href: "/super-admin/owners", label: "ملّاك الأكاديميات", icon: "users", badge: stats.data?.owners.total },
            { href: "/super-admin/templates", label: "القوالب", icon: "layout" },
            { href: "/super-admin/settings", label: "الإعدادات", icon: "settings" },
          ],
        },
      ]}
      account={
        <ShellAccount
          avatar={<Avatar name={user.name} className="bg-brand-800" />}
          name={user.name}
          meta={<bdi>{user.email}</bdi>}
          onSignOut={() => void signOut()}
        />
      }
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
