import Image from "next/image";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/academy/format";
import type { Media } from "@/lib/academy/types";

type Tone = "light" | "paper" | "dark";

const fallbackTones: Record<Tone, string> = {
  light: "bg-[color-mix(in_oklab,var(--accent)_10%,white)] text-[color-mix(in_oklab,var(--accent)_55%,white)]",
  paper: "bg-[color-mix(in_oklab,var(--accent)_8%,#efe7d6)] text-[color-mix(in_oklab,var(--accent)_45%,#efe7d6)]",
  dark: "bg-[color-mix(in_oklab,var(--accent)_12%,#141416)] text-[color-mix(in_oklab,var(--accent)_45%,#141416)]",
};

/**
 * Fills its (relatively positioned) parent with a CMS image, or a branded
 * placeholder when the teacher hasn't uploaded one — so every template
 * still looks finished with text-only content.
 */
export function AcademyImage({
  media,
  label,
  tone = "light",
  sizes = "100vw",
  priority,
  monogram = true,
  className,
}: {
  media?: Media;
  /** Used for alt text and the placeholder monogram. */
  label: string;
  tone?: Tone;
  sizes?: string;
  priority?: boolean;
  /** Hide the placeholder letter (e.g. behind full-bleed hero text). */
  monogram?: boolean;
  className?: string;
}) {
  if (media?.url) {
    return (
      <Image
        src={media.url}
        alt={media.alt ?? label}
        fill
        sizes={sizes}
        priority={priority}
        // Media is served from the tenant's storage; switch to optimized
        // images once the media domain is added to `images.remotePatterns`.
        unoptimized
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("@container absolute inset-0 grid place-items-center overflow-hidden", fallbackTones[tone], className)}
    >
      <svg className="absolute inset-0 size-full opacity-60" aria-hidden="true">
        <defs>
          <pattern id="ma-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="currentColor" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ma-dots)" />
      </svg>
      {monogram && (
        <span className="relative text-[22cqi] leading-none font-extrabold opacity-80">{initials(label)}</span>
      )}
    </div>
  );
}
