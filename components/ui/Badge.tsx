import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "gold" | "accent" | "outline" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-ink-700",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
  gold: "bg-gold-50 text-gold-600 ring-1 ring-inset ring-gold-100",
  accent: "bg-gold-400 text-brand-950",
  outline: "bg-white text-ink-700 ring-1 ring-inset ring-line-strong",
  dark: "bg-white/10 text-white ring-1 ring-inset ring-white/15",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: Tone;
  /** Shows a small leading status dot. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />}
      {children}
    </span>
  );
}
