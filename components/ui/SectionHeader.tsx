import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  inverse,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "start";
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-4 inline-flex items-center gap-2 text-sm font-bold",
            inverse ? "text-gold-300" : "text-brand-600",
          )}
        >
          <span
            className={cn("h-px w-6", inverse ? "bg-gold-300/60" : "bg-brand-300")}
            aria-hidden="true"
          />
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-balance text-3xl font-extrabold leading-[1.35] sm:text-4xl lg:text-[2.75rem]",
          inverse ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-pretty text-base leading-8 sm:text-lg sm:leading-8",
            inverse ? "text-white/70" : "text-ink-600",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
