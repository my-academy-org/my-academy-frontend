import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { cn } from "@/lib/cn";
import { academyUrl, templatePreview } from "@/lib/admin/meta";
import type { TemplateType } from "@/lib/admin/types";
import { templates as marketingTemplates } from "@/lib/site";

/**
 * Scaled-down render of an academy template. Pass `name`/`slug` to preview it
 * with a real academy's identity; otherwise the template's sample academy is used.
 */
export function TemplateThumb({
  type,
  name,
  slug,
  detailed,
  compact,
  className,
}: {
  type: TemplateType;
  name?: string;
  slug?: string;
  detailed?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const previewId = templatePreview[type] ?? "modern";
  const sample = marketingTemplates.find((t) => t.id === previewId)!.sample;
  const academy = { ...sample, name: name || sample.name, subdomain: slug || sample.subdomain };

  return (
    <BrowserFrame url={academyUrl(academy.subdomain)} compact={compact} className={className}>
      <div className={cn(!detailed && "aspect-[16/10] overflow-hidden")}>
        <TemplatePreview template={previewId} academy={academy} detailed={detailed} />
      </div>
    </BrowserFrame>
  );
}
