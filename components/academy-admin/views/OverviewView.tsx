"use client";

import Link from "next/link";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatCourses } from "@/lib/academy/format";
import { dash, stateOf } from "@/lib/academy-admin/meta";
import type { DashActivityKind } from "@/lib/academy-admin/types";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { useAcademy } from "../AcademyStore";
import { CourseThumb, ExamStateBadge } from "../parts";

const activityIcon: Record<DashActivityKind, IconName> = {
  enrollment: "ticket",
  registration: "user",
  submission: "exam",
  course: "book",
  lesson: "play",
  codes: "ticket",
  exam: "exam",
  website: "globe",
};

export function OverviewView() {
  const { profile, courses, lessons, students, codes, exams, activity, lessonsOf, courseById } = useAcademy();

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const unusedCodes = codes.filter((c) => c.status === "UNUSED");
  const upcoming = exams
    .map((e) => ({ exam: e, state: stateOf(e) }))
    .filter((x) => x.state === "SCHEDULED" || x.state === "OPEN")
    .sort((a, b) => (a.exam.opensAt ?? "").localeCompare(b.exam.opensAt ?? ""));

  const enrollments = students
    .flatMap((s) => s.enrollments.map((e) => ({ student: s, ...e })))
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt))
    .slice(0, 6);

  // Things the owner should act on, most useful first.
  const attention: { icon: IconName; text: string; href: string; action: string }[] = [];
  for (const c of published) {
    const left = unusedCodes.filter((code) => code.courseId === c.id).length;
    if (left < 5) attention.push({ icon: "ticket", text: left === 0 ? `لا توجد أكواد متاحة لدورة «${c.title}»` : `تبقّى ${left} أكواد فقط لدورة «${c.title}»`, href: dash.codes, action: "توليد أكواد" });
  }
  for (const c of courses.filter((c) => c.status === "DRAFT")) {
    attention.push({ icon: "book", text: `دورة «${c.title}» ما زالت مسودة ولا يراها الطلاب`, href: dash.course(c.id), action: "مراجعة ونشر" });
  }
  for (const c of courses.filter((c) => lessonsOf(c.id).length === 0)) {
    attention.push({ icon: "play", text: `دورة «${c.title}» بلا دروس`, href: dash.lessons(c.id), action: "إضافة دروس" });
  }
  for (const e of exams.filter((e) => e.status === "DRAFT")) {
    attention.push({ icon: "exam", text: `اختبار «${e.title}» غير منشور`, href: dash.exam(e.id), action: "إكمال الاختبار" });
  }

  const stats = [
    { label: "الطلاب", value: students.length, note: `${students.filter((s) => s.status === "ACTIVE").length} نشط`, href: dash.students },
    { label: "الدورات", value: courses.length, note: `${published.length} منشورة`, href: dash.courses },
    { label: "الدروس", value: lessons.length, note: `في ${formatCourses(courses.length)}`, href: dash.lessons() },
    { label: "أكواد متاحة", value: unusedCodes.length, note: "جاهزة للتوزيع", href: dash.codes },
    { label: "اختبارات قادمة", value: upcoming.length, note: upcoming[0]?.exam.opensAt ? `الأقرب ${formatDate(upcoming[0].exam.opensAt)}` : "متاحة الآن", href: dash.exams },
  ];

  return (
    <>
      <PageHeader
        title={`أهلاً، ${profile.owner.name}`}
        description={`ملخّص ما يحدث في ${profile.name}.`}
        actions={
          <>
            <Button href={dash.codes} variant="secondary">
              <Icon name="ticket" className="size-4" />
              توليد أكواد
            </Button>
            <Button href={dash.newCourse}>
              <Icon name="plus" className="size-4" />
              دورة جديدة
            </Button>
          </>
        }
      />

      <section aria-label="مؤشرات الأكاديمية" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card lg:grid-cols-5">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={cn("block bg-white p-5 transition-colors hover:bg-canvas sm:p-6", i === stats.length - 1 && "col-span-2 lg:col-span-1")}
          >
            <p className="text-sm font-semibold text-ink-500">{s.label}</p>
            <p className="mt-3 text-[1.75rem] leading-none font-extrabold tracking-tight text-ink-950 tabular-nums sm:text-[2rem]">{formatNumber(s.value)}</p>
            <p className="mt-3 text-xs text-ink-500">{s.note}</p>
          </Link>
        ))}
      </section>

      {attention.length > 0 && (
        <section className="mt-6 rounded-2xl border border-gold-100 bg-gold-50/50">
          <h2 className="flex items-center gap-2 px-6 pt-4 text-sm font-bold text-gold-600">
            <Icon name="alert" className="size-4" />
            يحتاج إلى انتباهك
          </h2>
          <ul className="divide-y divide-gold-100 px-6 pb-1">
            {attention.slice(0, 4).map((a) => (
              <li key={a.text} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                <Icon name={a.icon} className="size-4 shrink-0 text-ink-400" />
                <p className="min-w-0 flex-1 text-sm text-ink-800">{a.text}</p>
                <Link href={a.href} className="text-sm font-bold whitespace-nowrap text-brand-700 hover:text-brand-800">
                  {a.action}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="أحدث التسجيلات"
          description="الطلاب الذين انضموا إلى دوراتك مؤخراً."
          bodyClassName="p-0"
          action={
            <Link href={dash.students} className="text-sm font-semibold whitespace-nowrap text-brand-700 hover:text-brand-800">
              كل الطلاب
            </Link>
          }
        >
          {enrollments.length === 0 ? (
            <EmptyState
              icon="users"
              title="لا توجد تسجيلات بعد"
              description="وزّع أكواد التسجيل على طلابك ليفعّلوا دوراتهم."
              action={<Button href={dash.codes} size="sm">توليد أكواد</Button>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {enrollments.map((e) => {
                const course = courseById(e.courseId);
                return (
                  <li key={`${e.student.id}-${e.courseId}`}>
                    <Link href={dash.student(e.student.id)} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-canvas/60">
                      {course && <CourseThumb course={course} className="w-12" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink-950">{e.student.name}</p>
                        <p className="truncate text-xs text-ink-500">{course?.title}</p>
                      </div>
                      <p className="shrink-0 text-xs text-ink-400">{formatDate(e.enrolledAt)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel
            title="الاختبارات القادمة"
            bodyClassName="p-0"
            action={
              <Link href={dash.exams} className="text-sm font-semibold whitespace-nowrap text-brand-700 hover:text-brand-800">
                كل الاختبارات
              </Link>
            }
          >
            {upcoming.length === 0 ? (
              <EmptyState icon="exam" title="لا توجد اختبارات قادمة" className="py-8" action={<Button href={dash.newExam} size="sm" variant="secondary">إنشاء اختبار</Button>} />
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.map(({ exam, state }) => (
                  <li key={exam.id}>
                    <Link href={dash.exam(exam.id)} className="flex items-start gap-3 px-6 py-3.5 hover:bg-canvas/60">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink-950">{exam.title}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-500">
                          {courseById(exam.courseId)?.title}
                          {exam.opensAt && state === "SCHEDULED" && <> · يبدأ {formatDateTime(exam.opensAt)}</>}
                        </p>
                      </div>
                      <ExamStateBadge state={state} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="آخر النشاطات" bodyClassName="px-6 py-5">
            {activity.length === 0 ? (
              <p className="text-sm text-ink-500">لا توجد نشاطات بعد.</p>
            ) : (
              <ol className="space-y-4">
                {activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-500 ring-1 ring-line">
                      <Icon name={activityIcon[a.kind]} className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-ink-800">{a.message}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
