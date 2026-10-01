import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "inverse-outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(7_34_28/0.3)] hover:bg-brand-800",
  secondary:
    "border border-line-strong bg-white text-ink-900 shadow-card hover:border-ink-300 hover:bg-canvas",
  ghost: "text-ink-700 hover:bg-muted hover:text-ink-900",
  inverse: "bg-white text-brand-900 hover:bg-brand-50",
  "inverse-outline":
    "border border-white/20 text-white hover:border-white/40 hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Adds a trailing "forward" arrow that flips with text direction. */
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", withArrow, children, className, ...rest } = props;
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {children}
      {withArrow && <Icon name="arrow" className="size-4 rtl:rotate-180" />}
    </>
  );

  if (typeof rest.href === "string") {
    return (
      <Link className={classes} {...(rest as Omit<ButtonAsLink, keyof CommonProps>)}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
