import { cn } from "@/lib/cn";

/** Brand mark: an academy arch built from three columns under a pediment. */
export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={inverse ? "#ffffff" : "var(--color-brand-700)"} />
      <path d="M8 13.2 16 8l8 5.2H8Z" fill="var(--color-gold-400)" />
      <path
        d="M10 15.5v7M16 15.5v7M22 15.5v7"
        stroke={inverse ? "var(--color-brand-800)" : "#ffffff"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <LogoMark inverse={inverse} />
      <span
        className={cn(
          "text-[1.0625rem] font-extrabold tracking-tight",
          inverse ? "text-white" : "text-ink-950",
        )}
      >
        My<span className={inverse ? "text-gold-300" : "text-brand-600"}> Academy</span>
      </span>
    </span>
  );
}
