"use client";

import Link from "next/link";
import { Avatar, BackLink, DetailRow, EmptyState, PageHeader, Panel, StatusPill } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { dash, scoreOf } from "@/lib/academy-admin/meta";
import { formatDate, formatDateTime } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { CourseThumb, ProgressBar, StudentStatusBadge } from "../parts";
import { useStudentActions } from "../useStudentActions";

export function StudentDetailView({ id }: { id: string }) {
  const { studentById, courseById, lessonsOf, progressOf, submissions, examById } = useAcademy();
  const { toggleStatus, dialog } = useStudentActions();
  const student = studentById(id);

  if (!student) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState icon="user" title="الطالب غير موجود" action={<Button href={dash.students} variant="secondary">العودة إلى الطلاب</Button>} />
      </div>
    );
  }

  const results = submissions
    .filter((s) => s.studentId === student.id)
    .map((sub) => {
      const exam = examById(sub.examId);
      return exam ? { sub, exam, ...scoreOf(exam, sub.answers) } : null;
    })
    .filter((x) => x !== null)
    .sort((a, b) => b.sub.submittedAt.localeCompare(a.sub.submittedAt));

  const avg = student.enrollments.length
    ? Math.round(student.enrollments.reduce((sum, e) => sum + progressOf(student, e.courseId), 0) / student.enrollments.length)
    : 0;
  const avgScore = results.length ? Math.round(results.reduce((sum, r) => sum + r.percent, 0) / results.length) : null;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <Avatar name={student.name} className="size-14 text-xl" />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {student.name}
                <StudentStatusBadge status={student.status} />
              </span>
              <span className="mt-1 block text-sm font-normal text-ink-500">
                <bdi>{student.email}</bdi>
              </span>
            </span>
          </span>
        }
        actions={
          student.status === "ACTIVE" ? (
            <Button variant="secondary" onClick={() => toggleStatus(student)} className="text-red-600 hover:text-red-700">
              <Icon name="ban" className="size-4" />
              إيقاف الحساب
            </Button>
          ) : (
            <Button onClick={() => toggleStatus(student)}>
              <Icon name="power" className="size-4" />
              تفعيل الحساب
            </Button>
          )
        }
      >
        <BackLink href={dash.students}>الطلاب</BackLink>
      </PageHeader>

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card sm:grid-cols-4">
        {[
          { label: "الدورات", value: student.enrollments.length },
          { label: "متوسط التقدّم", value: `${avg}%` },
          { label: "اختبارات مكتملة", value: results.length },
          { label: "متوسط الدرجات", value: avgScore === null ? "—" : `${avgScore}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white px-5 py-4">
            <dt className="text-sm text-ink-500">{s.label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-ink-950 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="الدورات والتقدّم" bodyClassName="p-0">
            {student.enrollments.length === 0 ? (
              <EmptyState icon="book" title="لم يفعّل أي دورة بعد" description="يفعّل الطالب الدورة بإدخال كود التسجيل من حسابه." className="py-10" />
            ) : (
              <ul className="divide-y divide-line">
                {student.enrollments.map((e) => {
                  const course = courseById(e.courseId);
                  if (!course) return null;
                  const total = lessonsOf(course.id).length;
                  return (
                    <li key={e.courseId} className="flex items-center gap-4 px-6 py-4">
                      <CourseThumb course={course} />
                      <div className="min-w-0 flex-1">
                        <Link href={dash.course(course.id)} className="block truncate font-bold text-ink-950 hover:text-brand-700">
                          {course.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {e.completedLessonIds.filter((id) => lessonsOf(course.id).some((l) => l.id === id)).length} من {total} دروس · سُجّل في {formatDate(e.enrolledAt)}
                          {e.code && (
                            <>
                              {" "}· الكود <bdi className="font-mono">{e.code}</bdi>
                            </>
                          )}
                        </p>
                        <ProgressBar value={progressOf(student, course.id)} className="mt-2 max-w-sm" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="نتائج الاختبارات" bodyClassName="p-0">
            {results.length === 0 ? (
              <EmptyState icon="exam" title="لم يؤدِّ أي اختبار بعد" className="py-10" />
            ) : (
              <ul className="divide-y divide-line">
                {results.map((r) => (
                  <li key={r.sub.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <Link href={dash.examResults(r.exam.id)} className="block truncate font-semibold text-ink-950 hover:text-brand-700">
                        {r.exam.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatDateTime(r.sub.submittedAt)} · {r.sub.timeTaken} دقيقة
                      </p>
                    </div>
                    <span className="text-sm font-bold text-ink-900 tabular-nums">
                      {r.score}/{r.total}
                    </span>
                    <StatusPill tone={r.passed ? "success" : "danger"}>{r.passed ? `ناجح · ${r.percent}%` : `لم ينجح · ${r.percent}%`}</StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="بيانات الحساب" bodyClassName="px-6 py-2">
          <dl className="divide-y divide-line">
            <DetailRow label="البريد الإلكتروني"><bdi>{student.email}</bdi></DetailRow>
            <DetailRow label="الجوال">{student.phone ? <bdi>{student.phone}</bdi> : <span className="text-ink-400">—</span>}</DetailRow>
            <DetailRow label="تاريخ التسجيل">{formatDate(student.registeredAt)}</DetailRow>
            <DetailRow label="آخر نشاط">{student.lastActiveAt ? formatDate(student.lastActiveAt) : "—"}</DetailRow>
          </dl>
        </Panel>
      </div>
      {dialog}
    </>
  );
}
