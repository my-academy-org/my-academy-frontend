import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Building blocks shared by every dashboard (Super Admin and Academy Admin):
 * page header, panels, tables, status pills, empty states and form controls.
 */

/* ------------------------------------------------------------------ */
/* Page structure                                                      */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Rendered above the title (e.g. a back link). */
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {children}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight text-ink-950">{title}</h1>
          {description && <p className="mt-2 max-w-2xl leading-7 text-ink-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** A titled surface. Used sparingly — most content sits directly on the canvas. */
export function Panel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>
      {title && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-bold text-ink-950">{title}</h2>
            {description && <p className="mt-0.5 text-sm leading-6 text-ink-500">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-3 rounded-[1.4rem] border border-dashed border-line-strong" aria-hidden="true" />
        <div className="grid size-14 place-items-center rounded-2xl bg-canvas text-ink-500 ring-1 ring-line">
          <Icon name={icon} className="size-6" />
        </div>
      </div>
      <p className="text-base font-bold text-ink-950">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

export function Table({ className, children, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-start text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "h-11 border-b border-line bg-canvas/70 px-4 text-start text-xs font-semibold whitespace-nowrap text-ink-500 first:ps-6 last:pe-6",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("h-[4.25rem] px-4 align-middle first:ps-6 last:pe-6", className)} {...props} />;
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("border-b border-line transition-colors last:border-0 hover:bg-canvas/60", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/* Status and identity                                                 */
/* ------------------------------------------------------------------ */

export type PillTone = "success" | "neutral" | "warning" | "danger" | "info";

const pillTones: Record<PillTone, string> = {
  success: "bg-brand-50 text-brand-700 ring-brand-100",
  neutral: "bg-muted text-ink-600 ring-line-strong/60",
  warning: "bg-gold-50 text-gold-600 ring-gold-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
  info: "bg-sky-50 text-sky-700 ring-sky-100",
};

/** Status label with a leading dot. */
export function StatusPill({ tone, children, dot = true }: { tone: PillTone; children: ReactNode; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs leading-5 font-semibold whitespace-nowrap ring-1 ring-inset",
        pillTones[tone],
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** First letter of a name, skipping titles such as "أ." and "د.". */
export function monogram(name: string) {
  const words = name.replace(/^((أكاديمية|أ\.|م\.|د\.)\s*)+/, "").trim().split(/\s+/);
  return words[0]?.[0] ?? name[0] ?? "";
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white",
        className,
      )}
    >
      {monogram(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand-600" : "bg-ink-300",
      )}
    >
      <span
        className={cn(
          "size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform",
          checked ? "-translate-x-5 ltr:translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Icon name="search" className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-xl border border-line-strong bg-white ps-10 pe-3.5 text-sm text-ink-900 shadow-card outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12"
      />
    </div>
  );
}

/** Segmented status filter with counts. */
export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count: number }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors",
            value === o.value ? "bg-white text-ink-950 shadow-card" : "text-ink-500 hover:text-ink-900",
          )}
        >
          {o.label}
          <span className={cn("text-xs tabular-nums", value === o.value ? "text-ink-500" : "text-ink-400")}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}

/** Label / value row for detail pages. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="min-w-0 text-[0.9375rem] text-ink-900">{children}</dd>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
    >
      <Icon name="arrow" className="size-4 ltr:rotate-180" />
      {children}
    </Link>
  );
}

export function Notice({
  tone,
  className,
  children,
}: {
  tone: "info" | "warning";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl px-4 py-3 text-sm leading-6",
        tone === "info" ? "bg-canvas text-ink-600 ring-1 ring-line" : "bg-gold-50 text-gold-600 ring-1 ring-gold-100",
        className,
      )}
    >
      <Icon name={tone === "info" ? "info" : "alert"} className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

/** Underlined tabs for switching views inside a page. */
export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: { value: T; label: ReactNode; count?: number }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex gap-6 overflow-x-auto border-b border-line", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px flex h-11 items-center gap-2 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors",
            value === t.value ? "border-brand-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-900",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="text-xs text-ink-400 tabular-nums">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
