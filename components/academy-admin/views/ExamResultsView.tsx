"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, BackLink, EmptyState, FilterTabs, PageHeader, StatusPill, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { dash, formatStudents, scoreOf, stateOf } from "@/lib/academy-admin/meta";
import type { Exam, Submission } from "@/lib/academy-admin/types";
import { formatDateTime } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { ExamStateBadge } from "../parts";

export function ExamResultsView({ id }: { id: string }) {
  const { examById, submissionsOf, studentById, studentsIn, courseById } = useAcademy();
  const [filter, setFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [open, setOpen] = useState<{ open: boolean; sub?: Submission }>({ open: false });
  const exam = examById(id);

  if (!exam) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState icon="exam" title="الاختبار غير موجود" action={<Button href={dash.exams} variant="secondary">العودة إلى الاختبارات</Button>} />
      </div>
    );
  }

  const results = submissionsOf(exam.id)
    .map((sub) => ({ sub, student: studentById(sub.studentId), ...scoreOf(exam, sub.answers) }))
    .sort((a, b) => b.percent - a.percent || a.sub.submittedAt.localeCompare(b.sub.submittedAt));
  const rows = results.filter((r) => filter === "ALL" || (filter === "PASSED" ? r.passed : !r.passed));
  const passed = results.filter((r) => r.passed).length;
  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length) : 0;
  const notTaken = studentsIn(exam.courseId).filter((s) => !results.some((r) => r.sub.studentId === s.id)).length;

  // Hardest questions first: lowest share of correct answers.
  const perQuestion = exam.questions
    .map((q, i) => ({ q, n: i + 1, correct: results.filter((r) => r.sub.answers[q.id] === q.correctChoiceId).length }))
    .sort((a, b) => a.correct - b.correct);

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            نتائج: {exam.title}
            <ExamStateBadge state={stateOf(exam)} />
          </span>
        }
        description={`${courseById(exam.courseId)?.title} · النجاح من ${exam.passingScore}%`}
        actions={
          <Button href={dash.exam(exam.id)} variant="secondary">
            <Icon name="edit" className="size-4" />
            الأسئلة والإعدادات
          </Button>
        }
      >
        <BackLink href={dash.exams}>الاختبارات</BackLink>
      </PageHeader>

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card sm:grid-cols-4">
        {[
          { label: "المحاولات", value: results.length, note: notTaken ? `${formatStudents(notTaken)} لم يؤدِّه بعد` : "أدّاه كل الطلاب" },
          { label: "متوسط الدرجات", value: results.length ? `${avg}%` : "—" },
          { label: "نسبة النجاح", value: results.length ? `${Math.round((passed / results.length) * 100)}%` : "—", note: `${passed} ناجح` },
          { label: "أعلى درجة", value: results[0] ? `${results[0].percent}%` : "—", note: results[0]?.student?.name },
        ].map((s) => (
          <div key={s.label} className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-500">{s.label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-ink-950 tabular-nums">{s.value}</dd>
            {s.note && <p className="mt-0.5 truncate text-xs text-ink-500">{s.note}</p>}
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-line bg-white shadow-card">
          {results.length === 0 ? (
            <EmptyState
              icon="exam"
              title="لا توجد محاولات بعد"
              description={stateOf(exam) === "SCHEDULED" ? "الاختبار مجدول ولم يبدأ بعد." : "ستظهر نتائج الطلاب هنا فور تسليمهم الاختبار."}
            />
          ) : (
            <>
              <div className="border-b border-line p-4">
                <FilterTabs
                  label="تصفية النتائج"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "ALL", label: "الكل", count: results.length },
                    { value: "PASSED", label: "ناجح", count: passed },
                    { value: "FAILED", label: "لم ينجح", count: results.length - passed },
                  ]}
                />
              </div>
              <Table className="min-w-[40rem]">
                <thead>
                  <tr>
                    <Th>الطالب</Th>
                    <Th>الدرجة</Th>
                    <Th>النتيجة</Th>
                    <Th>الوقت</Th>
                    <Th>تاريخ التسليم</Th>
                    <Th className="w-28"><span className="sr-only">الإجابات</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <Tr key={r.sub.id}>
                      <Td>
                        {r.student ? (
                          <Link href={dash.student(r.student.id)} className="group flex items-center gap-3">
                            <Avatar name={r.student.name} className="size-8 text-xs" />
                            <span className="font-bold whitespace-nowrap text-ink-950 group-hover:text-brand-700">{r.student.name}</span>
                          </Link>
                        ) : (
                          <span className="text-ink-400">طالب محذوف</span>
                        )}
                      </Td>
                      <Td className="font-semibold text-ink-900 tabular-nums">
                        {r.score}/{r.total} <span className="text-xs font-normal text-ink-500">({r.percent}%)</span>
                      </Td>
                      <Td>
                        <StatusPill tone={r.passed ? "success" : "danger"}>{r.passed ? "ناجح" : "لم ينجح"}</StatusPill>
                      </Td>
                      <Td className="whitespace-nowrap text-ink-600">{r.sub.timeTaken} د</Td>
                      <Td className="whitespace-nowrap text-ink-600">{formatDateTime(r.sub.submittedAt)}</Td>
                      <Td>
                        <Button size="sm" variant="ghost" onClick={() => setOpen({ open: true, sub: r.sub })}>
                          عرض الإجابات
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </div>

        {results.length > 0 && (
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="font-bold text-ink-950">أداء الأسئلة</h2>
            <p className="mt-0.5 text-xs text-ink-500">الأصعب أولاً — نسبة الإجابات الصحيحة.</p>
            <ul className="mt-4 space-y-3">
              {perQuestion.map(({ q, n, correct }) => {
                const pct = Math.round((correct / results.length) * 100);
                return (
                  <li key={q.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-ink-800">
                        <span className="font-bold text-ink-500">س{n}.</span> {q.text}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-ink-600 tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", pct < 50 ? "bg-gold-500" : "bg-brand-500")} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <AnswersModal exam={exam} state={open} onClose={() => setOpen((o) => ({ ...o, open: false }))} />
    </>
  );
}

function AnswersModal({ exam, state, onClose }: { exam: Exam; state: { open: boolean; sub?: Submission }; onClose: () => void }) {
  const { studentById } = useAcademy();
  const sub = state.sub;
  const result = sub && scoreOf(exam, sub.answers);

  return (
    <Modal
      open={state.open}
      onClose={onClose}
      size="lg"
      title={sub ? `إجابات ${studentById(sub.studentId)?.name ?? ""}` : ""}
      description={result ? `${result.score} من ${result.total} (${result.percent}%) · ${result.passed ? "ناجح" : "لم ينجح"}` : undefined}
      footer={<Button variant="secondary" onClick={onClose}>إغلاق</Button>}
    >
      {sub && (
        <ol className="space-y-5">
          {exam.questions.map((q, i) => {
            const chosen = sub.answers[q.id];
            const right = chosen === q.correctChoiceId;
            return (
              <li key={q.id}>
                <p className="flex gap-2 font-semibold text-ink-950">
                  <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white", right ? "bg-brand-600" : "bg-red-500")}>
                    <Icon name={right ? "check" : "x"} className="size-3" strokeWidth={3} />
                  </span>
                  <span>
                    {i + 1}. {q.text}
                  </span>
                </p>
                <ul className="mt-2 space-y-1.5 ps-7">
                  {q.choices.map((c) => {
                    const isCorrect = c.id === q.correctChoiceId;
                    const isChosen = c.id === chosen;
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                          isCorrect ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100" : isChosen ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "text-ink-600",
                        )}
                      >
                        <bdi>{c.text}</bdi>
                        <span className="shrink-0 text-xs font-bold">
                          {isCorrect && isChosen ? "إجابة الطالب ✓" : isCorrect ? "الإجابة الصحيحة" : isChosen ? "إجابة الطالب" : ""}
                        </span>
                      </li>
                    );
                  })}
                  {!chosen && <li className="text-xs text-ink-400">لم يُجب الطالب عن هذا السؤال.</li>}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </Modal>
  );
}
