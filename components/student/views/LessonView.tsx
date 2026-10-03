"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { paragraphs } from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import { formatDuration, formatFileSize } from "@/lib/format";
import type { LearnCourse, LearnLesson } from "@/lib/student/types";
import { Meter } from "../parts";
import { useStudent } from "../StudentStore";

const r = academyRoutes.student;

/** Focused lesson screen: the video first, the curriculum beside it, nothing else competing. */
export function LessonView({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const router = useRouter();
  const { courseById, progressOf, percentOf, openLesson, setLessonComplete, notify } = useStudent();
  const [outlineOpen, setOutlineOpen] = useState(false);
  const course = courseById(courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[index];

  // Remember where the student is, for "Continue learning".
  useEffect(() => {
    if (course && lesson) openLesson(course.id, lesson.id);
  }, [course, lesson, openLesson]);

  if (!course || !lesson) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-lg font-bold text-ink-950">{course ? "الدرس غير موجود" : "هذه الدورة غير متاحة في حسابك"}</p>
          <p className="mt-2 text-sm text-ink-500">ربما حُذف الدرس أو لم تفعّل الدورة بعد.</p>
          <Button href={r.courses} variant="secondary" className="mt-6">
            العودة إلى دوراتي
          </Button>
        </div>
      </div>
    );
  }

  const completed = progressOf(course.id).completedLessonIds;
  const isDone = completed.includes(lesson.id);
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const percent = percentOf(course.id);

  const completeAndContinue = () => {
    setLessonComplete(course.id, lesson.id, true);
    if (next) router.push(r.lesson(course.id, next.id));
    else notify("أحسنت! أنهيت كل دروس الدورة.");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {/* Slim focus header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          <Link href={r.courses} aria-label="العودة إلى دوراتي" className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-600 hover:bg-muted">
            <Icon name="arrow" className="size-5 ltr:rotate-180" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-950">{course.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <Meter value={percent} className="h-1 w-28 sm:w-40" label="تقدّمك في الدورة" />
              <span className="text-[0.6875rem] text-ink-500 tabular-nums">{percent}%</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink-700 hover:bg-muted lg:hidden"
          >
            <Icon name="layers2" className="size-4" />
            المحتوى
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[90rem] flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="min-w-0 px-0 pb-16 sm:px-6 sm:pt-6 lg:px-8">
          <VideoPlayer key={lesson.id} lesson={lesson} />

          <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-0">
            <p className="text-sm font-semibold text-brand-700">
              الدرس {index + 1} من {course.lessons.length}
            </p>
            <h1 className="mt-1.5 text-2xl leading-snug font-extrabold text-ink-950 sm:text-[1.75rem]">{lesson.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
              <Icon name="clock" className="size-4" />
              {formatDuration(lesson.durationMinutes)}
            </p>

            {/* Primary actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-card">
              {isDone ? (
                <button
                  type="button"
                  onClick={() => setLessonComplete(course.id, lesson.id, false)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  title="إلغاء تحديد الدرس كمكتمل"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
                    <Icon name="check" className="size-3.5" strokeWidth={3} />
                  </span>
                  أكملت هذا الدرس
                </button>
              ) : (
                <Button onClick={completeAndContinue}>
                  <Icon name="check" className="size-4" strokeWidth={2.5} />
                  {next ? "أكملت الدرس، التالي" : "إنهاء الدورة"}
                </Button>
              )}
              <div className="ms-auto flex gap-2">
                {prev ? (
                  <Button href={r.lesson(course.id, prev.id)} variant="ghost">
                    <Icon name="chevron-side" className="size-4 ltr:rotate-180" />
                    السابق
                  </Button>
                ) : (
                  <Button variant="ghost" disabled>
                    <Icon name="chevron-side" className="size-4 ltr:rotate-180" />
                    السابق
                  </Button>
                )}
                {next ? (
                  <Button href={r.lesson(course.id, next.id)} variant="secondary">
                    التالي
                    <Icon name="chevron-side" className="size-4 rtl:rotate-180" />
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    التالي
                    <Icon name="chevron-side" className="size-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>

            {(lesson.description || lesson.content) && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-ink-950">عن الدرس</h2>
                <div className="mt-3 space-y-4 leading-8 text-ink-700">
                  {lesson.description && <p>{lesson.description}</p>}
                  {lesson.content && paragraphs(lesson.content).map((p) => <p key={p} className="whitespace-pre-line">{p}</p>)}
                </div>
              </section>
            )}

            {lesson.attachments.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-ink-950">ملفات الدرس</h2>
                <ul className="mt-3 space-y-2">
                  {lesson.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={`https://files.myacademy.com/${a.id}/${encodeURIComponent(a.name)}`}
                        download
                        className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:border-line-strong"
                      >
                        <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon name="layers2" className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <bdi className="block truncate text-sm font-semibold text-ink-900">{a.name}</bdi>
                          <span className="text-xs text-ink-500">{formatFileSize(a.sizeKb)}</span>
                        </span>
                        <span className="text-sm font-semibold text-brand-700">تحميل</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>

        {/* Curriculum: sidebar on desktop, sheet on mobile */}
        <aside className="hidden border-s border-line bg-white lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <Outline course={course} current={lesson} completed={completed} />
          </div>
        </aside>
        <div className={cn("fixed inset-0 z-50 lg:hidden", !outlineOpen && "pointer-events-none")} aria-hidden={!outlineOpen}>
          <div className={cn("absolute inset-0 bg-ink-950/50 transition-opacity", outlineOpen ? "opacity-100" : "opacity-0")} onClick={() => setOutlineOpen(false)} />
          <div
            inert={!outlineOpen}
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-float transition-transform duration-300",
              outlineOpen ? "translate-y-0" : "translate-y-full",
            )}
          >
            <div className="sticky top-0 flex justify-center bg-white pt-3 pb-1">
              <span className="h-1 w-10 rounded-full bg-line-strong" />
            </div>
            <Outline course={course} current={lesson} completed={completed} onNavigate={() => setOutlineOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Outline({ course, current, completed, onNavigate }: { course: LearnCourse; current: LearnLesson; completed: string[]; onNavigate?: () => void }) {
  const total = course.lessons.reduce((s, l) => s + l.durationMinutes, 0);
  const done = course.lessons.filter((l) => completed.includes(l.id)).length;
  return (
    <nav aria-label="محتوى الدورة">
      <div className="border-b border-line px-5 py-4">
        <p className="font-bold text-ink-950">محتوى الدورة</p>
        <p className="mt-0.5 text-xs text-ink-500">
          {done} من {course.lessons.length} دروس · {formatDuration(total)}
        </p>
      </div>
      <ol className="p-2">
        {course.lessons.map((l, i) => {
          const isCurrent = l.id === current.id;
          const isDone = completed.includes(l.id);
          return (
            <li key={l.id}>
              <Link
                href={r.lesson(course.id, l.id)}
                onClick={onNavigate}
                aria-current={isCurrent ? "step" : undefined}
                className={cn("flex items-start gap-3 rounded-xl px-3 py-3 transition-colors", isCurrent ? "bg-brand-50" : "hover:bg-muted")}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold tabular-nums",
                    isDone ? "bg-brand-600 text-white" : isCurrent ? "bg-white text-brand-700 ring-2 ring-brand-500" : "bg-canvas text-ink-500 ring-1 ring-line",
                  )}
                >
                  {isDone ? <Icon name="check" className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm leading-6", isCurrent ? "font-bold text-brand-800" : "font-medium text-ink-800")}>{l.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                    {isCurrent && <span className="font-semibold text-brand-700">الآن ·</span>}
                    {formatDuration(l.durationMinutes)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function VideoPlayer({ lesson }: { lesson: LearnLesson }) {
  const [state, setState] = useState<"idle" | "playing" | "error">("idle");

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-950 sm:rounded-2xl">
      {lesson.videoUrl && state === "playing" ? (
        <video src={lesson.videoUrl} controls autoPlay playsInline className="size-full" onError={() => setState("error")}>
          <track kind="captions" />
        </video>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,var(--color-brand-900),var(--color-ink-950))]">
          {!lesson.videoUrl ? (
            <p className="px-6 text-center text-sm text-white/70">هذا الدرس بدون فيديو — المحتوى المكتوب بالأسفل.</p>
          ) : state === "error" ? (
            <div className="px-6 text-center text-white/80">
              <Icon name="alert" className="mx-auto size-7" />
              <p className="mt-3 text-sm">تعذّر تشغيل الفيديو. تحقّق من اتصالك ثم حاول مرة أخرى.</p>
              <button type="button" onClick={() => setState("playing")} className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setState("playing")} aria-label={`تشغيل ${lesson.title}`} className="group grid place-items-center gap-4">
              <span className="grid size-20 place-items-center rounded-full bg-white text-brand-700 shadow-float transition-transform group-hover:scale-105">
                <Icon name="play" className="size-9" />
              </span>
              <span className="text-sm font-semibold text-white/80">{formatDuration(lesson.durationMinutes)}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
