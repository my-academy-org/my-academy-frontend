import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { VerifyOtpForm } from "./VerifyOtpForm";

export const metadata: Metadata = { title: "تأكيد البريد الإلكتروني", robots: { index: false, follow: false } };

/**
 * Where an invited academy owner confirms their email with the OTP they
 * received (POST /auth/academy-admin/verify-otp). Public: the account doesn't
 * exist until the code is confirmed. `?email=` prefills the address.
 */
export default async function VerifyOtpPage({ searchParams }: PageProps<"/verify-otp">) {
  const { email } = await searchParams;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Link href="/" aria-label="My Academy — الرئيسية" className="self-start">
          <Logo />
        </Link>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-extrabold text-ink-950">تأكيد البريد الإلكتروني</h1>
          <p className="mt-2 leading-7 text-ink-600">أدخل رمز التحقق الذي وصلك على بريدك لإنشاء حساب مالك الأكاديمية.</p>

          <div className="mt-8">
            <VerifyOtpForm email={typeof email === "string" ? email.trim() : undefined} />
          </div>

          <div className="mt-8 flex gap-3 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-ink-600">
            <Icon name="mail" className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <p>
              <span className="font-bold text-ink-900">لم يصلك الرمز أو انتهت صلاحيته؟</span> تواصل مع فريق My Academy لإرسال رمز جديد.
            </p>
          </div>
        </main>

        <p className="text-center text-sm text-ink-500">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            تسجيل الدخول
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-brand-900 lg:block" aria-hidden="true">
        <div className="bg-grid-dark mask-fade-y absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="max-w-md text-3xl font-extrabold leading-[1.45]">خطوة واحدة تفصلك عن لوحة أكاديميتك.</p>
          <p className="mt-4 max-w-md leading-8 text-white/65">بعد تأكيد بريدك نرسل لك بيانات الدخول، ويتفعّل حسابك عند أول تسجيل دخول.</p>
        </div>
      </aside>
    </div>
  );
}
