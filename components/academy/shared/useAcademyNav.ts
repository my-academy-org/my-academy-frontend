"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isActivePath, publicNav, studentNav } from "@/lib/academy/nav";

/** Shared navbar behaviour: active link, mobile menu state, scroll state. */
export function useAcademyNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu when the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return {
    items: signedIn ? studentNav : publicNav,
    isActive: (href: string) => isActivePath(pathname, href),
    open,
    toggle: () => setOpen((o) => !o),
    close: () => setOpen(false),
    scrolled,
  };
}
