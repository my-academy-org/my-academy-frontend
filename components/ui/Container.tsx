import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Vertical rhythm for top-level page sections. */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-16 sm:py-24 lg:py-28", className)} {...props} />;
}
