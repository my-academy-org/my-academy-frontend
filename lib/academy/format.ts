import type { Course, Step } from "./types";

/** Arabic count + noun agreement: 1 درس، 2 درسان، 3–10 دروس، 11+ درساً */
function arabicCount(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

export const formatLessons = (n: number) => arabicCount(n, "درس واحد", "درسان", "دروس", "درساً");
export const formatExams = (n: number) => arabicCount(n, "اختبار واحد", "اختباران", "اختبارات", "اختباراً");
export const formatHours = (n: number) => arabicCount(n, "ساعة واحدة", "ساعتان", "ساعات", "ساعة");
export const formatYears = (n: number) => arabicCount(n, "سنة واحدة", "سنتان", "سنوات", "سنة");
export const formatCourses = (n: number) => arabicCount(n, "دورة واحدة", "دورتان", "دورات", "دورة");

export function formatMinutes(min?: number) {
  if (!min) return undefined;
  return `${min} د`;
}

export function totalLessons(courses: Course[]) {
  return courses.reduce((sum, c) => sum + c.lessonCount, 0);
}

/** Paragraphs from a multi-line string coming from the CMS. */
export function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function initials(name: string) {
  const words = name.replace(/^(أ\.|م\.|د\.)\s*/, "").trim().split(/\s+/);
  return words[0]?.[0] ?? "";
}

/** How learning works on every My Academy academy — used when the teacher hasn't customised it. */
export const DEFAULT_LEARNING_STEPS: Step[] = [
  { title: "أنشئ حسابك", description: "سجّل حساب طالب في الأكاديمية خلال أقل من دقيقة." },
  { title: "فعّل دورتك", description: "أدخل كود التسجيل الذي تحصل عليه لتفعيل الدورة." },
  { title: "تعلّم بالترتيب", description: "شاهد الدروس بالترتيب وراجعها في أي وقت." },
  { title: "اختبر وتابع تقدّمك", description: "أدِّ الاختبارات وتابع نتائجك ونسبة إنجازك." },
];

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const whatsappHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

/** 12 → ١٢ (used for formal numbering in the Academic template). */
export const arabicDigits = (n: number | string) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export const totalExams = (courses: Course[]) => courses.reduce((sum, c) => sum + (c.examCount ?? 0), 0);

/** Courses grouped by category, preserving order. */
export function groupByCategory(courses: Course[], fallback = "مقررات أخرى") {
  const groups = new Map<string, Course[]>();
  for (const c of courses) {
    const key = c.category ?? fallback;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}
