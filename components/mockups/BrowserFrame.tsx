import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Lightweight browser chrome used around every product screenshot. */
export function BrowserFrame({
  url,
  children,
  className,
  dark,
  compact,
}: {
  url: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        dark ? "border-white/10 bg-ink-900" : "border-line bg-white",
        className,
      )}
    >
      <div
        dir="ltr"
        className={cn(
          "flex items-center gap-3 border-b",
          compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5",
          dark ? "border-white/10 bg-ink-900" : "border-line bg-canvas",
        )}
      >
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "rounded-full",
                compact ? "size-1.5" : "size-2.5",
                dark ? "bg-white/15" : "bg-ink-300/70",
              )}
            />
          ))}
        </div>
        <div
          className={cn(
            "mx-auto flex min-w-0 items-center gap-1.5 rounded-md font-medium",
            compact ? "px-2 py-0.5 text-[9px]" : "max-w-xs flex-1 justify-center px-3 py-1 text-xs",
            dark ? "bg-white/5 text-white/60" : "bg-white text-ink-500 ring-1 ring-line",
          )}
        >
          <svg viewBox="0 0 24 24" className={compact ? "size-2" : "size-3"} fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
        {!compact && <div className="w-[42px]" aria-hidden="true" />}
      </div>
      {children}
    </div>
  );
}
