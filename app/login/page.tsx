import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { getSession, homeFor } from "@/lib/auth/server";
import { DEMO_AUTH, DEMO_PASSWORD, demoAccounts } from "@/lib/auth/users";
import { ROOT_DOMAIN } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

/** Platform sign-in for SUPER_ADMIN and ACADEMY_ADMIN. Already signed in → straight to their dashboard. */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect(await homeFor(session));
  const { next } = await searchParams;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Link href="/" aria-label="My Academy — الرئيسية" className="self-start">
          <Logo />
        </Link>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-extrabold text-ink-950">تسجيل الدخول</h1>
          <p className="mt-2 leading-7 text-ink-600">للمعلّمين ومشرفي المنصة.</p>

          <div className="mt-8">
            <LoginForm next={typeof next === "string" ? next : undefined} demo={DEMO_AUTH ? { accounts: demoAccounts(), password: DEMO_PASSWORD } : undefined} />
          </div>

          <div className="mt-8 flex gap-3 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-ink-600">
            <Icon name="student" className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <p>
              <span className="font-bold text-ink-900">طالب؟</span> سجّل الدخول من موقع أكاديميتك مباشرةً، مثل{" "}
              <span dir="ltr" className="font-semibold text-ink-800">
                name.{ROOT_DOMAIN}
              </span>
            </p>
          </div>
        </main>

        <p className="text-center text-sm text-ink-500">
          لا تملك أكاديمية بعد؟{" "}
          <Link href="/#pricing" className="font-semibold text-brand-700 hover:text-brand-800">
            اطلب إنشاء أكاديميتك
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-900 lg:block" aria-hidden="true">
        <div className="bg-grid-dark mask-fade-y absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="max-w-md text-3xl font-extrabold leading-[1.45]">
            لوحة تحكم واحدة لإدارة الأكاديمية، الدورات، والطلاب.
          </p>
          <p className="mt-4 max-w-md leading-8 text-white/65">
            كل دور يرى ما يخصّه: المشرف العام يدير المنصة، والمعلّم يدير أكاديميته.
          </p>
        </div>
      </aside>
    </div>
  );
}
