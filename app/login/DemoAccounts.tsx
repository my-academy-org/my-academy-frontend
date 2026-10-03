"use client";

import type { Role } from "@/lib/auth/session";
import type { DemoAccount } from "@/lib/auth/users";

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "مشرف عام",
  ACADEMY_ADMIN: "صاحب أكاديمية",
  STUDENT: "طالب",
};

/**
 * Demo sign-in, rendered only while no backend is connected (the server passes
 * an empty list once ACADEMY_API_URL is set). Each button posts to the same
 * login action as the form, so the real auth flow and redirects are exercised.
 */
export function DemoAccounts({
  accounts,
  password,
  action,
  next,
  pending,
}: {
  accounts: DemoAccount[];
  password: string;
  action: (fd: FormData) => void;
  next?: string;
  pending: boolean;
}) {
  return (
    <section aria-labelledby="demo-accounts" className="mt-8 rounded-xl border border-dashed border-line-strong bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 id="demo-accounts" className="text-sm font-bold text-ink-900">
          حسابات تجريبية
        </h2>
        <span className="text-xs text-ink-500">
          كلمة المرور{" "}
          <bdi className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-ink-800">{password}</bdi>
        </span>
      </header>
      <ul className="divide-y divide-line">
        {accounts.map((a) => (
          <li key={a.email}>
            <form action={action} className="flex items-center gap-3 px-4 py-2.5">
              <input type="hidden" name="email" value={a.email} />
              <input type="hidden" name="demo" value="1" />
              <input type="hidden" name="next" value={next ?? ""} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-semibold text-ink-900">{a.academy ?? a.name}</span>
                  <span className="text-xs text-ink-500">{roleLabels[a.role]}</span>
                </p>
                <p className="truncate text-xs text-ink-500">
                  <bdi>{a.email}</bdi>
                  {a.note && <> · {a.note}</>}
                </p>
              </div>
              <button
                type="submit"
                disabled={pending}
                className="h-8 shrink-0 rounded-lg border border-line-strong px-3 text-xs font-semibold text-ink-800 transition-colors hover:border-ink-300 hover:bg-canvas disabled:opacity-50"
              >
                دخول
              </button>
            </form>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2.5 text-xs leading-5 text-ink-500">تظهر فقط قبل ربط الـ backend، وتختفي تلقائياً عند ضبط ACADEMY_API_URL.</p>
    </section>
  );
}
