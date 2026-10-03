"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatQuestions } from "@/lib/academy-admin/meta";
import { academyRoutes } from "@/lib/academy/nav";
import { formatDateTime } from "@/lib/format";
import type { StudentExam } from "@/lib/student/types";
import { ProgressRing, ResultPill } from "../parts";
import { useStudent } from "../StudentStore";

const r = academyRoutes.student;
const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];

export function ExamTakeView({ examId }: { examId: string }) {
  const { exams, examStateOf, courseById } = useStudent();
  const exam = exams.find((e) => e.id === examId);
  const [phase, setPhase] = useState<"intro" | "taking">("intro");
  const [startedAt, setStartedAt] = useState(0);

  if (!exam) {
    return (
      <Frame>
        <Centered title="الاختبار غير متاح" text="ربما أُزيل الاختبار أو أنه ليس ضمن دوراتك.">
          <Button href={r.exams} variant="secondary">العودة إلى الاختبارات</Button>
        </Centered>
      </Frame>
    );
  }

  const state = examStateOf(exam);
  const course = courseById(exam.courseId);

  if (state === "COMPLETED") return <Frame title={exam.title}><ResultScreen exam={exam} /></Frame>;
  if (state === "UPCOMING") {
    return (
      <Frame title={exam.title}>
        <Centered icon="calendar" title="لم يبدأ الاختبار بعد" text={`يبدأ ${formatDateTime(exam.opensAt!)}. سيظهر لك زر البدء في موعده.`}>
          <Button href={r.exams} variant="secondary">العودة إلى الاختبارات</Button>
        </Centered>
      </Frame>
    );
  }
  if (state === "MISSED") {
    return (
      <Frame title={exam.title}>
        <Centered icon="lock" title="أُغلق هذا الاختبار" text="انتهت فترة الاختبار. تواصل مع معلّمك إن احتجت فرصة أخرى.">
          <Button href={r.exams} variant="secondary">العودة إلى الاختبارات</Button>
        </Centered>
      </Frame>
    );
  }

  if (phase === "taking") return <Taking exam={exam} startedAt={startedAt} />;

  return (
    <Frame title={exam.title}>
      <div className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-semibold text-brand-700">{course?.title}</p>
        <h1 className="mt-2 text-[1.75rem] leading-snug font-extrabold text-ink-950">{exam.title}</h1>
        {exam.description && <p className="mt-3 leading-8 text-ink-600">{exam.description}</p>}

        <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            { label: "المدة", value: `${exam.durationMinutes} دقيقة` },
            { label: "الأسئلة", value: formatQuestions(exam.questions.length) },
            { label: "درجة النجاح", value: `${exam.passingScore}%` },
          ].map((s) => (
            <div key={s.label} className="bg-white px-4 py-4 text-center">
              <dt className="text-xs text-ink-500">{s.label}</dt>
              <dd className="mt-1 font-bold text-ink-950">{s.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-8 space-y-3 text-sm leading-6 text-ink-600">
          {[
            "لديك محاولة واحدة فقط، والوقت يبدأ لحظة الضغط على «ابدأ الآن».",
            "يمكنك التنقّل بين الأسئلة وتغيير إجاباتك قبل التسليم.",
            "يُسلَّم الاختبار تلقائياً عند انتهاء الوقت.",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Icon name="check" className="mt-1 size-4 shrink-0 text-brand-600" strokeWidth={2.5} />
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => {
              setStartedAt(Date.now());
              setPhase("taking");
            }}
          >
            ابدأ الآن
          </Button>
          <Button href={r.exams} variant="ghost" size="lg">
            لاحقاً
          </Button>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */

function Taking({ exam, startedAt }: { exam: StudentExam; startedAt: number }) {
  const { submitExam } = useStudent();
  const { confirm, dialog } = useConfirm();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(startedAt);
  const submitted = useRef(false);

  const endsAt = startedAt + exam.durationMinutes * 60_000;
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const question = exam.questions[index];
  const answered = exam.questions.filter((q) => answers[q.id]).length;

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    submitExam(exam, answers, Math.max(1, Math.round((Date.now() - startedAt) / 60_000)));
  };

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Time's up: hand in what's there.
  useEffect(() => {
    if (remaining === 0) submit();
  });

  // Warn before leaving mid-exam.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const askSubmit = () => {
    const missing = exam.questions.length - answered;
    confirm({
      title: "تسليم الاختبار",
      description: missing ? `لم تُجب عن ${formatQuestions(missing)}. هل تريد التسليم على أي حال؟` : "أجبت عن كل الأسئلة. لن تتمكّن من تغيير إجاباتك بعد التسليم.",
      confirmLabel: "تسليم",
      tone: missing ? "danger" : undefined,
      onConfirm: submit,
    });
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-950">{exam.title}</p>
            <p className="text-xs text-ink-500">
              أجبت عن {answered} من {exam.questions.length}
            </p>
          </div>
          <span
            role="timer"
            aria-label="الوقت المتبقي"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold tabular-nums",
              remaining <= 60 ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-muted text-ink-800",
            )}
          >
            <Icon name="clock" className="size-4" />
            <bdi>
              {mm}:{ss}
            </bdi>
          </span>
          <Button size="sm" onClick={askSubmit}>
            تسليم
          </Button>
        </div>
        <div className="h-0.5 bg-line">
          <div className="h-full bg-brand-500 transition-[width]" style={{ width: `${((index + 1) / exam.questions.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        <p className="text-sm font-semibold text-brand-700">
          السؤال {index + 1} من {exam.questions.length}
        </p>
        <h1 className="mt-3 text-xl leading-9 font-bold text-ink-950 sm:text-2xl sm:leading-10">
          <bdi>{question.text}</bdi>
        </h1>

        <div role="radiogroup" aria-label="الخيارات" className="mt-8 space-y-3">
          {question.choices.map((c, i) => {
            const selected = answers[question.id] === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: c.id }))}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-4 text-start transition-[border-color,box-shadow]",
                  selected ? "border-brand-500 ring-4 ring-brand-500/12" : "border-line hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                    selected ? "bg-brand-600 text-white" : "bg-canvas text-ink-500 ring-1 ring-line",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <bdi className="text-[0.9375rem] text-ink-900">{c.text}</bdi>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button variant="ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            <Icon name="chevron-side" className="size-4 ltr:rotate-180" />
            السابق
          </Button>
          {index < exam.questions.length - 1 ? (
            <Button variant="secondary" onClick={() => setIndex((i) => i + 1)}>
              التالي
              <Icon name="chevron-side" className="size-4 rtl:rotate-180" />
            </Button>
          ) : (
            <Button onClick={askSubmit}>تسليم الاختبار</Button>
          )}
        </div>

        <nav aria-label="الانتقال إلى سؤال" className="mt-10 flex flex-wrap justify-center gap-2 border-t border-line pt-6">
          {exam.questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`السؤال ${i + 1}${answers[q.id] ? " (تمت الإجابة)" : ""}`}
              aria-current={i === index ? "step" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-xl text-sm font-bold tabular-nums transition-colors",
                i === index ? "bg-ink-950 text-white" : answers[q.id] ? "bg-brand-100 text-brand-800" : "bg-white text-ink-500 ring-1 ring-line hover:ring-line-strong",
              )}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </main>
      {dialog}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ResultScreen({ exam }: { exam: StudentExam }) {
  const { resultOf, courseById } = useStudent();
  const result = resultOf(exam)!;
  const [review, setReview] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-lift">
        <div className="flex justify-center">
          <ProgressRing value={result.percent} size={132} stroke={10}>
            <span>
              <span className="block text-3xl font-extrabold text-ink-950 tabular-nums">{result.percent}%</span>
              <span className="block text-xs text-ink-500 tabular-nums">
                {result.score} من {result.total}
              </span>
            </span>
          </ProgressRing>
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-ink-950">{result.passed ? "أحسنت، لقد نجحت!" : "لم تبلغ درجة النجاح هذه المرة"}</h1>
        <p className="mt-2 text-ink-500">{courseById(exam.courseId)?.title}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink-600">
          <ResultPill passed={result.passed} />
          <span>النجاح من {exam.passingScore}%</span>
          <span>استغرقت {result.attempt.timeTaken} دقيقة</span>
          <span>{formatDateTime(result.attempt.submittedAt)}</span>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => setReview((v) => !v)}>
            {review ? "إخفاء الإجابات" : "مراجعة إجاباتي"}
          </Button>
          <Button href={r.results}>كل النتائج</Button>
        </div>
      </div>

      {review && (
        <ol className="mt-8 space-y-4">
          {exam.questions.map((q, i) => {
            const chosen = result.attempt.answers[q.id];
            const right = chosen === q.correctChoiceId;
            return (
              <li key={q.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <p className="flex gap-3 font-semibold leading-7 text-ink-950">
                  <span className={cn("mt-1 grid size-5 shrink-0 place-items-center rounded-full text-white", right ? "bg-brand-600" : "bg-red-500")}>
                    <Icon name={right ? "check" : "x"} className="size-3" strokeWidth={3} />
                  </span>
                  <bdi>
                    {i + 1}. {q.text}
                  </bdi>
                </p>
                <ul className="mt-3 space-y-1.5 ps-8 text-sm">
                  {q.choices.map((c) => {
                    const isCorrect = c.id === q.correctChoiceId;
                    const isChosen = c.id === chosen;
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg px-3 py-2",
                          isCorrect ? "bg-brand-50 font-semibold text-brand-800" : isChosen ? "bg-red-50 text-red-700" : "text-ink-600",
                        )}
                      >
                        <bdi>{c.text}</bdi>
                        <span className="shrink-0 text-xs">{isCorrect ? "الإجابة الصحيحة" : isChosen ? "إجابتك" : ""}</span>
                      </li>
                    );
                  })}
                  {!chosen && <li className="px-3 text-xs text-ink-400">لم تُجب عن هذا السؤال.</li>}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Frame({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link href={r.exams} aria-label="العودة إلى الاختبارات" className="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-muted">
            <Icon name="arrow" className="size-5 ltr:rotate-180" />
          </Link>
          <p className="truncate text-sm font-bold text-ink-950">{title ?? "الاختبارات"}</p>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function Centered({ icon = "exam", title, text, children }: { icon?: "exam" | "calendar" | "lock"; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon name={icon} className="size-6" />
      </span>
      <h1 className="mt-5 text-xl font-extrabold text-ink-950">{title}</h1>
      <p className="mt-2 leading-7 text-ink-500">{text}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
