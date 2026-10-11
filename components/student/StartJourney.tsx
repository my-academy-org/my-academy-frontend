"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CourseCover } from "./parts";
import { RedeemCodeButton } from "./RedeemCode";
import { useStudent } from "./StudentStore";

const steps: { icon: IconName; title: string; text: string }[] = [
  { icon: "book", title: "اختر دورتك", text: "تصفّح ما تقدّمه الأكاديمية." },
  { icon: "ticket", title: "فعّلها بكودك", text: "الكود الذي أعطاك إياه معلّمك." },
  { icon: "play", title: "شاهد أول درس", text: "تُفتح كل الدروس فور التفعيل." },
];

const waiting = (n: number) => (n === 1 ? "دورة واحدة بانتظارك" : n === 2 ? "دورتان بانتظارك" : n <= 10 ? `${n} دورات بانتظارك` : `${n} دورة بانتظارك`);

/**
 * What a student without a course sees instead of an empty page: the way in,
 * as three steps, and the academy's courses waiting at the end of `browseHref`
 * — each activated from its own card. Only when the academy has nothing to
 * pick from is the code asked for here.
 */
export function StartJourney({ browseHref }: { browseHref: string }) {
  const { available, academy } = useStudent();

  return (
    <section
      aria-labelledby="start-journey"
      className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-700),var(--color-brand-900)_55%,var(--color-ink-950))] px-6 py-10 text-white shadow-lift sm:px-10 sm:py-12"
    >
      <div className="absolute -end-16 -top-20 -z-10 size-64 rounded-full bg-white/5" aria-hidden="true" />
      <div className="absolute -start-10 -bottom-24 -z-10 size-56 rounded-full bg-white/5" aria-hidden="true" />

      <p className="text-sm font-bold text-white/70">{academy.name}</p>
      <h2 id="start-journey" className="mt-2 text-2xl leading-snug font-extrabold sm:text-3xl">
        ثلاث خطوات تفصلك عن درسك الأول
      </h2>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="relative rounded-2xl bg-white/8 p-5 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="absolute end-4 top-3 text-4xl font-extrabold text-white/10 tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-700">
              <Icon name={step.icon} className="size-5" />
            </span>
            <p className="mt-4 font-bold">{step.title}</p>
            <p className="mt-1 text-sm leading-6 text-white/65">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
        {available.length > 0 ? (
          <>
            <Link
              href={browseHref}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-brand-800 shadow-lift transition-transform hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              اختر دورتك
              <Icon name="arrow" className="size-4 rtl:rotate-180" />
            </Link>
            <span className="flex items-center gap-3">
              <span className="flex -space-x-3 rtl:space-x-reverse" aria-hidden="true">
                {available.slice(0, 3).map((course) => (
                  <CourseCover key={course.id} course={course} className="aspect-square w-10 rounded-full ring-2 ring-brand-900" />
                ))}
              </span>
              <span className="text-sm text-white/75">{waiting(available.length)}</span>
            </span>
          </>
        ) : (
          <RedeemCodeButton />
        )}
      </div>
    </section>
  );
}
