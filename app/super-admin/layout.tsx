import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/dashboard/Toaster";

export const metadata: Metadata = {
  title: { default: "لوحة المشرف العام", template: "%s · لوحة المشرف العام" },
  robots: { index: false, follow: false },
};

/**
 * Super Admin dashboard (SUPER_ADMIN only), on the main platform domain at /super-admin.
 *
 * The dashboard talks to the API straight from the browser: the session check
 * (GET /auth/me) and every data request live in the client (AdminShell,
 * lib/admin/api.ts). The server only renders the shell; proxy.ts turns away
 * requests without a session cookie.
 */
export default function AdminLayout({ children }: LayoutProps<"/super-admin">) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
