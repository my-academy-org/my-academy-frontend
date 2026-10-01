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
    <div className={cn("divide-y divide-line rounded-2xl border border-line bg-white shadow-card", className)}>
      {items.map((item, i) => (
        <details key={item.question} name={group} open={i === defaultOpen} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-start text-base font-bold text-ink-900 transition-colors hover:text-brand-700 sm:px-7 sm:text-[1.0625rem]">
            {item.question}
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-500 transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:border-brand-200 group-open:bg-brand-50 group-open:text-brand-700">
              <Icon name="plus" className="size-4" />
            </span>
          </summary>
          <div className="-mt-1 px-5 pb-6 text-[0.9375rem] leading-8 text-ink-600 sm:px-7 sm:pe-20">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
