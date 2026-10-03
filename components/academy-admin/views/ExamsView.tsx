"use client";

import Link from "next/link";
import { useState } from "react";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { EmptyState, FilterTabs, PageHeader, Table, Td, Th, Tr } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { dash, formatQuestions, scoreOf, stateOf, type ExamState } from "@/lib/academy-admin/meta";
import { formatDateTime } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { ExamStateBadge } from "../parts";
import { useExamActions } from "../useExamActions";

export function ExamsView() {
  const { exams, courses, courseById, submissionsOf } = useAcademy();
  const { menuItems, dialog } = useExamActions();
  const [filter, setFilter] = useState<"ALL" | ExamState>("ALL");

  const withState = exams.map((e) => ({ exam: e, state: stateOf(e) }));
  const rows = withState.filter((x) => filter === "ALL" || x.state === filter).sort((a, b) => b.exam.createdAt.localeCompare(a.exam.createdAt));
  const count = (s: ExamState) => withState.filter((x) => x.state === s).length;

  return (
    <>
      <PageHeader
        title="الاختبارات"
        description="اختبارات اختيار من متعدد مرتبطة بدوراتك، تُصحَّح تلقائياً وتظهر نتائجها فوراً."
        actions={
          courses.length > 0 && (
            <Button href={dash.newExam}>
              <Icon name="plus" className="size-4" />
              اختبار جديد
            </Button>
          )
        }
      />

      <div className="rounded-2xl border border-line bg-white shadow-card">
        {exams.length === 0 ? (
          <EmptyState
            icon="exam"
            title="لا توجد اختبارات بعد"
            description={courses.length ? "أنشئ اختباراً لإحدى دوراتك وأضف أسئلته وإجاباتها الصحيحة." : "أنشئ دورة أولاً، ثم أضف لها اختبارات."}
            action={courses.length ? <Button href={dash.newExam}>إنشاء اختبار</Button> : <Button href={dash.newCourse}>دورة جديدة</Button>}
          />
        ) : (
          <>
            <div className="border-b border-line p-4">
              <FilterTabs
                label="تصفية حسب الحالة"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "ALL", label: "الكل", count: exams.length },
                  { value: "OPEN", label: "متاحة", count: count("OPEN") },
                  { value: "SCHEDULED", label: "مجدولة", count: count("SCHEDULED") },
                  { value: "DRAFT", label: "مسودة", count: count("DRAFT") },
                  { value: "CLOSED", label: "مغلقة", count: count("CLOSED") },
                ]}
              />
            </div>
            {rows.length === 0 ? (
              <EmptyState icon="exam" title="لا توجد اختبارات بهذه الحالة" />
            ) : (
              <Table className="min-w-[56rem]">
                <thead>
                  <tr>
                    <Th>الاختبار</Th>
                    <Th>الأسئلة</Th>
                    <Th>المدة</Th>
                    <Th>الحالة</Th>
                    <Th>المحاولات</Th>
                    <Th>متوسط الدرجات</Th>
                    <Th className="w-14"><span className="sr-only">إجراءات</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ exam, state }) => {
                    const subs = submissionsOf(exam.id);
                    const avg = subs.length ? Math.round(subs.reduce((sum, s) => sum + scoreOf(exam, s.answers).percent, 0) / subs.length) : null;
                    return (
                      <Tr key={exam.id}>
                        <Td>
                          <Link href={dash.exam(exam.id)} className="group block">
                            <span className="block font-bold text-ink-950 group-hover:text-brand-700">{exam.title}</span>
                            <span className="block text-xs text-ink-500">
                              {courseById(exam.courseId)?.title}
                              {state === "SCHEDULED" && exam.opensAt && <> · يبدأ {formatDateTime(exam.opensAt)}</>}
                            </span>
                          </Link>
                        </Td>
                        <Td className="whitespace-nowrap text-ink-700">{formatQuestions(exam.questions.length)}</Td>
                        <Td className="whitespace-nowrap text-ink-700">{exam.durationMinutes} دقيقة</Td>
                        <Td><ExamStateBadge state={state} /></Td>
                        <Td>
                          {state === "DRAFT" ? (
                            <span className="text-ink-400">—</span>
                          ) : (
                            <Link href={dash.examResults(exam.id)} className="font-semibold text-ink-800 tabular-nums hover:text-brand-700">
                              {subs.length}
                            </Link>
                          )}
                        </Td>
                        <Td className="tabular-nums">{avg === null ? <span className="text-ink-400">—</span> : <span className="font-semibold text-ink-800">{avg}%</span>}</Td>
                        <Td><RowMenu label={`إجراءات ${exam.title}`} items={menuItems(exam)} /></Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
      </div>
      {dialog}
    </>
  );
}
