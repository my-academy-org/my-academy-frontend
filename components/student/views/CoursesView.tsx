"use client";

import Link from "next/link";
import { useState } from "react";
import { FilterTabs, Notice } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatLessons } from "@/lib/academy/format";
import { academyRoutes } from "@/lib/academy/nav";
import type { LearnCourse } from "@/lib/student/types";
import { CourseCard } from "../CourseCard";
import { CourseCover, ProgressRing } from "../parts";
import { RedeemCodeButton } from "../RedeemCode";
import { StartJourney } from "../StartJourney";
import { useStudent } from "../StudentStore";

type Filter = "ALL" | "ACTIVE" | "NEW" | "DONE";

export function CoursesView() {
  const { courses, available, loadError, recentCourses, percentOf, progressOf } = useStudent();
  const [filter, setFilter] = useState<Filter>("ALL");

  const stage = (id: string): Exclude<Filter, "ALL"> => {
    const pct = percentOf(id);
    if (pct === 100) return "DONE";
    return pct > 0 || progressOf(id).lastLessonId ? "ACTIVE" : "NEW";
  };
  const list = recentCourses().filter((c) => filter === "ALL" || stage(c.id) === filter);
  const count = (f: Exclude<Filter, "ALL">) => courses.filter((c) => stage(c.id) === f).length;

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink-950">دوراتي</h1>
          <p className="mt-1.5 text-ink-500">الدورات التي فعّلتها في الأكاديمية.</p>
        </div>
        <LearningPulse />
      </header>

      {loadError && (
        <Notice tone="warning" className="mb-6">
          تعذّر تحميل دوراتك: {loadError}
        </Notice>
      )}

      {courses.length === 0 ? (
        <StartJourney browseHref="#available-courses" />
      ) : (
        <>
          <div className="mb-6">
            <FilterTabs
              label="تصفية الدورات"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "ALL", label: "الكل", count: courses.length },
                { value: "ACTIVE", label: "قيد التعلّم", count: count("ACTIVE") },
                { value: "NEW", label: "لم تبدأ", count: count("NEW") },
                { value: "DONE", label: "مكتملة", count: count("DONE") },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <p className="rounded-2xl border border-line bg-white px-6 py-12 text-center text-sm text-ink-500">لا توجد دورات في هذا القسم.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </>
      )}

      {available.length > 0 && (
        <section aria-labelledby="available-courses" className="mt-12">
          <h2 id="available-courses" className="scroll-mt-24 text-xl font-extrabold text-ink-950">
            دورات متاحة للتفعيل
          </h2>
          <p className="mt-1 text-sm text-ink-500">دورات الأكاديمية التي لم تفعّلها بعد. تُفتح دروسها بكود التسجيل.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <LockedCourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/**
 * Where the student stands across all their courses, with one tap back into
 * the lesson to watch next: the most recently studied course that isn't finished.
 */
function LearningPulse() {
  const { courses, recentCourses, resumeLesson, progressOf } = useStudent();
  const completedIn = (c: LearnCourse) => progressOf(c.id).completedLessonIds.filter((id) => c.lessons.some((l) => l.id === id)).length;
  const total = courses.reduce((sum, c) => sum + c.lessons.length, 0);
  if (!total) return null;
  const done = courses.reduce((sum, c) => sum + completedIn(c), 0);
  const percent = Math.round((done / total) * 100);
  const course = recentCourses().find((c) => completedIn(c) < c.lessons.length);
  const lesson = course && resumeLesson(course.id);
  const frame = "flex items-center gap-3 rounded-2xl border border-line bg-white py-2 ps-2 pe-3 shadow-card sm:max-w-xs";

  const body = (
    <>
      <ProgressRing value={percent} size={52} stroke={5}>
        <span className="text-xs font-extrabold text-ink-950 tabular-nums">{percent}%</span>
      </ProgressRing>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-ink-500">
          أكملت {done} من {formatLessons(total)}
        </span>
        <span className="block truncate text-sm font-bold text-ink-950">{lesson ? <>تابع: {lesson.title}</> : "أنهيت كل دروسك، أحسنت!"}</span>
      </span>
      {lesson && (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-transform group-hover:scale-105">
          <Icon name="play" className="size-4" />
        </span>
      )}
    </>
  );

  return course && lesson ? (
    <Link href={academyRoutes.student.lesson(course.id, lesson.id)} className={cn(frame, "group transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-lift")}>
      {body}
    </Link>
  ) : (
    <div className={frame}>{body}</div>
  );
}

/** A published course the student isn't enrolled in: its outline is visible, its lessons aren't. */
function LockedCourseCard({ course }: { course: LearnCourse }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <CourseCover course={course} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.0625rem] leading-7 font-bold text-ink-950">{course.title}</h3>
        <p className="mt-0.5 text-sm text-ink-500">{course.instructor}</p>
        {course.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-600">{course.description}</p>}
        <p className="mt-3 text-xs text-ink-500">{course.lessons.length ? formatLessons(course.lessons.length) : "لم تُضف دروس بعد"}</p>
        <div className="mt-auto pt-4">
          <RedeemCodeButton label="فعّل بكود التسجيل" />
        </div>
      </div>
    </article>
  );
}
