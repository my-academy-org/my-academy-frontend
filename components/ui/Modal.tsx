"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-6xl",
};

/**
 * Accessible modal built on the native <dialog> element: focus trapping,
 * Escape-to-close and top-layer stacking come from the browser.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  size?: keyof typeof sizes;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "modal fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-3xl border border-line bg-white p-0 text-ink-900 shadow-float",
        sizes[size],
      )}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-ink-950 sm:text-xl">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="-me-2 grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-muted hover:text-ink-900"
          >
            <Icon name="x" className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
