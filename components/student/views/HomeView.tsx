"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { academyRoutes } from "@/lib/academy/nav";
import { formatDate, formatDateTime } from "@/lib/format";
import { CourseCard } from "../CourseCard";
import { CourseCover, ExamPill, Meter, ProgressRing } from "../parts";
import { RedeemCodeButton } from "../RedeemCode";
import { useStudent } from "../StudentStore";

const r = academyRoutes.student;
const activityIcon: Record<string, IconName> = { lesson: "play", exam: "exam", enrollment: "ticket" };

export function HomeView() {
  const { profile, courses, exams, activity, recentCourses, resumeLesson, percentOf, progressOf, examStateOf, resultOf, courseById } = useStudent();
  const firstName = profile.name.split(" ")[0];

  const ordered = recentCourses();
  // Continue with the most recent unfinished course; fall back to the most recent one.
  const current = ordered.find((c) => percentOf(c.id) < 100 && c.lessons.length) ?? ordered[0];
  const resume = current && resumeLesson(current.id);
  const resumeIndex = current && resume ? current.lessons.findIndex((l) => l.id === resume.id) + 1 : 0;

  const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
  const doneLessons = courses.reduce((s, c) => s + progressOf(c.id).completedLessonIds.filter((id) => c.lessons.some((l) => l.id === id)).length, 0);
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const upcoming = exams
    .map((e) => ({ exam: e, state: examStateOf(e) }))
    .filter((x) => x.state === "AVAILABLE" || x.state === "UPCOMING")
    .sort((a, b) => (a.state === b.state ? (a.exam.opensAt ?? "").localeCompare(b.exam.opensAt ?? "") : a.state === "AVAILABLE" ? -1 : 1));
  const available = upcoming.filter((x) => x.state === "AVAILABLE").length;
  const lastResult = exams
    .map((e) => ({ exam: e, result: resultOf(e) }))
    .filter((x) => x.result)
    .sort((a, b) => b.result!.attempt.submittedAt.localeCompare(a.result!.attempt.submittedAt))[0];

  const subtitle = available
    ? `لديك ${available === 1 ? "اختبار متاح" : `${available} اختبارات متاحة`} الآن.`
    : current
      ? "واصل من حيث توقفت."
      : "فعّل دورتك الأولى لتبدأ التعلّم.";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink-950 sm:text-3xl">أهلاً، {firstName}</h1>
        <p className="mt-1.5 text-ink-500">{subtitle}</p>
      </header>

      {/* Continue learning */}
      {current && resume ? (
        <section aria-labelledby="continue-title" className="overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="order-2 flex flex-col p-6 sm:p-8 md:order-1">
              <p className="text-sm font-bold text-brand-700">تابع من حيث توقفت</p>
              <h2 id="continue-title" className="mt-2 text-2xl leading-snug font-extrabold text-ink-950">
                {current.title}
              </h2>
              <p className="mt-3 text-ink-600">
                <span className="text-ink-400">
                  الدرس {resumeIndex} من {current.lessons.length}:
                </span>{" "}
                <span className="font-semibold text-ink-900">{resume.title}</span>
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Meter value={percentOf(current.id)} className="h-2 flex-1" label="التقدّم في الدورة" />
                <span className="text-sm font-bold text-ink-900 tabular-nums">{percentOf(current.id)}%</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href={r.lesson(current.id, resume.id)} size="lg">
                  <Icon name="play" className="size-5" />
                  متابعة التعلّم
                </Button>
                {progressOf(current.id).lastAccessedAt && (
                  <span className="text-sm text-ink-500">آخر نشاط {formatDate(progressOf(current.id).lastAccessedAt!)}</span>
                )}
              </div>
            </div>
            <Link href={r.lesson(current.id, resume.id)} className="group relative order-1 block md:order-2" tabIndex={-1} aria-hidden="true">
              <CourseCover course={current} className="h-full min-h-48" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-white/90 text-brand-700 shadow-lift transition-transform group-hover:scale-105">
                  <Icon name="play" className="size-7" />
                </span>
              </span>
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-line-strong bg-white px-6 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name="ticket" className="size-6" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-ink-950">ابدأ رحلتك التعليمية</h2>
          <p className="mx-auto mt-2 max-w-md leading-7 text-ink-500">أدخل كود التسجيل الذي حصلت عليه من معلّمك لتفعيل دورتك والبدء فوراً.</p>
          <div className="mt-6">
            <RedeemCodeButton variant="primary" />
          </div>
        </section>
      )}

      {/* At a glance */}
      {courses.length > 0 && (
        <section aria-label="لمحة سريعة" className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-5 shadow-card">
            <ProgressRing value={overall} size={84}>
              <span className="text-lg font-extrabold text-ink-950 tabular-nums">{overall}%</span>
            </ProgressRing>
            <div>
              <p className="font-bold text-ink-950">تقدّمك العام</p>
              <p className="mt-1 text-sm text-ink-500">
                {doneLessons} من {totalLessons} درس في {courses.length === 1 ? "دورة واحدة" : courses.length === 2 ? "دورتين" : `${courses.length} دورات`}
              </p>
            </div>
          </div>

          <GlanceCard
            icon="exam"
            title="الاختبار القادم"
            empty="لا توجد اختبارات قادمة"
            body={
              upcoming[0] && (
                <>
                  <p className="truncate font-semibold text-ink-900">{upcoming[0].exam.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {upcoming[0].state === "AVAILABLE" ? `متاح الآن · ${upcoming[0].exam.durationMinutes} دقيقة` : `يبدأ ${formatDateTime(upcoming[0].exam.opensAt!)}`}
                  </p>
                </>
              )
            }
            href={upcoming[0] ? (upcoming[0].state === "AVAILABLE" ? r.exam(upcoming[0].exam.id) : r.exams) : undefined}
            action={upcoming[0]?.state === "AVAILABLE" ? "ابدأ الاختبار" : "التفاصيل"}
          />

          <GlanceCard
            icon="progress"
            title="آخر نتيجة"
            empty="لم تؤدِّ أي اختبار بعد"
            body={
              lastResult && (
                <>
                  <p className="truncate font-semibold text-ink-900">{lastResult.exam.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    <span className={lastResult.result!.passed ? "font-bold text-brand-700" : "font-bold text-red-600"}>{lastResult.result!.percent}%</span> ·{" "}
                    {lastResult.result!.passed ? "ناجح" : "لم ينجح"}
                  </p>
                </>
              )
            }
            href={lastResult ? r.results : undefined}
            action="كل النتائج"
          />
        </section>
      )}

      {/* My courses */}
      {courses.length > 0 && (
        <section aria-labelledby="my-courses">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="my-courses" className="text-xl font-extrabold text-ink-950">
              دوراتي
            </h2>
            <Link href={r.courses} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              كل الدورات ({courses.length})
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.slice(0, 3).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* Exams + activity */}
      {courses.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="upcoming-exams" className="rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="upcoming-exams" className="font-bold text-ink-950">
                الاختبارات القادمة
              </h2>
              <Link href={r.exams} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                كل الاختبارات
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-500">لا توجد اختبارات قادمة. سنُعلمك عند إضافة اختبار جديد.</p>
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.slice(0, 4).map(({ exam, state }) => (
                  <li key={exam.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-950">{exam.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-500">
                        {courseById(exam.courseId)?.title} · {state === "UPCOMING" ? `يبدأ ${formatDateTime(exam.opensAt!)}` : `${exam.durationMinutes} دقيقة`}
                      </p>
                    </div>
                    {state === "AVAILABLE" ? <Button href={r.exam(exam.id)} size="sm">ابدأ</Button> : <ExamPill state={state} />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-activity" className="rounded-2xl border border-line bg-white shadow-card">
            <h2 id="recent-activity" className="border-b border-line px-6 py-4 font-bold text-ink-950">
              آخر نشاطاتك
            </h2>
            {activity.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-500">ستظهر هنا دروسك واختباراتك الأخيرة.</p>
            ) : (
              <ol className="space-y-4 px-6 py-5">
                {activity.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                      <Icon name={activityIcon[a.kind]} className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-ink-800">{a.message}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function GlanceCard({ icon, title, body, empty, href, action }: { icon: IconName; title: string; body?: React.ReactNode; empty: string; href?: string; action: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="flex items-center gap-2 text-sm font-bold text-ink-500">
        <Icon name={icon} className="size-4" />
        {title}
      </p>
      <div className="mt-3 min-w-0 flex-1">{body || <p className="text-sm text-ink-400">{empty}</p>}</div>
      {body && href && (
        <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
          {action}
          <Icon name="chevron-side" className="size-3.5 rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}
