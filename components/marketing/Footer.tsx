import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footerColumns } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link href="/#top" aria-label="My Academy — الرئيسية">
              <Logo />
            </Link>
            <p className="mt-5 text-[0.9375rem] leading-7 text-ink-600">
              منصة سحابية لإنشاء وإدارة الأكاديميات التعليمية — أكاديمية مستقلة لكل معلّم، على بنية واحدة موثوقة.
            </p>
          </div>

          <nav aria-label="روابط التذييل" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-bold text-ink-950">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[0.9375rem] text-ink-600 transition-colors hover:text-brand-700">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-8 text-sm text-ink-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} My Academy. جميع الحقوق محفوظة.</p>
          <p dir="ltr" className="font-semibold text-ink-400">myacademy.com</p>
        </div>
      </Container>
    </footer>
  );
}
