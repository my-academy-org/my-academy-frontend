import { cn } from "@/lib/cn";

/**
 * Brand mark: an open book whose spine is a person — the learner at the centre.
 * Left page brand green, right page gold.
 *
 * - default: for light surfaces
 * - inverse: for dark surfaces (white + gold)
 * - tile:    the app icon (white + gold on a green rounded square), as used for the favicon
 */
export function LogoMark({
  className,
  inverse,
  tile,
}: {
  className?: string;
  inverse?: boolean;
  tile?: boolean;
}) {
  const light = inverse || tile;
  const left = light ? "#ffffff" : "var(--color-brand-700)";
  const right = light ? "var(--color-gold-300)" : "var(--color-gold-500)";

  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      {tile && <rect width="32" height="32" rx="8" fill="var(--color-brand-700)" />}
      <g transform={tile ? "translate(6.4 6.4) scale(0.6)" : undefined} strokeLinejoin="round" strokeWidth="1.5">
        <circle cx="16" cy="4.4" r="3.4" fill={left} />
        <path d="M1.75 9.25 15.35 14.6v15.9L1.75 25.15Z" fill={left} stroke={left} />
        <path d="M30.25 9.25 16.65 14.6v15.9l13.6-5.35Z" fill={right} stroke={right} />
      </g>
    </svg>
  );
}

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <LogoMark inverse={inverse} className="size-7" />
      <span className={cn("text-[1.125rem] tracking-tight", inverse ? "text-white" : "text-ink-950")}>
        My <span className={cn("font-extrabold", inverse ? "text-gold-300" : "text-brand-700")}>Academy</span>
      </span>
    </span>
  );
}
