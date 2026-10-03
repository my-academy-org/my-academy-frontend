import type { Plan } from "@/lib/academy/types";

/**
 * Plan gating. Both plans include the full teaching toolset (courses, lessons,
 * students, enrollment codes, exams). PRO adds direct control of the public
 * website; on BASIC the platform team edits website content on request.
 */
export type GatedFeature = "websiteEditor" | "mediaLibrary";

const planFeatures: Record<Plan, GatedFeature[]> = {
  BASIC: [],
  PRO: ["websiteEditor", "mediaLibrary"],
};

export const hasFeature = (plan: Plan, feature: GatedFeature) => planFeatures[plan].includes(feature);

export const featureInfo: Record<GatedFeature, { title: string; description: string }> = {
  websiteEditor: {
    title: "تحرير محتوى الموقع مباشرةً",
    description: "عدّل الصفحة الرئيسية ونبذة الأكاديمية وبيانات المعلّم والتواصل بنفسك، وتظهر التغييرات فوراً.",
  },
  mediaLibrary: {
    title: "مكتبة الوسائط",
    description: "مكان واحد لصورك وملفاتك تستخدمه في الدروس وموقع الأكاديمية.",
  },
};

export const planLabels: Record<Plan, string> = { BASIC: "Basic", PRO: "Pro" };
