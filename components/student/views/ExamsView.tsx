"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatQuestions } from "@/lib/academy-admin/meta";
import { academyRoutes } from "@/lib/academy/nav";
import { formatDate, formatDateTime } from "@/lib/format";
import type { StudentExam } from "@/lib/student/types";
import { ExamPill, ResultPill } from "../parts";
import { useStudent, type StudentExamState } from "../StudentStore";

const r = academyRoutes.student;

export function ExamsView() {
  const { exams, examStateOf } = useStudent();
  const by = (s: StudentExamState) => exams.filter((e) => examStateOf(e) === s);
  const available = by("AVAILABLE");
  const upcoming = by("UPCOMING").sort((a, b) => (a.opensAt ?? "").localeCompare(b.opensAt ?? ""));
  const completed = by("COMPLETED");
  const missed = by("MISSED");

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink-950">الاختبارات</h1>
        <p className="mt-1.5 text-ink-500">اختبارات دوراتك. تُصحَّح تلقائياً وتظهر نتيجتك فور التسليم.</p>
      </header>

      {exams.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line-strong bg-white px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name="exam" className="size-6" />
          </span>
          <p className="mt-5 text-lg font-bold text-ink-950">لا توجد اختبارات بعد</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-500">عندما يضيف معلّمك اختباراً لإحدى دوراتك سيظهر هنا.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <Group title="متاحة الآن" count={available.length} empty="لا توجد اختبارات متاحة حالياً.">
            {available.map((e) => (
              <ExamCard key={e.id} exam={e} state="AVAILABLE" highlight />
            ))}
          </Group>
          {upcoming.length > 0 && (
            <Group title="قادمة" count={upcoming.length}>
              {upcoming.map((e) => (
                <ExamCard key={e.id} exam={e} state="UPCOMING" />
              ))}
            </Group>
          )}
          {completed.length > 0 && (
            <Group title="مكتملة" count={completed.length}>
              {completed.map((e) => (
                <ExamCard key={e.id} exam={e} state="COMPLETED" />
              ))}
            </Group>
          )}
          {missed.length > 0 && (
            <Group title="انتهت دون أن تؤدّيها" count={missed.length}>
              {missed.map((e) => (
                <ExamCard key={e.id} exam={e} state="MISSED" />
              ))}
            </Group>
          )}
        </div>
      )}
    </>
  );
}

function Group({ title, count, empty, children }: { title: string; count: number; empty?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink-950">
        {title}
        <span className="text-sm font-semibold text-ink-400 tabular-nums">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="rounded-2xl border border-line bg-white px-6 py-8 text-center text-sm text-ink-500">{empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

function ExamCard({ exam, state, highlight }: { exam: StudentExam; state: StudentExamState; highlight?: boolean }) {
  const { courseById, resultOf } = useStudent();
  const result = state === "COMPLETED" ? resultOf(exam) : undefined;

  return (
    <article className={highlight ? "rounded-2xl border border-brand-200 bg-white p-5 shadow-lift ring-4 ring-brand-500/8" : "rounded-2xl border border-line bg-white p-5 shadow-card"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold leading-7 text-ink-950">{exam.title}</h3>
          <p className="mt-0.5 truncate text-sm text-ink-500">{courseById(exam.courseId)?.title}</p>
        </div>
        {result ? <ResultPill passed={result.passed} /> : <ExamPill state={state} />}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-600">
        <Fact icon="clock">{exam.durationMinutes} دقيقة</Fact>
        <Fact icon="exam">{formatQuestions(exam.questions.length)}</Fact>
        <Fact icon="check">النجاح من {exam.passingScore}%</Fact>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        {state === "AVAILABLE" && (
          <>
            <span className="text-sm text-ink-500">محاولة واحدة</span>
            <Button href={r.exam(exam.id)} size="sm">
              ابدأ الاختبار
            </Button>
          </>
        )}
        {state === "UPCOMING" && (
          <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Icon name="calendar" className="size-4 text-ink-400" />
            يبدأ {formatDateTime(exam.opensAt!)}
          </span>
        )}
        {state === "COMPLETED" && result && (
          <>
            <span className="text-sm text-ink-600">
              درجتك <b className="text-ink-950 tabular-nums">{result.percent}%</b> · {formatDate(result.attempt.submittedAt)}
            </span>
            <Link href={r.exam(exam.id)} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              عرض النتيجة
            </Link>
          </>
        )}
        {state === "MISSED" && <span className="text-sm text-ink-500">أُغلق الاختبار. تواصل مع معلّمك إن احتجت فرصة أخرى.</span>}
      </div>
    </article>
  );
}

function Fact({ icon, children }: { icon: "clock" | "exam" | "check"; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} className="size-4 text-ink-400" />
      <span>{children}</span>
    </div>
  );
}
