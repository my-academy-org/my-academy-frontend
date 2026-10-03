import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/dashboard/Toaster";
import { getStatistics, load } from "@/lib/admin/api";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: { default: "لوحة المشرف العام", template: "%s · لوحة المشرف العام" },
  robots: { index: false, follow: false },
};

/** Super Admin dashboard (SUPER_ADMIN only), on the main platform domain at /super-admin. */
export default async function AdminLayout({ children }: LayoutProps<"/super-admin">) {
  const session = await requireRole("SUPER_ADMIN", "/super-admin");
  const stats = await load(getStatistics);

  return (
    <ToastProvider>
      <AdminShell
        user={{ name: session.name, email: session.email }}
        counts={stats.ok ? { academies: stats.data.academies.total, owners: stats.data.owners.total } : undefined}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
