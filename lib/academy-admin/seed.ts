import type { AcademySite } from "@/lib/academy/types";
import { codePrefix, makeCode } from "./codes";
import type {
  AcademySeed,
  DashActivity,
  DashCourse,
  DashLesson,
  DashStudent,
  EnrollmentCode,
  Exam,
  Question,
  Submission,
} from "./types";

/**
 * Sample dashboard data for an academy, derived from its public site so the
 * dashboard and the website show the same courses. Deterministic (seeded by the
 * slug and a fixed clock) so server and client render identical markup.
 *
 * Replace with: GET {ACADEMY_API_URL}/academies/{slug}/dashboard (owner-scoped).
 */

const NOW = Date.parse("2026-10-02T09:00:00Z");
const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString();

function rng(seedText: string) {
  let h = 1779033703;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const TINTS = ["#dbe4ff", "#d1fae5", "#fde68a", "#fbcfe8", "#e0e7ff", "#ccfbf1"];

const FIRST = ["محمد", "سارة", "عمر", "نور", "يوسف", "مريم", "خالد", "ليلى", "أحمد", "هدى", "علي", "ريم", "حسن", "دينا", "طارق", "جنى", "زياد", "فاطمة", "كريم", "سلمى", "مازن", "رنا", "إياد", "لمى", "باسل", "تالا", "فارس", "منى", "سامي", "آية"];
const LAST = ["الأحمد", "إبراهيم", "سعيد", "حسين", "منصور", "عبدالله", "الشريف", "يوسف", "القاسم", "ناصر", "حمدان", "السيد"];
const EMAIL_FIRST = ["mohamed", "sara", "omar", "nour", "yousef", "mariam", "khaled", "laila", "ahmed", "huda", "ali", "reem", "hassan", "dina", "tarek", "jana", "ziad", "fatma", "karim", "salma", "mazen", "rana", "eyad", "lama", "basel", "tala", "fares", "mona", "sami", "aya"];

/* ------------------------------------------------------------------ */
/* Question banks per sample academy                                   */
/* ------------------------------------------------------------------ */

type Q = [text: string, choices: string[], correct: number];

const banks: Record<string, Q[]> = {
  ahmed: [
    ["أي كلمة تُستخدم لتعريف متغيّر لا تتغيّر قيمته؟", ["let", "var", "const", "static"], 2],
    ["ما ناتج typeof [] في JavaScript؟", ["array", "object", "list", "undefined"], 1],
    ["أي دالة تضيف عنصراً إلى نهاية المصفوفة؟", ["push()", "pop()", "shift()", "concat()"], 0],
    ["ما الفرق بين == و === ؟", ["لا فرق", "=== تقارن القيمة والنوع", "== أسرع دائماً", "=== للنصوص فقط"], 1],
    ["أي حلقة تُنفَّذ مرة واحدة على الأقل؟", ["for", "while", "do...while", "for...of"], 2],
  ],
  mohamed: [
    ["وحدة قياس القوة في النظام الدولي هي:", ["الجول", "النيوتن", "الواط", "الباسكال"], 1],
    ["التسارع هو معدّل تغيّر:", ["المسافة", "الإزاحة", "السرعة", "الكتلة"], 2],
    ["قانون نيوتن الثاني يُعبَّر عنه بالعلاقة:", ["F = m·a", "E = m·c²", "P = F/A", "V = I·R"], 0],
    ["إذا تضاعفت كتلة جسم مع ثبات القوة فإن تسارعه:", ["يتضاعف", "يقل للنصف", "يبقى ثابتاً", "ينعدم"], 1],
    ["الشغل كمية:", ["متجهة", "قياسية", "لا بُعدية", "متجهة دائماً موجبة"], 1],
  ],
  ali: [
    ["Choose the correct sentence:", ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."], 2],
    ["The opposite of “increase” is:", ["raise", "decrease", "expand", "grow"], 1],
    ["“I look forward to ___ from you.”", ["hear", "hearing", "heard", "be hearing"], 1],
    ["Which is a formal email closing?", ["Cheers", "See ya", "Kind regards", "Later"], 2],
    ["IELTS Writing Task 2 should be at least:", ["150 words", "200 words", "250 words", "300 words"], 2],
  ],
};

function genericBank(courseTitle: string): Q[] {
  return [
    [`ما الهدف الرئيسي من دورة «${courseTitle}»؟`, ["بناء أساس متين في الموضوع", "الحفظ دون فهم", "لا يوجد هدف محدد", "الترفيه فقط"], 0],
    ["أفضل طريقة للاستفادة من الدروس هي:", ["المشاهدة السريعة", "التطبيق بعد كل درس", "تخطّي التمارين", "مشاهدة الملخّص فقط"], 1],
    ["متى يُنصح بأداء الاختبار؟", ["قبل بدء الدورة", "بعد إنهاء دروس الوحدة", "دون مراجعة", "في أي وقت عشوائي"], 1],
  ];
}

function toQuestions(prefix: string, bank: Q[]): Question[] {
  return bank.map(([text, choices, correct], qi) => ({
    id: `${prefix}-q${qi + 1}`,
    text,
    choices: choices.map((c, ci) => ({ id: `${prefix}-q${qi + 1}-c${ci + 1}`, text: c })),
    correctChoiceId: `${prefix}-q${qi + 1}-c${correct + 1}`,
    points: 1,
  }));
}

/* ------------------------------------------------------------------ */

export function buildAcademySeed(site: AcademySite): AcademySeed {
  const { slug } = site.tenant;
  const random = rng(slug);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

  /* Courses: the public ones are published; the last one is kept as a draft when there are several. */
  const courses: DashCourse[] = site.courses.map((c, i) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.shortDescription,
    content: [c.description, c.outcomes?.length ? `ماذا ستتعلّم:\n${c.outcomes.map((o) => `• ${o}`).join("\n")}` : ""]
      .filter(Boolean)
      .join("\n\n"),
    thumbnailUrl: c.image?.url,
    tint: TINTS[i % TINTS.length],
    status: site.courses.length > 3 && i === site.courses.length - 1 ? "DRAFT" : "PUBLISHED",
    createdAt: iso(NOW - (150 - i * 25) * DAY),
  }));

  /* Lessons: from the public curriculum, or a short generic outline. */
  const lessons: DashLesson[] = site.courses.flatMap((c) => {
    const source = c.curriculum?.flatMap((s) => s.lessons) ?? [];
    const list = source.length
      ? source.map((l) => ({ id: l.id, title: l.title, minutes: l.durationMinutes ?? 15, preview: !!l.isPreview }))
      : Array.from({ length: Math.min(c.lessonCount, 5) }, (_, i) => ({
          id: `${c.id}-l${i + 1}`,
          title: i === 0 ? `مقدمة دورة ${c.title}` : ["المفاهيم الأساسية", "أمثلة تطبيقية", "حلّ التمارين", "مراجعة الوحدة"][(i - 1) % 4],
          minutes: 12 + ((i * 7) % 20),
          preview: i === 0,
        }));
    return list.map((l, i) => ({
      id: l.id,
      courseId: c.id,
      title: l.title,
      description: "شرح مركّز مع مثال عملي في نهاية الدرس.",
      videoUrl: `https://videos.myacademy.com/${slug}/${l.id}.mp4`,
      content: "",
      attachments: i % 3 === 0 ? [{ id: `${l.id}-a1`, name: `ملخّص-${i + 1}.pdf`, sizeKb: 240 + i * 30 }] : [],
      durationMinutes: l.minutes,
      order: i + 1,
      isPreview: l.preview,
    }));
  });

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const lessonIds = (courseId: string) => lessons.filter((l) => l.courseId === courseId).map((l) => l.id);
  const prefix = codePrefix(slug);

  /* Students and their enrollments. */
  const studentCount = 26 + Math.floor(random() * 10);
  const codes: EnrollmentCode[] = [];
  const students: DashStudent[] = Array.from({ length: studentCount }, (_, i) => {
    const fi = (i * 7 + slug.length) % FIRST.length;
    const registered = NOW - Math.floor(2 + random() * 120) * DAY - Math.floor(random() * DAY);
    const courseCount = 1 + Math.floor(random() * Math.min(3, published.length));
    const chosen = [...published].sort(() => random() - 0.5).slice(0, courseCount);
    const id = `s-${i + 1}`;
    return {
      id,
      name: `${FIRST[fi]} ${pick(LAST)}`,
      email: `${EMAIL_FIRST[fi]}${i + 3}@example.com`,
      phone: random() > 0.4 ? `+20 10${Math.floor(random() * 10)} ${String(1000000 + Math.floor(random() * 8999999)).replace(/(\d{3})(\d{4})/, "$1 $2")}` : undefined,
      status: i % 13 === 7 ? "SUSPENDED" : "ACTIVE",
      registeredAt: iso(registered),
      lastActiveAt: iso(Math.min(NOW, registered + Math.floor(random() * 90) * DAY)),
      enrollments: chosen.map((c) => {
        const ids = lessonIds(c.id);
        const done = ids.slice(0, Math.floor(random() * (ids.length + 1)));
        const enrolledAt = registered + Math.floor(random() * 3) * DAY;
        const code = makeCode(prefix, random);
        codes.push({
          id: `code-${codes.length + 1}`,
          code,
          courseId: c.id,
          status: "USED",
          batchId: `b-${c.id}-1`,
          createdAt: iso(registered - 5 * DAY),
          usedByStudentId: id,
          usedAt: iso(enrolledAt),
        });
        return { courseId: c.id, enrolledAt: iso(enrolledAt), code, completedLessonIds: done };
      }),
    };
  });

  /* Unused codes still waiting to be handed out, plus a few disabled ones. */
  published.forEach((c, ci) => {
    const batch = `b-${c.id}-2`;
    for (let k = 0; k < 8 + ci * 2; k++) {
      codes.push({
        id: `code-${codes.length + 1}`,
        code: makeCode(prefix, random),
        courseId: c.id,
        status: k === 0 && ci === 1 ? "DISABLED" : "UNUSED",
        batchId: batch,
        createdAt: iso(NOW - (6 + ci) * DAY),
        expiresAt: ci === 0 ? iso(NOW + 60 * DAY) : undefined,
      });
    }
  });

  /* Exams: one finished and one running (both with submissions), one scheduled, one draft. */
  const bank = banks[slug];
  const exams: Exam[] = [];
  const submissions: Submission[] = [];
  if (published[0]) {
    exams.push({
      id: "e-1",
      title: `اختبار الوحدة الأولى — ${published[0].title}`,
      description: "يغطي دروس الوحدة الأولى. اقرأ كل سؤال بعناية قبل الإجابة.",
      courseId: published[0].id,
      durationMinutes: 20,
      passingScore: 60,
      status: "PUBLISHED",
      createdAt: iso(NOW - 30 * DAY),
      questions: toQuestions("e-1", bank ?? genericBank(published[0].title)),
    });
  }
  if (published[1]) {
    exams.push({
      id: "e-2",
      title: `الاختبار الشامل — ${published[1].title}`,
      description: "اختبار نهائي على كامل محتوى الدورة.",
      courseId: published[1].id,
      durationMinutes: 45,
      passingScore: 70,
      status: "PUBLISHED",
      opensAt: iso(NOW + 4 * DAY + 8 * 3_600_000),
      createdAt: iso(NOW - 3 * DAY),
      questions: toQuestions("e-2", (bank ?? genericBank(published[1].title)).slice(0, 3)),
    });
  }
  if (published[0]) {
    exams.push({
      id: "e-0",
      title: `اختبار تحديد المستوى — ${published[0].title}`,
      description: "اختبار قصير في بداية الدورة لقياس معلوماتك السابقة.",
      courseId: published[0].id,
      durationMinutes: 10,
      passingScore: 50,
      status: "CLOSED",
      createdAt: iso(NOW - 60 * DAY),
      questions: toQuestions("e-0", (bank ?? genericBank(published[0].title)).slice(0, 3)),
    });
    exams.push({
      id: "e-3",
      title: `اختبار الوحدة الثانية — ${published[0].title}`,
      description: "",
      courseId: published[0].id,
      durationMinutes: 25,
      passingScore: 60,
      status: "DRAFT",
      createdAt: iso(NOW - 1 * DAY),
      questions: toQuestions("e-3", (bank ?? genericBank(published[0].title)).slice(2, 4)),
    });
  }

  // Most enrolled students sat the finished exam; about two thirds have taken the running one.
  const graded: [examId: string, share: number, daysAgo: [number, number]][] = [
    ["e-0", 0.85, [35, 55]],
    ["e-1", 0.7, [0, 20]],
  ];
  for (const [examId, share, [from, to]] of graded) {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) continue;
    students
      .filter((s) => s.status === "ACTIVE" && s.enrollments.some((e) => e.courseId === exam.courseId))
      .forEach((s) => {
        if (random() > share) return;
        const answers: Record<string, string> = {};
        for (const q of exam.questions) {
          answers[q.id] = random() < 0.72 ? q.correctChoiceId : pick(q.choices).id;
        }
        submissions.push({
          id: `sub-${submissions.length + 1}`,
          examId: exam.id,
          studentId: s.id,
          submittedAt: iso(NOW - (from + Math.floor(random() * (to - from))) * DAY - Math.floor(random() * DAY)),
          timeTaken: Math.max(3, Math.round(exam.durationMinutes * (0.35 + random() * 0.55))),
          answers,
        });
      });
  }

  /* Recent activity from the generated records. */
  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "";
  const activity: DashActivity[] = [
    ...students.flatMap((s) =>
      s.enrollments.map((e) => ({
        id: `act-en-${s.id}-${e.courseId}`,
        kind: "enrollment" as const,
        message: `${s.name} سجّل في «${courseTitle(e.courseId)}»`,
        at: e.enrolledAt,
      })),
    ),
    ...submissions.map((sub) => ({
      id: `act-${sub.id}`,
      kind: "submission" as const,
      message: `${students.find((s) => s.id === sub.studentId)?.name} أنهى «${exams.find((e) => e.id === sub.examId)?.title}»`,
      at: sub.submittedAt,
    })),
    { id: "act-codes", kind: "codes", message: `تم توليد ${8} أكواد جديدة لدورة «${published[0]?.title ?? ""}»`, at: iso(NOW - 6 * DAY) },
  ];
  activity.sort((a, b) => b.at.localeCompare(a.at));

  const { landing, academy } = site;
  return {
    profile: {
      slug,
      name: site.tenant.name,
      plan: site.tenant.plan,
      template: academy.template,
      brandColor: academy.brandColor,
      owner: { name: landing.teacher.name, email: academy.contact.email ?? `${slug}@example.com`, phone: academy.contact.phone },
      notifications: { newEnrollment: true, examSubmission: true, weeklySummary: true, productUpdates: false },
    },
    courses,
    lessons,
    students,
    codes,
    exams,
    submissions,
    website: {
      logoUrl: academy.logo?.url,
      hero: { eyebrow: landing.hero.eyebrow ?? "", title: landing.hero.title, description: landing.hero.description },
      about: { ...landing.about },
      instructor: {
        name: landing.teacher.name,
        title: landing.teacher.title ?? "",
        bio: landing.teacher.bio,
        experienceYears: landing.teacher.experienceYears,
      },
      contact: {
        email: academy.contact.email ?? "",
        phone: academy.contact.phone ?? "",
        whatsapp: academy.contact.whatsapp ?? "",
        address: academy.contact.address ?? "",
        workingHours: academy.contact.workingHours ?? "",
      },
      footerTagline: landing.footer.tagline ?? "",
      featuredCourseIds: site.courses.filter((c) => c.featured).map((c) => c.id),
    },
    media: [
      { id: "m-1", name: "hero-cover.jpg", kind: "image", sizeKb: 420, uploadedAt: iso(NOW - 40 * DAY) },
      { id: "m-2", name: "teacher-portrait.jpg", kind: "image", sizeKb: 310, uploadedAt: iso(NOW - 40 * DAY) },
      { id: "m-3", name: "intro-video.mp4", kind: "video", sizeKb: 48_200, uploadedAt: iso(NOW - 22 * DAY) },
      { id: "m-4", name: "course-syllabus.pdf", kind: "file", sizeKb: 180, uploadedAt: iso(NOW - 9 * DAY) },
    ],
    activity: activity.slice(0, 40),
  };
}

/**
 * A real owner's dashboard before any of its data comes from the API: the
 * academy's identity and the signed-in owner, with nothing invented — no
 * sample courses, students or exams.
 */
export function emptyAcademySeed(profile: Pick<AcademySeed["profile"], "slug" | "name" | "plan" | "template" | "owner">): AcademySeed {
  return {
    profile: { ...profile, notifications: { newEnrollment: true, examSubmission: true, weeklySummary: true, productUpdates: false } },
    courses: [],
    lessons: [],
    students: [],
    codes: [],
    exams: [],
    submissions: [],
    website: {
      hero: { eyebrow: "", title: "", description: "" },
      about: { title: "", description: "" },
      instructor: { name: profile.owner.name, title: "", bio: "" },
      contact: { email: "", phone: "", whatsapp: "", address: "", workingHours: "" },
      footerTagline: "",
      featuredCourseIds: [],
    },
    media: [],
    activity: [],
  };
}
