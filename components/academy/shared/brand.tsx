import Image from "next/image";
import { cn } from "@/lib/cn";
import { ROOT_DOMAIN } from "@/lib/academy/config";
import { initials } from "@/lib/academy/format";
import type { AcademySite } from "@/lib/academy/types";

/** Academy logo, or a monogram in the accent colour when no logo is uploaded. */
export function AcademyMark({ site, className }: { site: AcademySite; className?: string }) {
  const { logo } = site.academy;
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden", className)}>
      {logo?.url ? (
        <Image src={logo.url} alt={logo.alt ?? site.tenant.name} fill sizes="48px" unoptimized className="object-contain" />
      ) : (
        <span aria-hidden="true">{initials(site.landing.teacher.name) || initials(site.tenant.name)}</span>
      )}
    </span>
  );
}

/** Small attribution that ties every academy back to the platform. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <a
      href={`https://${ROOT_DOMAIN}`}
      target="_blank"
      rel="noopener"
      className={cn("inline-flex items-center gap-1.5 transition-opacity hover:opacity-100", className)}
    >
      تعمل بواسطة
      <span dir="ltr" className="font-bold">
        My Academy
      </span>
    </a>
  );
}

export const currentYear = () => new Date().getFullYear();
