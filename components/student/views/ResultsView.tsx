"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { academyRoutes } from "@/lib/academy/nav";
import { formatDate } from "@/lib/format";
import { ResultPill } from "../parts";
import { useStudent } from "../StudentStore";

const r = academyRoutes.student;

export function ResultsView() {
  const { exams, resultOf, courseById } = useStudent();
  const results = exams
    .map((exam) => ({ exam, result: resultOf(exam) }))
    .filter((x) => x.result !== undefined)
    .map((x) => ({ exam: x.exam, ...x.result! }))
    .sort((a, b) => b.attempt.submittedAt.localeCompare(a.attempt.submittedAt));

  const passed = results.filter((x) => x.passed).length;
  const avg = results.length ? Math.round(results.reduce((s, x) => s + x.percent, 0) / results.length) : 0;

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink-950">النتائج</h1>
        <p className="mt-1.5 text-ink-500">درجاتك في الاختبارات التي أدّيتها.</p>
      </header>

      {results.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name="progress" className="size-6" />
          </span>
          <p className="mt-5 text-lg font-bold text-ink-950">لا توجد نتائج بعد</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-500">ستظهر نتيجتك هنا فور تسليم أول اختبار.</p>
          <Button href={r.exams} variant="secondary" className="mt-6">
            الاختبارات المتاحة
          </Button>
        </div>
      ) : (
        <>
          <dl className="mb-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card">
            {[
              { label: "اختبارات مكتملة", value: results.length },
              { label: "متوسط درجاتك", value: `${avg}%` },
              { label: "ناجح", value: `${passed} من ${results.length}` },
            ].map((s) => (
              <div key={s.label} className="bg-white px-4 py-4 sm:px-6 sm:py-5">
                <dt className="text-xs text-ink-500 sm:text-sm">{s.label}</dt>
                <dd className="mt-1 text-xl font-extrabold text-ink-950 tabular-nums sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {results.map(({ exam, percent, score, total, passed: ok, attempt }) => (
              <li key={exam.id}>
                <Link href={r.exam(exam.id)} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-canvas/70 sm:px-6">
                  <span
                    className={
                      ok
                        ? "grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700 tabular-nums"
                        : "grid size-12 shrink-0 place-items-center rounded-xl bg-red-50 text-sm font-extrabold text-red-700 tabular-nums"
                    }
                  >
                    {percent}%
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-950">{exam.title}</p>
                    <p className="mt-0.5 truncate text-sm text-ink-500">
                      {courseById(exam.courseId)?.title} · {formatDate(attempt.submittedAt)}
                    </p>
                  </div>
                  <div className="hidden text-end sm:block">
                    <p className="text-sm font-semibold text-ink-900 tabular-nums">
                      {score} / {total}
                    </p>
                  </div>
                  <ResultPill passed={ok} />
                  <Icon name="chevron-side" className="hidden size-4 text-ink-300 sm:block rtl:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
