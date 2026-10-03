"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { BackLink, EmptyState, Notice, PageHeader, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { dash, formatQuestions, stateOf } from "@/lib/academy-admin/meta";
import type { Exam, ExamStatus, Question } from "@/lib/academy-admin/types";
import { fromZonedInput, toZonedInput } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { ExamStateBadge } from "../parts";
import { useExamActions } from "../useExamActions";

const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];
const MAX_CHOICES = 6;

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${++seq}`;

function blankQuestion(): Question {
  const choices = [0, 1, 2, 3].map(() => ({ id: uid("c"), text: "" }));
  return { id: uid("q"), text: "", choices, correctChoiceId: "", points: 1 };
}

type Settings = Pick<Exam, "title" | "description" | "courseId" | "durationMinutes" | "passingScore"> & { opensAt: string };

/** Problems that block publishing, keyed by question id ("settings" for the form). */
function validate(settings: Settings, questions: Question[]) {
  const issues: { id: string; message: string }[] = [];
  if (settings.title.trim().length < 3) issues.push({ id: "settings", message: "أدخل عنوان الاختبار" });
  if (!settings.courseId) issues.push({ id: "settings", message: "اختر الدورة" });
  if (!(settings.durationMinutes > 0)) issues.push({ id: "settings", message: "أدخل مدة الاختبار" });
  if (questions.length === 0) issues.push({ id: "questions", message: "أضف سؤالاً واحداً على الأقل" });
  questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.text.trim()) issues.push({ id: q.id, message: `السؤال ${n}: اكتب نص السؤال` });
    if (q.choices.filter((c) => c.text.trim()).length < 2) issues.push({ id: q.id, message: `السؤال ${n}: أضف خيارين على الأقل` });
    const correct = q.choices.find((c) => c.id === q.correctChoiceId);
    if (!correct || !correct.text.trim()) issues.push({ id: q.id, message: `السؤال ${n}: حدّد الإجابة الصحيحة` });
  });
  return issues;
}

export function ExamBuilderView({ id }: { id?: string }) {
  const router = useRouter();
  const { courses, examById, createExam, updateExam, submissionsOf, notify } = useAcademy();
  const exam = id ? examById(id) : undefined;
  const { menuItems, dialog } = useExamActions({ onDeleted: () => router.push(dash.exams) });

  const [settings, setSettings] = useState<Settings>(() => ({
    title: exam?.title ?? "",
    description: exam?.description ?? "",
    courseId: exam?.courseId ?? courses.find((c) => c.status === "PUBLISHED")?.id ?? courses[0]?.id ?? "",
    durationMinutes: exam?.durationMinutes ?? 30,
    passingScore: exam?.passingScore ?? 60,
    opensAt: toZonedInput(exam?.opensAt),
  }));
  const [questions, setQuestions] = useState<Question[]>(() => exam?.questions ?? [blankQuestion()]);
  const [showIssues, setShowIssues] = useState(false);

  if (id && !exam) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState icon="exam" title="الاختبار غير موجود" action={<Button href={dash.exams} variant="secondary">العودة إلى الاختبارات</Button>} />
      </div>
    );
  }

  const issues = validate(settings, questions);
  const issueFor = (qid: string) => (showIssues ? issues.filter((x) => x.id === qid) : []);
  const submissions = exam ? submissionsOf(exam.id).length : 0;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const setQ = (qid: string, patch: Partial<Question>) => setQuestions((list) => list.map((q) => (q.id === qid ? { ...q, ...patch } : q)));

  const save = (status?: ExamStatus) => {
    // Drafts can be saved incomplete; anything students can see must be valid.
    const willBeLive = (status ?? exam?.status) !== "DRAFT";
    if (willBeLive && issues.length) {
      setShowIssues(true);
      notify("أكمل الأسئلة قبل النشر", "error");
      return;
    }
    if (!settings.title.trim()) {
      setShowIssues(true);
      notify("أدخل عنوان الاختبار", "error");
      return;
    }
    const input = {
      title: settings.title.trim(),
      description: settings.description.trim(),
      courseId: settings.courseId,
      durationMinutes: settings.durationMinutes,
      passingScore: settings.passingScore,
      opensAt: fromZonedInput(settings.opensAt),
      status: status ?? exam?.status ?? "DRAFT",
      questions: questions.map((q) => ({ ...q, choices: q.choices.filter((c) => c.text.trim()) })),
    };
    if (exam) {
      updateExam(exam.id, input);
      notify("تم حفظ الاختبار");
    } else {
      const created = createExam(input);
      notify(status === "PUBLISHED" ? "تم إنشاء الاختبار ونشره" : "تم حفظ الاختبار كمسودة");
      router.replace(dash.exam(created.id));
    }
  };

  return (
    <>
      <PageHeader
        title={
          exam ? (
            <span className="flex flex-wrap items-center gap-3">
              {exam.title}
              <ExamStateBadge state={stateOf(exam)} />
            </span>
          ) : (
            "اختبار جديد"
          )
        }
        description={exam ? undefined : "اكتب الأسئلة واختر الإجابة الصحيحة لكل سؤال. يُصحَّح الاختبار تلقائياً."}
        actions={
          exam && (
            <>
              {exam.status !== "DRAFT" && (
                <Button href={dash.examResults(exam.id)} variant="secondary">
                  <Icon name="progress" className="size-4" />
                  النتائج ({submissions})
                </Button>
              )}
            </>
          )
        }
      >
        <BackLink href={dash.exams}>الاختبارات</BackLink>
      </PageHeader>

      {submissions > 0 && (
        <Notice tone="warning" className="mb-6">
          لهذا الاختبار {submissions} محاولة من الطلاب. تعديل الإجابات الصحيحة أو الدرجات يعيد احتساب نتائجهم تلقائياً.
        </Notice>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Panel title="إعدادات الاختبار">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="عنوان الاختبار" htmlFor="x-title" className="sm:col-span-2" error={showIssues && !settings.title.trim() ? "أدخل عنوان الاختبار" : undefined}>
                <Input id="x-title" value={settings.title} onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))} placeholder="مثال: اختبار الوحدة الأولى" />
              </Field>
              <Field label="تعليمات للطالب" htmlFor="x-desc" optional className="sm:col-span-2">
                <Textarea id="x-desc" rows={2} value={settings.description} onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))} />
              </Field>
              <Field label="الدورة" htmlFor="x-course">
                <Select id="x-course" value={settings.courseId} onChange={(e) => setSettings((s) => ({ ...s, courseId: e.target.value }))}>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="يبدأ في" htmlFor="x-opens" optional hint="اتركه فارغاً ليصبح متاحاً فور النشر.">
                <Input id="x-opens" type="datetime-local" dir="ltr" className="text-start" value={settings.opensAt} onChange={(e) => setSettings((s) => ({ ...s, opensAt: e.target.value }))} />
              </Field>
              <Field label="المدة (دقيقة)" htmlFor="x-duration">
                <Input id="x-duration" type="number" min={1} inputMode="numeric" value={settings.durationMinutes || ""} onChange={(e) => setSettings((s) => ({ ...s, durationMinutes: Number(e.target.value) }))} />
              </Field>
              <Field label="درجة النجاح (%)" htmlFor="x-pass">
                <Input id="x-pass" type="number" min={0} max={100} inputMode="numeric" value={settings.passingScore} onChange={(e) => setSettings((s) => ({ ...s, passingScore: Math.min(100, Math.max(0, Number(e.target.value))) }))} />
              </Field>
            </div>
          </Panel>

          <section aria-label="الأسئلة" className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink-950">الأسئلة</h2>
                <p className="text-sm text-ink-500">اختر الدائرة بجوار الإجابة الصحيحة.</p>
              </div>
            </div>

            {questions.map((q, qi) => {
              const problems = issueFor(q.id);
              return (
                <article key={q.id} className={cn("rounded-2xl border bg-white shadow-card", problems.length ? "border-red-200" : "border-line")}>
                  <header className="flex items-center gap-2 border-b border-line px-5 py-3">
                    <span className="grid size-7 place-items-center rounded-full bg-ink-950 text-xs font-bold text-white tabular-nums">{qi + 1}</span>
                    <span className="text-sm font-bold text-ink-900">السؤال {qi + 1}</span>
                    <div className="ms-auto flex items-center gap-1">
                      <label className="me-2 flex items-center gap-1.5 text-xs text-ink-500">
                        الدرجة
                        <input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) => setQ(q.id, { points: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-8 w-14 rounded-lg border border-line-strong px-2 text-center text-sm text-ink-900 tabular-nums outline-none focus:border-brand-500"
                          aria-label={`درجة السؤال ${qi + 1}`}
                        />
                      </label>
                      <IconBtn label="تحريك لأعلى" icon="up" disabled={qi === 0} onClick={() => setQuestions((l) => swap(l, qi, qi - 1))} />
                      <IconBtn label="تحريك لأسفل" icon="down" disabled={qi === questions.length - 1} onClick={() => setQuestions((l) => swap(l, qi, qi + 1))} />
                      <IconBtn
                        label="تكرار السؤال"
                        icon="copy"
                        onClick={() =>
                          setQuestions((l) => {
                            const ids = new Map(q.choices.map((c) => [c.id, uid("c")]));
                            const copy = { ...q, id: uid("q"), choices: q.choices.map((c) => ({ ...c, id: ids.get(c.id)! })), correctChoiceId: ids.get(q.correctChoiceId) ?? "" };
                            return [...l.slice(0, qi + 1), copy, ...l.slice(qi + 1)];
                          })
                        }
                      />
                      <IconBtn label="حذف السؤال" icon="trash" danger disabled={questions.length === 1} onClick={() => setQuestions((l) => l.filter((x) => x.id !== q.id))} />
                    </div>
                  </header>

                  <div className="p-5">
                    <Textarea
                      aria-label={`نص السؤال ${qi + 1}`}
                      rows={2}
                      value={q.text}
                      onChange={(e) => setQ(q.id, { text: e.target.value })}
                      placeholder="اكتب نص السؤال…"
                      className="min-h-0"
                    />
                    <div role="radiogroup" aria-label={`خيارات السؤال ${qi + 1}`} className="mt-4 space-y-2">
                      {q.choices.map((c, ci) => {
                        const correct = q.correctChoiceId === c.id;
                        return (
                          <div key={c.id} className={cn("flex items-center gap-2 rounded-xl border p-1.5 ps-2 transition-colors", correct ? "border-brand-300 bg-brand-50/60" : "border-line")}>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={correct}
                              aria-label={`اعتبار الخيار ${LETTERS[ci]} الإجابة الصحيحة`}
                              onClick={() => setQ(q.id, { correctChoiceId: c.id })}
                              className={cn(
                                "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                correct ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong hover:border-brand-400",
                              )}
                            >
                              {correct && <Icon name="check" className="size-3.5" strokeWidth={3} />}
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-ink-400">{LETTERS[ci]}</span>
                            <input
                              aria-label={`الخيار ${LETTERS[ci]}`}
                              value={c.text}
                              onChange={(e) => setQ(q.id, { choices: q.choices.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)) })}
                              placeholder={`الخيار ${LETTERS[ci]}`}
                              className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[0.9375rem] text-ink-900 outline-none placeholder:text-ink-400"
                            />
                            {correct && <span className="hidden text-xs font-bold text-brand-700 sm:inline">الإجابة الصحيحة</span>}
                            <button
                              type="button"
                              aria-label={`حذف الخيار ${LETTERS[ci]}`}
                              disabled={q.choices.length <= 2}
                              onClick={() =>
                                setQ(q.id, {
                                  choices: q.choices.filter((x) => x.id !== c.id),
                                  correctChoiceId: correct ? "" : q.correctChoiceId,
                                })
                              }
                              className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-muted hover:text-red-600 disabled:opacity-30"
                            >
                              <Icon name="x" className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {q.choices.length < MAX_CHOICES && (
                      <button
                        type="button"
                        onClick={() => setQ(q.id, { choices: [...q.choices, { id: uid("c"), text: "" }] })}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        <Icon name="plus" className="size-4" />
                        إضافة خيار
                      </button>
                    )}
                    {problems.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-red-600">
                        {problems.map((p) => (
                          <li key={p.message}>{p.message.replace(/^السؤال \d+: /, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => setQuestions((l) => [...l, blankQuestion()])}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-5 text-sm font-bold text-ink-600 transition-colors hover:border-brand-400 hover:bg-white hover:text-brand-700"
            >
              <Icon name="plus" className="size-4" />
              إضافة سؤال
            </button>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-t-2xl bg-line">
              {[
                { label: "الأسئلة", value: questions.length },
                { label: "مجموع الدرجات", value: totalPoints },
                { label: "المدة", value: `${settings.durationMinutes || 0} د` },
                { label: "النجاح", value: `${settings.passingScore}%` },
              ].map((s) => (
                <div key={s.label} className="bg-white px-4 py-3">
                  <dt className="text-xs text-ink-500">{s.label}</dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-ink-950 tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line p-4">
              {issues.length === 0 ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <Icon name="check" className="size-4" strokeWidth={2.5} />
                  الاختبار جاهز للنشر
                </p>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink-800">قبل النشر ({issues.length})</p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-5 text-ink-500">
                    {issues.slice(0, 4).map((x, i) => (
                      <li key={i}>• {x.message}</li>
                    ))}
                    {issues.length > 4 && <li>و{issues.length - 4} أخرى…</li>}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 rounded-b-2xl border-t border-line bg-canvas p-4">
              {!exam || exam.status === "DRAFT" ? (
                <>
                  <Button onClick={() => save("PUBLISHED")}>حفظ ونشر</Button>
                  <Button variant="secondary" onClick={() => save("DRAFT")}>حفظ كمسودة</Button>
                </>
              ) : (
                <Button onClick={() => save()}>حفظ التعديلات</Button>
              )}
            </div>
          </div>
          {exam && (
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-2 shadow-card">
              <span className="text-sm text-ink-500">{formatQuestions(exam.questions.length)} محفوظة</span>
              <RowMenu label={`إجراءات ${exam.title}`} items={menuItems(exam, { includeEdit: false })} />
            </div>
          )}
        </aside>
      </div>
      {dialog}
    </>
  );
}

function swap<T>(list: T[], a: number, b: number) {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function IconBtn({ label, icon, onClick, disabled, danger }: { label: string; icon: "up" | "down" | "copy" | "trash"; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-muted disabled:opacity-30",
        danger ? "hover:text-red-600" : "hover:text-ink-900",
      )}
    >
      {icon === "up" || icon === "down" ? (
        <Icon name="chevron-down" className={cn("size-4", icon === "up" && "rotate-180")} />
      ) : (
        <Icon name={icon} className="size-4" />
      )}
    </button>
  );
}
