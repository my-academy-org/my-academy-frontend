import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border border-line-strong bg-white px-3.5 text-[0.9375rem] text-ink-900 shadow-card outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 disabled:cursor-not-allowed disabled:bg-muted aria-invalid:border-red-400 aria-invalid:focus:ring-red-500/12";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-800">
        {label}
        {optional && <span className="ms-1 font-normal text-ink-400">(اختياري)</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs leading-5 text-ink-500">{hint}</p>
      )}
    </div>
  );
}

export function Input({
  className,
  suffix,
  ...props
}: ComponentProps<"input"> & { suffix?: string }) {
  if (!suffix) return <input className={cn(control, "h-11", className)} {...props} />;

  // Suffixed inputs (e.g. subdomains) are always LTR so ".myacademy.com" sits after the value.
  return (
    <div
      dir="ltr"
      className="flex h-11 overflow-hidden rounded-xl border border-line-strong bg-white shadow-card transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/12 hover:border-ink-300"
    >
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent px-3.5 text-[0.9375rem] text-ink-900 outline-none placeholder:text-ink-400",
          className,
        )}
        {...props}
      />
      <span className="flex items-center border-s border-line bg-canvas px-3 text-sm text-ink-500">
        {suffix}
      </span>
    </div>
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-11 appearance-none pe-10", className)} {...props}>
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 resize-y py-3 leading-7", className)} {...props} />;
}
