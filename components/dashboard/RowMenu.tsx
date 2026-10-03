"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type MenuItem = {
  label: string;
  icon: IconName;
  href?: string;
  onSelect?: () => void;
  tone?: "danger";
  /** Draws a separator above this item. */
  separated?: boolean;
};

const MENU_WIDTH = 208;

/**
 * Per-row actions menu. Rendered in a portal with fixed positioning so it
 * isn't clipped by the table's horizontal scroll container.
 */
export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = (refocus = true) => {
    setPos(null);
    if (refocus) buttonRef.current?.focus();
  };

  const toggle = () => {
    if (pos) return close();
    const rect = buttonRef.current!.getBoundingClientRect();
    const rtl = document.documentElement.dir === "rtl";
    const height = items.length * 40 + 24;
    const below = rect.bottom + 6 + height < window.innerHeight;
    setPos({
      top: below ? rect.bottom + 6 : Math.max(8, rect.top - 6 - height),
      // Open towards the inside of the table: rightwards in RTL, leftwards in LTR.
      left: rtl ? rect.left : rect.right - MENU_WIDTH,
    });
  };

  useEffect(() => {
    if (!pos) return;
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();

    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setPos(null);
    };
    const onDismiss = () => setPos(null);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onDismiss);
    window.addEventListener("scroll", onDismiss, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onDismiss);
      window.removeEventListener("scroll", onDismiss, true);
    };
  }, [pos]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    const nodes = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(i + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(i - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const itemClass = (item: MenuItem) =>
    cn(
      "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-start text-sm font-medium outline-none transition-colors",
      item.tone === "danger"
        ? "text-red-600 hover:bg-red-50 focus-visible:bg-red-50"
        : "text-ink-700 hover:bg-muted hover:text-ink-950 focus-visible:bg-muted",
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        aria-controls={pos ? menuId : undefined}
        onClick={toggle}
        className={cn(
          "grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-muted hover:text-ink-900",
          pos && "bg-muted text-ink-900",
        )}
      >
        <Icon name="more" className="size-5" strokeWidth={2.5} />
      </button>

      {pos &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className="animate-fade-up fixed z-[60] rounded-xl border border-line bg-white p-1.5 shadow-lift [animation-duration:0.15s]"
          >
            {items.map((item) => (
              <div key={item.label}>
                {item.separated && <div className="-mx-1.5 my-1.5 border-t border-line" role="separator" />}
                {item.href ? (
                  <Link href={item.href} role="menuitem" className={itemClass(item)} onClick={() => close(false)}>
                    <Icon name={item.icon} className="size-4 shrink-0 opacity-70" />
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={itemClass(item)}
                    onClick={() => {
                      close(false);
                      item.onSelect?.();
                    }}
                  >
                    <Icon name={item.icon} className="size-4 shrink-0 opacity-70" />
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
