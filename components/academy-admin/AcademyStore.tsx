"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/dashboard/Toaster";
import { deleteCourseAction, deleteLessonAction, reorderLessonsAction, saveCourseAction, saveLessonAction } from "@/lib/academy-admin/course-actions";
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
  LessonStatus,
  MediaItem,
  StudentStatus,
  WebsiteContent,
} from "@/lib/academy-admin/types";

/**
 * Client-side state for one academy's dashboard, seeded by the server layout.
 * Every mutation is a single function here. With a backend (`seed.live`),
 * courses and lessons are saved through the API first
 * (lib/academy-admin/course-actions.ts) and the state follows its answer; the
 * other sections are still local, as is everything in the demo.
 */

export type CourseInput = Pick<DashCourse, "title" | "description" | "content" | "thumbnailUrl" | "status">;
export type LessonInput = Omit<DashLesson, "id" | "courseId" | "order" | "savedOrder"> & {
  /** With a backend: the uploaded video — required to create, set on an edit only when replaced. */
  mediaId?: number;
  /** Length of that video, in seconds. */
  videoSeconds?: number;
};
/** Outcome of saving a course or lesson; `message` is ready to show. */
export type Saved<T = void> = { ok: true; data: T } | { ok: false; status: number; message: string };
export type ExamInput = Omit<Exam, "id" | "createdAt">;

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
const saved = <T,>(data: T): Saved<T> => ({ ok: true, data });
/** The API only takes a hosted image, never a local preview. */
const hostedUrl = (url?: string) => (url && /^https?:\/\//.test(url) ? url : undefined);
const byOrder = (a: DashLesson, b: DashLesson) => a.order - b.order;

function useAcademyState(seed: AcademySeed) {
  const notify = useToast();
  const live = !!seed.live;
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
    const lessonsOf = (courseId: string) => lessons.filter((l) => l.courseId === courseId).sort(byOrder);
    const studentsIn = (courseId: string) => students.filter((s) => s.enrollments.some((e) => e.courseId === courseId));

    /** 0–100: completed lessons out of the course's current lessons. */
    const progressOf = (student: DashStudent, courseId: string) => {
      const ids = lessonsOf(courseId).map((l) => l.id);
      const enrollment = student.enrollments.find((e) => e.courseId === courseId);
      if (!enrollment || ids.length === 0) return 0;
      return Math.round((enrollment.completedLessonIds.filter((id) => ids.includes(id)).length / ids.length) * 100);
    };

    const renumber = (list: DashLesson[], courseId: string) => {
      const ordered = list.filter((l) => l.courseId === courseId).sort(byOrder);
      const position = new Map(ordered.map((l, i) => [l.id, i + 1]));
      return list.map((l) => (position.has(l.id) ? { ...l, order: position.get(l.id)! } : l));
    };

    /** Moves a lesson of `list` to a 0-based index within its course; with a backend, saves every position that changed. */
    const move = async (list: DashLesson[], id: string, toIndex: number): Promise<Saved> => {
      const lesson = list.find((l) => l.id === id);
      if (!lesson) return saved(undefined);
      const ordered = list.filter((l) => l.courseId === lesson.courseId).sort(byOrder);
      const before = new Map(ordered.map((l) => [l.id, l.order]));
      const from = ordered.findIndex((l) => l.id === id);
      const to = Math.max(0, Math.min(ordered.length - 1, toIndex));
      if (from === to) return saved(undefined);
      ordered.splice(to, 0, ordered.splice(from, 1)[0]);
      const position = new Map(ordered.map((l, i) => [l.id, i + 1]));
      const place = (orders: Map<string, number>) => setLessons((prev) => prev.map((l) => (orders.has(l.id) ? { ...l, order: orders.get(l.id)! } : l)));
      place(position);
      if (!live) return saved(undefined);

      const changed = ordered.filter((l) => l.savedOrder !== position.get(l.id));
      const res = await reorderLessonsAction(changed.map((l) => ({ id: l.id, order: position.get(l.id)! })));
      if (!res.ok) {
        place(before);
        return res;
      }
      const stored = new Set(changed.map((l) => l.id));
      setLessons((prev) => prev.map((l) => (stored.has(l.id) ? { ...l, savedOrder: position.get(l.id) } : l)));
      return saved(undefined);
    };

    const patchCourse = async (id: string, fields: Parameters<typeof saveCourseAction>[1]): Promise<Saved> => {
      const res = await saveCourseAction(id, fields);
      if (!res.ok) return res;
      setCourses((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      return saved(undefined);
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
      live,

      can: (feature: GatedFeature) => hasFeature(profile.plan, feature),
      courseById,
      lessonsOf,
      studentsIn,
      progressOf,
      studentById: (id: string) => students.find((s) => s.id === id),
      examById: (id: string) => exams.find((e) => e.id === id),
      submissionsOf: (examId: string) => submissions.filter((s) => s.examId === examId),

      /* Courses */
      async createCourse(input: CourseInput): Promise<Saved<DashCourse>> {
        let course: DashCourse;
        if (live) {
          const res = await saveCourseAction(null, { title: input.title, description: input.description, imageUrl: hostedUrl(input.thumbnailUrl), status: input.status });
          if (!res.ok) return res;
          course = res.data;
        } else {
          course = {
            id: newId("c"),
            slug: newId("course"),
            tint: ["#dbe4ff", "#d1fae5", "#fde68a", "#fbcfe8"][courses.length % 4],
            createdAt: now(),
            ...input,
          };
        }
        setCourses((prev) => [course, ...prev]);
        log("course", `تم إنشاء دورة «${course.title}»`);
        return saved(course);
      },
      async updateCourse(id: string, input: CourseInput): Promise<Saved> {
        if (live) {
          const res = await patchCourse(id, { title: input.title, description: input.description, imageUrl: hostedUrl(input.thumbnailUrl), status: input.status });
          if (!res.ok) return res;
        } else {
          setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...input } : c)));
        }
        log("course", `تم تحديث دورة «${input.title}»`);
        return saved(undefined);
      },
      async setCourseStatus(id: string, status: CourseStatus): Promise<Saved> {
        if (live) {
          const res = await patchCourse(id, { status });
          if (!res.ok) return res;
        } else {
          setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        }
        const verb = { PUBLISHED: "نشر", DRAFT: "إلغاء نشر", ARCHIVED: "أرشفة" }[status];
        log("course", `تم ${verb} «${courseById(id)?.title}»`);
        return saved(undefined);
      },
      /**
       * Removes the course with its lessons, unused codes and exams; students lose the enrollment.
       * The API refuses (409) while any of those exist — archive the course instead.
       */
      async deleteCourse(id: string): Promise<Saved> {
        if (live) {
          const res = await deleteCourseAction(id);
          if (!res.ok) return res;
        }
        log("course", `تم حذف دورة «${courseById(id)?.title}»`);
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setLessons((prev) => prev.filter((l) => l.courseId !== id));
        setCodes((prev) => prev.filter((c) => c.courseId !== id));
        setExams((prev) => prev.filter((e) => e.courseId !== id));
        setStudents((prev) => prev.map((s) => ({ ...s, enrollments: s.enrollments.filter((e) => e.courseId !== id) })));
        return saved(undefined);
      },

      /* Lessons */
      /** Adds the lesson at `position` (1-based), or last. */
      async createLesson(courseId: string, input: LessonInput, position?: number): Promise<Saved<DashLesson>> {
        const { mediaId, videoSeconds, ...fields } = input;
        const siblings = lessonsOf(courseId);
        let lesson: DashLesson;
        if (live) {
          const res = await saveLessonAction(courseId, null, {
            title: fields.title,
            description: fields.description,
            content: fields.content,
            status: fields.status,
            mediaId,
            duration: videoSeconds,
            order: Math.max(0, ...siblings.map((l) => l.savedOrder ?? 0)) + 1,
          });
          if (!res.ok) return res;
          lesson = { ...res.data, order: siblings.length + 1 };
        } else {
          lesson = { id: newId("l"), courseId, order: siblings.length + 1, ...fields };
        }
        setLessons((prev) => [...prev, lesson]);
        log("lesson", `تمت إضافة درس «${lesson.title}»`);
        // The lesson exists either way; a failed move only leaves it last.
        if (position && position <= siblings.length) await move([...lessons, lesson], lesson.id, position - 1);
        return saved(lesson);
      },
      async updateLesson(id: string, input: LessonInput): Promise<Saved> {
        const { mediaId, videoSeconds, ...fields } = input;
        const current = lessons.find((l) => l.id === id);
        if (live && current) {
          const res = await saveLessonAction(current.courseId, id, {
            title: fields.title,
            description: fields.description,
            content: fields.content,
            status: fields.status,
            mediaId,
            duration: videoSeconds,
          });
          if (!res.ok) return res;
          setLessons((prev) => prev.map((l) => (l.id === id ? { ...res.data, order: l.order, savedOrder: l.savedOrder } : l)));
        } else {
          setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...fields } : l)));
        }
        return saved(undefined);
      },
      async setLessonStatus(id: string, status: LessonStatus): Promise<Saved> {
        const current = lessons.find((l) => l.id === id);
        if (live && current) {
          const res = await saveLessonAction(current.courseId, id, { status });
          if (!res.ok) return res;
        }
        setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        return saved(undefined);
      },
      /** The API refuses (409) while the lesson has student progress or exams — archive it instead. */
      async deleteLesson(id: string): Promise<Saved> {
        const lesson = lessons.find((l) => l.id === id);
        if (!lesson) return saved(undefined);
        if (live) {
          const res = await deleteLessonAction(id);
          if (!res.ok) return res;
        }
        setLessons((prev) => renumber(prev.filter((l) => l.id !== id), lesson.courseId));
        log("lesson", `تم حذف درس «${lesson.title}»`);
        return saved(undefined);
      },
      /** Moves a lesson to a new 0-based index within its course. */
      moveLesson: (id: string, toIndex: number) => move(lessons, id, toIndex),

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
  }, [live, profile, courses, lessons, students, codes, exams, submissions, website, media, activity, notify]);
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
