import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, IconTile } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Feature } from "@/lib/site";

/** Feature card. Pass `children` to render a visual above the copy. */
export function FeatureCard({
  feature,
  className,
  children,
}: {
  feature: Feature;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Card interactive className={cn("flex flex-col overflow-hidden", className)}>
      {children && (
        <div className="relative flex min-h-48 flex-1 items-center justify-center border-b border-line bg-canvas p-6">
          {children}
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <IconTile>
            <Icon name={feature.icon} />
          </IconTile>
          {feature.pro && <Badge tone="gold">Pro</Badge>}
        </div>
        <h3 className="mt-5 text-lg font-bold text-ink-950">{feature.title}</h3>
        <p className="mt-2 text-[0.9375rem] leading-7 text-ink-600">{feature.body}</p>
      </div>
    </Card>
  );
}
