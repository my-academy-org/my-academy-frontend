import { getTemplate } from "@/components/academy/templates/registry";
import { buildAcademySeed } from "@/lib/academy-admin/seed";
import type { AcademySeed, DashCourse, DashStudent } from "@/lib/academy-admin/types";
import type { AcademySite } from "@/lib/academy/types";
import type { LearnCourse, StudentActivity, StudentSeed } from "./types";

/**
 * Sample student session for an academy, derived from the same data the owner
 * sees in their dashboard (so enrollments, codes and results line up).
 *
 * Replace with: GET {ACADEMY_API_URL}/academies/{slug}/me — scoped to the signed-in student.
 */

const DAY = 86_400_000;

/** Picks a student who shows every state: progress in several courses, a past result and an exam still to take. */
function pickStudent(seed: AcademySeed): DashStudent | undefined {
  const open = seed.exams.find((e) => e.id === "e-1");
  const took = (s: DashStudent, examId: string) => seed.submissions.some((x) => x.studentId === s.id && x.examId === examId);
  const score = (s: DashStudent) =>
    (open && s.enrollments.some((e) => e.courseId === open.courseId) && !took(s, open.id) ? 4 : 0) +
    (took(s, "e-0") ? 2 : 0) +
    s.enrollments.length +
    s.enrollments.filter((e) => e.completedLessonIds.length > 0).length;
  return seed.students
    .filter((s) => s.status === "ACTIVE")
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))[0];
}

export function buildStudentSeed(site: AcademySite): StudentSeed | null {
  const seed = buildAcademySeed(site);
  const student = pickStudent(seed);
  if (!student) return null;

  const instructor = site.landing.teacher.name;
  const toLearn = (c: DashCourse, enrolledAt: string): LearnCourse => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    tint: c.tint,
    instructor,
    enrolledAt,
    lessons: seed.lessons
      .filter((l) => l.courseId === c.id)
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        content: l.content,
        videoUrl: l.videoUrl,
        durationMinutes: l.durationMinutes,
        attachments: l.attachments,
      })),
  });

  // Only published courses are visible to students.
  const enrolled = student.enrollments
    .map((e) => ({ e, course: seed.courses.find((c) => c.id === e.courseId && c.status === "PUBLISHED") }))
    .filter((x) => x.course !== undefined);

  const courses = enrolled.map(({ e, course }) => toLearn(course!, e.enrolledAt));
  const lastActive = Date.parse(student.lastActiveAt ?? student.registeredAt);

  const progress = Object.fromEntries(
    enrolled.map(({ e }, i) => {
      const lessons = courses[i].lessons;
      const done = e.completedLessonIds.filter((id) => lessons.some((l) => l.id === id));
      const next = lessons.find((l) => !done.includes(l.id)) ?? lessons.at(-1);
      return [
        e.courseId,
        {
          completedLessonIds: done,
          lastLessonId: done.length ? next?.id : undefined,
          lastAccessedAt: done.length ? new Date(lastActive - i * 2 * DAY).toISOString() : undefined,
        },
      ];
    }),
  );

  const courseIds = new Set(courses.map((c) => c.id));
  const exams = seed.exams.filter((x) => courseIds.has(x.courseId) && x.status !== "DRAFT");
  const attempts = seed.submissions.filter((s) => s.studentId === student.id && exams.some((x) => x.id === s.examId));

  // A published course the student hasn't joined yet, unlockable with one of its unused codes.
  const redeemable: StudentSeed["redeemable"] = {};
  for (const c of seed.courses.filter((x) => x.status === "PUBLISHED" && !courseIds.has(x.id))) {
    for (const code of seed.codes.filter((x) => x.courseId === c.id && x.status === "UNUSED")) {
      redeemable[code.code] = toLearn(c, new Date().toISOString());
    }
  }

  const title = (id: string) => courses.find((c) => c.id === id)?.title ?? "";
  const activity: StudentActivity[] = [
    ...enrolled.map(({ e }) => ({ id: `a-en-${e.courseId}`, kind: "enrollment" as const, message: `فعّلت دورة «${title(e.courseId)}»`, at: e.enrolledAt })),
    ...attempts.map((a) => ({ id: `a-${a.id}`, kind: "exam" as const, message: `أنهيت «${exams.find((x) => x.id === a.examId)?.title}»`, at: a.submittedAt })),
    ...Object.entries(progress)
      .filter(([, p]) => p.lastAccessedAt)
      .map(([courseId, p]) => {
        const lesson = courses.find((c) => c.id === courseId)?.lessons.find((l) => p.completedLessonIds.at(-1) === l.id);
        return { id: `a-l-${courseId}`, kind: "lesson" as const, message: `أكملت درس «${lesson?.title}»`, at: p.lastAccessedAt! };
      }),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return {
    academy: {
      slug: site.tenant.slug,
      name: site.tenant.name,
      logoUrl: site.academy.logo?.url,
      accent: site.academy.brandColor ?? getTemplate(site.academy.template).defaultAccent,
      instructor,
    },
    profile: {
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      notifications: { newLessons: true, examReminders: true, results: true },
    },
    courses,
    progress,
    exams,
    attempts,
    activity,
    redeemable,
  };
}
