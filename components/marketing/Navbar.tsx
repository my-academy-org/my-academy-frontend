"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { nav } from "@/lib/site";
import { RequestAcademyButton } from "./RequestAcademy";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        solid
          ? "border-b border-line bg-white/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/#top" aria-label="My Academy — الرئيسية" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="px-3 py-2 text-[0.9375rem] font-medium text-ink-600 transition-colors hover:text-ink-950"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <Button href="/login" variant="ghost" size="sm">
              تسجيل الدخول
            </Button>
            <RequestAcademyButton size="sm" />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="-me-2 grid size-10 place-items-center rounded-lg text-ink-800 hover:bg-muted lg:hidden"
          >
            <Icon name={menuOpen ? "x" : "menu"} className="size-6" />
          </button>
        </div>
      </Container>

      {/* Mobile / tablet menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-white lg:hidden"
      >
        <Container className="py-4">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3.5 text-base font-semibold text-ink-800 hover:bg-muted"
                >
                  {item.label}
                  <Icon name="chevron-side" className="size-4 text-ink-400 rtl:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
            <Button href="/login" variant="secondary" onClick={() => setMenuOpen(false)}>
              تسجيل الدخول
            </Button>
            <div className="grid" onClick={() => setMenuOpen(false)}>
              <RequestAcademyButton withArrow />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
