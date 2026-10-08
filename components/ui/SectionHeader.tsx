import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  layout = "split",
  inverse,
  className,
}: {
  /** Section number shown before the eyebrow, e.g. "02". */
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** "split" sets the description beside the title on wide screens; "stack" keeps it underneath. */
  layout?: "split" | "stack";
  inverse?: boolean;
  className?: string;
}) {
  const split = layout === "split";

  return (
    <Reveal className={cn(split && "grid gap-x-12 gap-y-5 lg:grid-cols-12 lg:items-end", className)}>
      <div className={cn(split && "lg:col-span-7")}>
        {eyebrow && (
          <p
            className={cn(
              "mb-5 flex items-center gap-3 text-sm font-semibold",
              inverse ? "text-gold-300" : "text-brand-700",
            )}
          >
            {index && (
              <>
                <span className={cn("tabular-nums", inverse ? "text-white/40" : "text-ink-400")}>{index}</span>
                <span className={cn("h-3.5 w-px", inverse ? "bg-white/20" : "bg-line-strong")} aria-hidden="true" />
              </>
            )}
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "text-balance text-[1.75rem] font-bold leading-[1.4] sm:text-4xl sm:leading-[1.35] lg:text-[2.625rem]",
            inverse ? "text-white" : "text-ink-950",
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p
          className={cn(
            "text-pretty text-base leading-8 sm:text-[1.0625rem]",
            split ? "max-w-xl lg:col-span-5 lg:pb-1.5" : "mt-5 max-w-xl",
            inverse ? "text-white/65" : "text-ink-600",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
