"use client";

import { BackLink, EmptyState, PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { dash } from "@/lib/academy-admin/meta";
import { useAcademy } from "../AcademyStore";
import { LessonForm } from "../LessonForm";

/** The page for adding a lesson to `courseId`, or editing `lessonId`. */
export function LessonFormView({ courseId, lessonId }: { courseId?: string; lessonId?: string }) {
  const { courseById, lessons, live } = useAcademy();
  const lesson = lessonId ? lessons.find((l) => l.id === lessonId) : undefined;
  const course = courseById(lesson?.courseId ?? courseId ?? "");

  // Without a backend lessons are edited in place on the lessons screen.
  if (!live || !course || (lessonId && !lesson)) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState
          icon="play"
          title={lessonId ? "الدرس غير موجود" : "اختر الدورة أولاً"}
          description={lessonId ? "ربما حُذف أو أن الرابط غير صحيح." : "الدروس تُضاف داخل الدورات."}
          action={<Button href={dash.lessons()} variant="secondary">العودة إلى الدروس</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader title={lesson ? "تعديل الدرس" : "درس جديد"} description={lesson ? lesson.title : `في دورة «${course.title}»`}>
        <BackLink href={dash.lessons(course.id)}>دروس {course.title}</BackLink>
      </PageHeader>
      <LessonForm key={lesson?.id ?? "new"} courseId={course.id} lesson={lesson} />
    </>
  );
}
