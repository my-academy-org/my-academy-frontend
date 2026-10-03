"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/dashboard/Toaster";
import { scoreOf, stateOf } from "@/lib/academy-admin/meta";
import type { CourseProgress, LearnCourse, StudentExam, StudentProfile, StudentSeed, Submission } from "@/lib/student/types";

/**
 * Client-side state for the signed-in student, seeded by the server layout.
 * Each mutation maps to one API call once the backend is connected.
 */

export type StudentExamState = "AVAILABLE" | "UPCOMING" | "COMPLETED" | "MISSED";

const now = () => new Date().toISOString();

function useStudentState(seed: StudentSeed) {
  const notify = useToast();
  const [profile, setProfile] = useState(seed.profile);
  const [courses, setCourses] = useState(seed.courses);
  const [progress, setProgress] = useState(seed.progress);
  const [attempts, setAttempts] = useState(seed.attempts);
  const [activity, setActivity] = useState(seed.activity);
  const [redeemable, setRedeemable] = useState(seed.redeemable);

  return useMemo(() => {
    const courseById = (id: string) => courses.find((c) => c.id === id);
    const progressOf = (courseId: string): CourseProgress => progress[courseId] ?? { completedLessonIds: [] };

    const percentOf = (courseId: string) => {
      const course = courseById(courseId);
      if (!course?.lessons.length) return 0;
      const done = progressOf(courseId).completedLessonIds.filter((id) => course.lessons.some((l) => l.id === id)).length;
      return Math.round((done / course.lessons.length) * 100);
    };

    /** Where to resume: the last opened lesson if unfinished, else the first incomplete one. */
    const resumeLesson = (courseId: string) => {
      const course = courseById(courseId);
      if (!course?.lessons.length) return undefined;
      const p = progressOf(courseId);
      const last = course.lessons.find((l) => l.id === p.lastLessonId);
      if (last && !p.completedLessonIds.includes(last.id)) return last;
      return course.lessons.find((l) => !p.completedLessonIds.includes(l.id)) ?? last ?? course.lessons[0];
    };

    const attemptOf = (examId: string) => attempts.find((a) => a.examId === examId);

    const examStateOf = (exam: StudentExam): StudentExamState => {
      if (attemptOf(exam.id)) return "COMPLETED";
      const s = stateOf(exam);
      if (s === "SCHEDULED") return "UPCOMING";
      if (s === "CLOSED") return "MISSED";
      return "AVAILABLE";
    };

    const log = (kind: "lesson" | "exam" | "enrollment", message: string) =>
      setActivity((prev) => [{ id: `a-${Date.now()}`, kind, message, at: now() }, ...prev]);

    return {
      academy: seed.academy,
      profile,
      courses,
      exams: seed.exams,
      attempts,
      activity,
      notify,

      courseById,
      progressOf,
      percentOf,
      resumeLesson,
      attemptOf,
      examStateOf,
      resultOf: (exam: StudentExam) => {
        const a = attemptOf(exam.id);
        return a ? { attempt: a, ...scoreOf(exam, a.answers) } : undefined;
      },
      /** Courses ordered by most recently studied. */
      recentCourses: () =>
        [...courses].sort((a, b) => (progressOf(b.id).lastAccessedAt ?? b.enrolledAt).localeCompare(progressOf(a.id).lastAccessedAt ?? a.enrolledAt)),

      openLesson(courseId: string, lessonId: string) {
        setProgress((prev) => {
          const p = prev[courseId] ?? { completedLessonIds: [] };
          if (p.lastLessonId === lessonId) return prev;
          return { ...prev, [courseId]: { ...p, lastLessonId: lessonId, lastAccessedAt: now() } };
        });
      },
      setLessonComplete(courseId: string, lessonId: string, complete: boolean) {
        setProgress((prev) => {
          const p = prev[courseId] ?? { completedLessonIds: [] };
          const ids = complete ? [...new Set([...p.completedLessonIds, lessonId])] : p.completedLessonIds.filter((id) => id !== lessonId);
          return { ...prev, [courseId]: { ...p, completedLessonIds: ids, lastAccessedAt: now() } };
        });
        if (complete) {
          const lesson = courseById(courseId)?.lessons.find((l) => l.id === lessonId);
          log("lesson", `أكملت درس «${lesson?.title}»`);
        }
      },
      submitExam(exam: StudentExam, answers: Record<string, string>, timeTaken: number): Submission {
        const attempt: Submission = { id: `att-${Date.now()}`, examId: exam.id, studentId: profile.id, submittedAt: now(), timeTaken, answers };
        setAttempts((prev) => [attempt, ...prev]);
        log("exam", `أنهيت «${exam.title}»`);
        return attempt;
      },
      /** Returns the unlocked course, or an error message. */
      redeemCode(raw: string): { course: LearnCourse } | { error: string } {
        const code = raw.trim().toUpperCase().replace(/\s+/g, "");
        if (!/^[A-Z]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return { error: "صيغة الكود غير صحيحة. مثال: ABC-1234-WXYZ" };
        const course = redeemable[code];
        if (!course) return { error: "الكود غير صالح أو مستخدم من قبل" };
        if (courses.some((c) => c.id === course.id)) return { error: "أنت مسجّل في هذه الدورة بالفعل" };
        const enrolled = { ...course, enrolledAt: now() };
        setCourses((prev) => [enrolled, ...prev]);
        setRedeemable((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== code)));
        log("enrollment", `فعّلت دورة «${course.title}»`);
        return { course: enrolled };
      },
      updateProfile(next: StudentProfile) {
        setProfile(next);
      },
    };
  }, [seed.academy, seed.exams, profile, courses, progress, attempts, activity, redeemable, notify]);
}

export type StudentStore = ReturnType<typeof useStudentState>;

const StoreContext = createContext<StudentStore | null>(null);

export function useStudent() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStudent must be used inside <StudentStoreProvider>");
  return store;
}

export function StudentStoreProvider({ seed, children }: { seed: StudentSeed; children: ReactNode }) {
  const store = useStudentState(seed);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
