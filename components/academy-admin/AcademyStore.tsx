"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/dashboard/Toaster";
import { hasFeature, type GatedFeature } from "@/lib/academy-admin/plan";
import { codePrefix, makeCode } from "@/lib/academy-admin/codes";
import type {
  AcademyProfile,
  AcademySeed,
  CodeStatus,
  CourseStatus,
  DashActivity,
  DashActivityKind,
  DashCourse,
  DashLesson,
  DashStudent,
  EnrollmentCode,
  Exam,
  ExamStatus,
  MediaItem,
  StudentStatus,
  WebsiteContent,
} from "@/lib/academy-admin/types";

/**
 * Client-side state for one academy's dashboard, seeded by the server layout.
 * Every mutation is a single function here; wiring the owner-scoped API means
 * replacing these bodies with fetch calls — the screens stay the same.
 */

export type CourseInput = Pick<DashCourse, "title" | "description" | "content" | "thumbnailUrl" | "status">;
export type LessonInput = Omit<DashLesson, "id" | "courseId" | "order">;
export type ExamInput = Omit<Exam, "id" | "createdAt">;

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();

function useAcademyState(seed: AcademySeed) {
  const notify = useToast();
  const [profile, setProfile] = useState(seed.profile);
  const [courses, setCourses] = useState(seed.courses);
  const [lessons, setLessons] = useState(seed.lessons);
  const [students, setStudents] = useState(seed.students);
  const [codes, setCodes] = useState(seed.codes);
  const [exams, setExams] = useState(seed.exams);
  const [submissions] = useState(seed.submissions);
  const [website, setWebsite] = useState(seed.website);
  const [media, setMedia] = useState(seed.media);
  const [activity, setActivity] = useState(seed.activity);

  return useMemo(() => {
    const log = (kind: DashActivityKind, message: string) =>
      setActivity((prev) => [{ id: newId("act"), kind, message, at: now() } satisfies DashActivity, ...prev]);

    const courseById = (id: string) => courses.find((c) => c.id === id);
    const lessonsOf = (courseId: string) => lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
    const studentsIn = (courseId: string) => students.filter((s) => s.enrollments.some((e) => e.courseId === courseId));

    /** 0–100: completed lessons out of the course's current lessons. */
    const progressOf = (student: DashStudent, courseId: string) => {
      const ids = lessonsOf(courseId).map((l) => l.id);
      const enrollment = student.enrollments.find((e) => e.courseId === courseId);
      if (!enrollment || ids.length === 0) return 0;
      return Math.round((enrollment.completedLessonIds.filter((id) => ids.includes(id)).length / ids.length) * 100);
    };

    const renumber = (list: DashLesson[], courseId: string) => {
      const ordered = list.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
      const position = new Map(ordered.map((l, i) => [l.id, i + 1]));
      return list.map((l) => (position.has(l.id) ? { ...l, order: position.get(l.id)! } : l));
    };

    return {
      profile,
      courses,
      lessons,
      students,
      codes,
      exams,
      submissions,
      website,
      media,
      activity,
      notify,

      can: (feature: GatedFeature) => hasFeature(profile.plan, feature),
      courseById,
      lessonsOf,
      studentsIn,
      progressOf,
      studentById: (id: string) => students.find((s) => s.id === id),
      examById: (id: string) => exams.find((e) => e.id === id),
      submissionsOf: (examId: string) => submissions.filter((s) => s.examId === examId),

      /* Courses */
      createCourse(input: CourseInput) {
        const course: DashCourse = {
          id: newId("c"),
          slug: newId("course"),
          tint: ["#dbe4ff", "#d1fae5", "#fde68a", "#fbcfe8"][courses.length % 4],
          createdAt: now(),
          ...input,
        };
        setCourses((prev) => [course, ...prev]);
        log("course", `تم إنشاء دورة «${course.title}»`);
        return course;
      },
      updateCourse(id: string, input: CourseInput) {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...input } : c)));
        log("course", `تم تحديث دورة «${input.title}»`);
      },
      setCourseStatus(id: string, status: CourseStatus) {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        log("course", `تم ${status === "PUBLISHED" ? "نشر" : "إلغاء نشر"} «${courseById(id)?.title}»`);
      },
      /** Removes the course with its lessons, unused codes and exams; students lose the enrollment. */
      deleteCourse(id: string) {
        log("course", `تم حذف دورة «${courseById(id)?.title}»`);
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setLessons((prev) => prev.filter((l) => l.courseId !== id));
        setCodes((prev) => prev.filter((c) => c.courseId !== id));
        setExams((prev) => prev.filter((e) => e.courseId !== id));
        setStudents((prev) => prev.map((s) => ({ ...s, enrollments: s.enrollments.filter((e) => e.courseId !== id) })));
      },

      /* Lessons */
      createLesson(courseId: string, input: LessonInput) {
        const lesson: DashLesson = { id: newId("l"), courseId, order: lessonsOf(courseId).length + 1, ...input };
        setLessons((prev) => [...prev, lesson]);
        log("lesson", `تمت إضافة درس «${lesson.title}»`);
        return lesson;
      },
      updateLesson(id: string, input: LessonInput) {
        setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...input } : l)));
      },
      deleteLesson(id: string) {
        const lesson = lessons.find((l) => l.id === id);
        if (!lesson) return;
        setLessons((prev) => renumber(prev.filter((l) => l.id !== id), lesson.courseId));
        log("lesson", `تم حذف درس «${lesson.title}»`);
      },
      /** Moves a lesson to a new 0-based index within its course. */
      moveLesson(id: string, toIndex: number) {
        setLessons((prev) => {
          const lesson = prev.find((l) => l.id === id);
          if (!lesson) return prev;
          const ordered = prev.filter((l) => l.courseId === lesson.courseId).sort((a, b) => a.order - b.order);
          const from = ordered.findIndex((l) => l.id === id);
          const to = Math.max(0, Math.min(ordered.length - 1, toIndex));
          if (from === to) return prev;
          ordered.splice(to, 0, ordered.splice(from, 1)[0]);
          const position = new Map(ordered.map((l, i) => [l.id, i + 1]));
          return prev.map((l) => (position.has(l.id) ? { ...l, order: position.get(l.id)! } : l));
        });
      },

      /* Students */
      setStudentStatus(id: string, status: StudentStatus) {
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      },
      enrollStudent(studentId: string, courseId: string) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId && !s.enrollments.some((e) => e.courseId === courseId)
              ? { ...s, enrollments: [...s.enrollments, { courseId, enrolledAt: now(), completedLessonIds: [] }] }
              : s,
          ),
        );
        const student = students.find((s) => s.id === studentId);
        log("enrollment", `تم تسجيل ${student?.name} في «${courseById(courseId)?.title}»`);
      },
      unenrollStudent(studentId: string, courseId: string) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, enrollments: s.enrollments.filter((e) => e.courseId !== courseId) } : s)),
        );
      },

      /* Enrollment codes */
      generateCodes(courseId: string, count: number, expiresAt?: string) {
        const existing = new Set(codes.map((c) => c.code));
        const batchId = newId("b");
        const created: EnrollmentCode[] = [];
        const prefix = codePrefix(profile.slug);
        while (created.length < count) {
          const code = makeCode(prefix, Math.random);
          if (existing.has(code)) continue;
          existing.add(code);
          created.push({ id: newId("code"), code, courseId, status: "UNUSED", batchId, createdAt: now(), expiresAt });
        }
        setCodes((prev) => [...created, ...prev]);
        log("codes", `تم توليد ${count} كود لدورة «${courseById(courseId)?.title}»`);
        return created;
      },
      setCodesStatus(ids: string[], status: Extract<CodeStatus, "UNUSED" | "DISABLED">) {
        const set = new Set(ids);
        // Used codes stay used: they're history, not inventory.
        setCodes((prev) => prev.map((c) => (set.has(c.id) && c.status !== "USED" ? { ...c, status } : c)));
      },
      deleteCodes(ids: string[]) {
        const set = new Set(ids);
        setCodes((prev) => prev.filter((c) => !(set.has(c.id) && c.status !== "USED")));
      },

      /* Exams */
      createExam(input: ExamInput) {
        const exam: Exam = { id: newId("e"), createdAt: now(), ...input };
        setExams((prev) => [exam, ...prev]);
        log("exam", `تم إنشاء اختبار «${exam.title}»`);
        return exam;
      },
      updateExam(id: string, input: ExamInput) {
        setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...input } : e)));
      },
      setExamStatus(id: string, status: ExamStatus) {
        setExams((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
        const verb = { PUBLISHED: "نشر", DRAFT: "إلغاء نشر", CLOSED: "إغلاق" }[status];
        log("exam", `تم ${verb} اختبار «${exams.find((e) => e.id === id)?.title}»`);
      },
      deleteExam(id: string) {
        setExams((prev) => prev.filter((e) => e.id !== id));
      },

      /* Website, media, settings */
      updateWebsite(next: WebsiteContent) {
        setWebsite(next);
        log("website", "تم تحديث محتوى موقع الأكاديمية");
      },
      addMedia(item: Omit<MediaItem, "id" | "uploadedAt">) {
        setMedia((prev) => [{ ...item, id: newId("m"), uploadedAt: now() }, ...prev]);
      },
      deleteMedia(id: string) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      },
      updateProfile(next: AcademyProfile) {
        setProfile(next);
      },
    };
  }, [profile, courses, lessons, students, codes, exams, submissions, website, media, activity, notify]);
}

export type AcademyStore = ReturnType<typeof useAcademyState>;

const StoreContext = createContext<AcademyStore | null>(null);

export function useAcademy() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useAcademy must be used inside <AcademyStoreProvider>");
  return store;
}

export function AcademyStoreProvider({ seed, children }: { seed: AcademySeed; children: ReactNode }) {
  const store = useAcademyState(seed);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
