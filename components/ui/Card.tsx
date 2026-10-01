import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Base surface: white, hairline border, soft shadow. */
export function Card({
  interactive,
  className,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white shadow-card",
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

/** Square tinted holder for a feature/step icon. */
export function IconTile({
  className,
  tone = "brand",
  ...props
}: ComponentProps<"div"> & { tone?: "brand" | "gold" | "dark" }) {
  return (
    <div
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl",
        tone === "brand" && "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
        tone === "gold" && "bg-gold-50 text-gold-600 ring-1 ring-inset ring-gold-100",
        tone === "dark" && "bg-white/10 text-gold-300 ring-1 ring-inset ring-white/10",
        className,
      )}
      {...props}
    />
  );
}
