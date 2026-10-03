import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { academyStatusLabels, academyUrl, formatNumber, ownerStatusLabels } from "@/lib/admin/meta";
import type { AcademyStatus, OwnerStatus, PageMeta } from "@/lib/admin/types";
import { EmptyState, monogram, StatusPill, type PillTone } from "@/components/dashboard/ui";

/** Super Admin–specific identity and status components. Generic pieces live in components/dashboard/ui. */

const academyTone: Record<AcademyStatus, PillTone> = { ACTIVE: "success", INACTIVE: "neutral", SUSPENDED: "danger" };
const ownerTone: Record<OwnerStatus, PillTone> = { ACTIVE: "success", INACTIVE: "warning", SUSPENDED: "danger" };

export const AcademyStatusBadge = ({ status }: { status: AcademyStatus }) => (
  <StatusPill tone={academyTone[status]}>{academyStatusLabels[status]}</StatusPill>
);

export const OwnerStatusBadge = ({ status }: { status: OwnerStatus }) => (
  <StatusPill tone={ownerTone[status]}>{ownerStatusLabels[status]}</StatusPill>
);

export function TemplateTag({ name }: { name: string }) {
  return (
    <span dir="ltr" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium whitespace-nowrap text-ink-700">
      <Icon name="layout" className="size-3.5 text-ink-400" />
      {name}
    </span>
  );
}

/** The academy's logo, or a monogram tile. */
export function AcademyMark({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos are arbitrary remote URLs
      <img src={logoUrl} alt="" className={cn("size-10 shrink-0 rounded-xl object-cover ring-1 ring-line", className)} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-[0.9375rem] font-bold text-brand-700 ring-1 ring-brand-100 ring-inset",
        className,
      )}
    >
      {monogram(name)}
    </span>
  );
}

export function DomainLink({ slug, className }: { slug: string; className?: string }) {
  return (
    <a
      href={`https://${academyUrl(slug)}`}
      target="_blank"
      rel="noreferrer"
      dir="ltr"
      className={cn(
        "group inline-flex items-center gap-1 font-mono text-[0.8125rem] whitespace-nowrap text-ink-600 hover:text-brand-700",
        className,
      )}
    >
      <span className="font-semibold text-ink-900 group-hover:text-brand-700">{slug}</span>
      <span className="text-ink-400">.{academyUrl(slug).slice(slug.length + 1)}</span>
      <Icon name="external" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

/** Table footer: the result count, plus previous / next when there is more than one page. */
export function Pagination({ meta, noun, hrefFor }: { meta: PageMeta; noun: string; hrefFor: (page: number) => string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3 text-xs text-ink-500">
      <p>
        {formatNumber(meta.total)} {noun}
        {meta.totalPages > 1 && ` · صفحة ${meta.page} من ${meta.totalPages}`}
      </p>
      {meta.totalPages > 1 && (
        <div className="flex gap-2">
          {meta.page > 1 ? (
            <Button href={hrefFor(meta.page - 1)} variant="secondary" size="sm" scroll={false}>
              السابق
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled>
              السابق
            </Button>
          )}
          {meta.page < meta.totalPages ? (
            <Button href={hrefFor(meta.page + 1)} variant="secondary" size="sm" scroll={false}>
              التالي
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled>
              التالي
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Placeholder while a page's data is being loaded from the API. */
export function Loading({ className }: { className?: string }) {
  return (
    <div role="status" className={cn("grid place-items-center px-6 py-24 text-sm text-ink-500", className)}>
      <span className="flex items-center gap-3">
        <span className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-brand-600" aria-hidden="true" />
        جارٍ التحميل…
      </span>
    </div>
  );
}

/** Shown in place of a page whose data couldn't be loaded from the API. */
export function LoadError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <EmptyState icon="alert" title="تعذّر تحميل البيانات" description={message} />
    </div>
  );
}
