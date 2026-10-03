"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { academyRoutes } from "@/lib/academy/nav";
import type { LearnCourse } from "@/lib/student/types";
import { CourseCover, Meter } from "./parts";
import { useStudent } from "./StudentStore";

export function CourseCard({ course }: { course: LearnCourse }) {
  const { progressOf, percentOf, resumeLesson } = useStudent();
  const p = progressOf(course.id);
  const percent = percentOf(course.id);
  const done = p.completedLessonIds.filter((id) => course.lessons.some((l) => l.id === id)).length;
  const resume = resumeLesson(course.id);
  const last = course.lessons.find((l) => l.id === p.lastLessonId);
  const started = done > 0 || !!p.lastLessonId;
  const href = resume ? academyRoutes.student.lesson(course.id, resume.id) : undefined;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-lift">
      <Link href={href ?? "#"} tabIndex={-1} aria-hidden="true">
        <CourseCover course={course} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.0625rem] leading-7 font-bold text-ink-950">
          {href ? (
            <Link href={href} className="hover:text-brand-700">
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </h3>
        <p className="mt-0.5 text-sm text-ink-500">{course.instructor}</p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-ink-600">
              {done} من {course.lessons.length} دروس
            </span>
            <span className="font-bold text-ink-900 tabular-nums">{percent}%</span>
          </div>
          <Meter value={percent} label={`التقدّم في ${course.title}`} />
        </div>

        <p className="mt-3 min-h-10 text-xs leading-5 text-ink-500">
          {percent === 100 ? "أنهيت كل الدروس — يمكنك المراجعة في أي وقت." : last ? <>آخر درس: <span className="text-ink-700">{last.title}</span></> : "لم تبدأ بعد"}
        </p>

        <div className="mt-auto pt-4">
          {href ? (
            <Button href={href} variant={percent === 100 ? "secondary" : "primary"} className="w-full">
              {percent === 100 ? "مراجعة الدورة" : started ? "متابعة" : "ابدأ الدورة"}
            </Button>
          ) : (
            <p className="rounded-xl bg-canvas px-3 py-2.5 text-center text-sm text-ink-500">لم تُضف دروس بعد</p>
          )}
        </div>
      </div>
    </article>
  );
}
