import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * Exclusive accordion on native <details name="…">: works without JS,
 * is keyboard accessible, and only one item stays open per group.
 */
export function Accordion({
  items,
  group,
  defaultOpen = 0,
  className,
}: {
  items: { question: string; answer: ReactNode }[];
  group: string;
  defaultOpen?: number | null;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-line border-t border-ink-900 border-b border-b-line", className)}>
      {items.map((item, i) => (
        <details key={item.question} name={group} open={i === defaultOpen} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-start text-base font-bold text-ink-900 transition-colors hover:text-brand-700 sm:py-6 sm:text-[1.0625rem]">
            {item.question}
            <Icon
              name="plus"
              className="size-5 shrink-0 text-ink-400 transition-[transform,color] duration-300 group-open:rotate-45 group-open:text-brand-700"
            />
          </summary>
          <div className="-mt-1 pb-6 text-[0.9375rem] leading-8 text-ink-600 sm:pe-16">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
