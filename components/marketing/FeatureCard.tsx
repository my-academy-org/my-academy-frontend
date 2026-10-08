import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { Feature } from "@/lib/site";

/** Feature panel: a product visual (`children`) above the copy. */
export function FeatureCard({
  feature,
  className,
  delay,
  children,
}: {
  feature: Feature;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} className={cn("flex flex-col rounded-2xl bg-canvas ring-1 ring-inset ring-line", className)}>
      <div className="flex min-h-52 flex-1 items-center justify-center px-6 pt-8 pb-2">{children}</div>
      <div className="p-6 sm:p-7">
        <h3 className="text-lg font-bold text-ink-950">{feature.title}</h3>
        <p className="mt-2 text-[0.9375rem] leading-7 text-ink-600">{feature.body}</p>
      </div>
    </Reveal>
  );
}

/** Compact feature entry for the secondary list. */
export function FeatureLine({ feature, delay }: { feature: Feature; delay?: number }) {
  return (
    <Reveal as="li" delay={delay} className="border-t border-line-strong pt-5">
      <div className="flex items-center justify-between gap-3">
        <Icon name={feature.icon} className="size-5 text-brand-700" />
        {feature.pro && <Badge tone="gold">Pro</Badge>}
      </div>
      <h3 className="mt-4 font-bold text-ink-950">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-7 text-ink-600">{feature.body}</p>
    </Reveal>
  );
}
