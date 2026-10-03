import type { IconName } from "@/components/ui/Icon";

export const ROOT_DOMAIN = "myacademy.com";

export const nav = [
  { label: "الرئيسية", href: "/#top" },
  { label: "كيف تعمل المنصة", href: "/#how-it-works" },
  { label: "المميزات", href: "/#features" },
  { label: "القوالب", href: "/#templates" },
  { label: "الأسعار", href: "/#pricing" },
  { label: "الأسئلة الشائعة", href: "/#faq" },
] as const;

/* ------------------------------------------------------------------ */
/* Platform lifecycle                                                  */
/* ------------------------------------------------------------------ */

export type Role = "admin" | "teacher" | "student";

export const roleLabels: Record<Role | "system", string> = {
  admin: "المشرف العام",
  teacher: "المعلّم",
  student: "الطالب",
  system: "المنصة",
};

export const lifecycle: {
  role: Role | "system";
  icon: IconName;
  title: string;
  body: string;
}[] = [
  {
    role: "admin",
    icon: "academy",
    title: "إنشاء الأكاديمية",
    body: "يُنشئ المشرف العام الأكاديمية وحساب المعلّم، ويحدّد النطاق الفرعي والقالب والخطة.",
  },
  {
    role: "teacher",
    icon: "teacher",
    title: "إدارة الأكاديمية",
    body: "يدير المعلّم دوراته ودروسه وأكواد التسجيل وطلابه من لوحة تحكم واحدة.",
  },
  {
    role: "student",
    icon: "users",
    title: "تسجيل الطلاب",
    body: "يسجّل الطلاب مباشرةً من موقع الأكاديمية على نطاقها الفرعي الخاص.",
  },
  {
    role: "student",
    icon: "play",
    title: "الوصول إلى الدورات",
    body: "يفعّل الطالب دوراته بكود التسجيل ويبدأ مشاهدة الدروس فوراً.",
  },
  {
    role: "system",
    icon: "progress",
    title: "متابعة الاختبارات والتقدّم",
    body: "تُسجَّل النتائج ونِسب الإنجاز تلقائياً ويتابعها المعلّم والطالب لحظياً.",
  },
];

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export type Feature = { icon: IconName; title: string; body: string; pro?: boolean };

export const features: Record<
  | "academy"
  | "courses"
  | "lessons"
  | "students"
  | "codes"
  | "exams"
  | "progress"
  | "landing"
  | "media"
  | "tenancy",
  Feature
> = {
  academy: {
    icon: "academy",
    title: "إدارة الأكاديمية",
    body: "تحكّم في هوية أكاديميتك بالكامل: الاسم والشعار والألوان والقالب والنطاق الفرعي والإعدادات العامة — من مكان واحد.",
  },
  courses: {
    icon: "book",
    title: "إدارة الدورات",
    body: "أنشئ دورات منظّمة بوصف وصورة غلاف، وتحكّم في نشرها وإتاحتها للطلاب.",
  },
  lessons: {
    icon: "play",
    title: "إدارة الدروس",
    body: "دروس فيديو ومرفقات ومحتوى نصي مرتّب داخل كل دورة، مع التحكّم في الترتيب والظهور.",
  },
  students: {
    icon: "users",
    title: "إدارة الطلاب",
    body: "سجلّ كامل لكل طالب: بياناته ودوراته المسجّل بها ونشاطه داخل الأكاديمية.",
  },
  codes: {
    icon: "ticket",
    title: "أكواد التسجيل",
    body: "ولّد أكواد تسجيل للدورات ووزّعها على طلابك، وتابع المستخدَم منها والمتاح.",
  },
  exams: {
    icon: "exam",
    title: "الاختبارات والنتائج",
    body: "اختبارات مرتبطة بالدورات والدروس مع تصحيح تلقائي وعرض فوري للنتائج.",
  },
  progress: {
    icon: "progress",
    title: "تقدّم الطلاب",
    body: "نسبة إنجاز كل طالب في كل دورة، لتعرف من يتقدّم ومن يحتاج إلى متابعة.",
  },
  landing: {
    icon: "layout",
    title: "تخصيص الصفحة الرئيسية",
    body: "عدّل محتوى الصفحة الرئيسية لأكاديميتك: العناوين والنبذة والدورات المميّزة.",
    pro: true,
  },
  media: {
    icon: "image",
    title: "إدارة الوسائط",
    body: "مكتبة مركزية للصور والملفات تستخدمها في الدروس وصفحة الأكاديمية.",
    pro: true,
  },
  tenancy: {
    icon: "layers",
    title: "بنية متعددة الأكاديميات",
    body: "كل أكاديمية معزولة ببياناتها وطلابها ونطاقها، على بنية تحتية واحدة قابلة للتوسّع.",
  },
};

/* ------------------------------------------------------------------ */
/* Academy templates                                                   */
/* ------------------------------------------------------------------ */

export type TemplateId = "modern" | "academic" | "premium";

export type SampleAcademy = {
  name: string;
  teacher: string;
  subject: string;
  subdomain: string;
};

export const templates: {
  id: TemplateId;
  name: string;
  arabicName: string;
  description: string;
  bestFor: string;
  palette: string[];
  sample: SampleAcademy;
}[] = [
  {
    id: "modern",
    name: "Modern",
    arabicName: "عصري",
    description: "تصميم خفيف وحيوي بمساحات واسعة وألوان مشرقة، يركّز على الدورات ويسهّل التسجيل.",
    bestFor: "الدورات التقنية والمهارية",
    palette: ["#2f5bea", "#eef2ff", "#0f172a"],
    sample: {
      name: "أكاديمية أحمد للبرمجة",
      teacher: "م. أحمد سامي",
      subject: "البرمجة وتطوير الويب",
      subdomain: "ahmed",
    },
  },
  {
    id: "academic",
    name: "Academic",
    arabicName: "أكاديمي",
    description: "طابع رصين وكلاسيكي بخطوط مدروسة وتنظيم واضح، يعكس الجدية والخبرة العلمية.",
    bestFor: "المواد الدراسية والمراكز التعليمية",
    palette: ["#1c2b4a", "#7a2232", "#f6f1e6"],
    sample: {
      name: "أكاديمية د. سارة للكيمياء",
      teacher: "د. سارة الحربي",
      subject: "الكيمياء للمرحلة الثانوية",
      subdomain: "dr-sara",
    },
  },
  {
    id: "premium",
    name: "Premium",
    arabicName: "فاخر",
    description: "حضور راقٍ بألوان داكنة ولمسات ذهبية، يبرز العلامة الشخصية للمعلّم وبرامجه المتقدمة.",
    bestFor: "العلامات الشخصية والبرامج المتقدمة",
    palette: ["#0f0f11", "#d4b483", "#f3eee4"],
    sample: {
      name: "أكاديمية النخبة للإنجليزية",
      teacher: "أ. ليلى منصور",
      subject: "اللغة الإنجليزية الاحترافية",
      subdomain: "elite",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Dashboards                                                          */
/* ------------------------------------------------------------------ */

export type DashboardRole = Exclude<Role, "admin">;

export const dashboardRoles: {
  id: DashboardRole;
  icon: IconName;
  title: string;
  summary: string;
  capabilities: string[];
}[] = [
  {
    id: "teacher",
    icon: "teacher",
    title: "لوحة المعلّم",
    summary: "كل ما يحتاجه المعلّم لإدارة أكاديميته اليومية.",
    capabilities: [
      "الدورات والدروس والاختبارات",
      "الطلاب وأكواد التسجيل",
      "متابعة النتائج وتقدّم الطلاب",
      "تحرير الصفحة الرئيسية والوسائط (Pro)",
    ],
  },
  {
    id: "student",
    icon: "student",
    title: "لوحة الطالب",
    summary: "تجربة تعلّم واضحة داخل أكاديمية المعلّم.",
    capabilities: [
      "الدورات المسجّل بها وتفعيل الأكواد",
      "مشاهدة الدروس بالترتيب",
      "أداء الاختبارات ومعرفة النتائج",
      "متابعة نسبة الإنجاز في كل دورة",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

export type PlanId = "basic" | "pro";

export const plans: {
  id: PlanId;
  name: string;
  tagline: string;
  /** Leave undefined until pricing is finalised — the card shows a "custom quote" label. */
  price?: string;
  featured?: boolean;
  includesLabel?: string;
  items: string[];
}[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "أكاديمية متكاملة وجاهزة، ويتولّى فريق المنصة تحديث محتوى موقعها نيابةً عنك.",
    items: [
      "لوحة تحكم المعلّم",
      "إدارة الطلاب",
      "الدورات",
      "الدروس",
      "أكواد التسجيل",
      "تعديلات المحتوى عبر فريق المنصة",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "تحكّم مباشر وكامل في محتوى أكاديميتك وصفحتها الرئيسية ووسائطها.",
    featured: true,
    includesLabel: "كل مميزات Basic، بالإضافة إلى:",
    items: [
      "إدارة المحتوى مباشرةً",
      "تحرير الصفحة الرئيسية",
      "إدارة الوسائط",
      "محتوى أكاديمية يديره المعلّم بنفسه",
    ],
  },
];

export const planComparison: { label: string; basic: string | boolean; pro: string | boolean }[] = [
  { label: "لوحة التحكم", basic: true, pro: true },
  { label: "الطلاب والدورات والدروس", basic: true, pro: true },
  { label: "أكواد التسجيل", basic: true, pro: true },
  { label: "تعديل محتوى الموقع", basic: "عبر فريق المنصة", pro: "مباشرةً من لوحتك" },
  { label: "تحرير الصفحة الرئيسية", basic: false, pro: true },
  { label: "إدارة الوسائط", basic: false, pro: true },
];

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

export const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "academy",
    title: "أنشئ أكاديميتك",
    body: "أرسل طلبك، ويُنشئ فريق My Academy أكاديميتك وحسابك ونطاقك الفرعي.",
  },
  {
    icon: "palette",
    title: "اختر القالب",
    body: "اختر بين Modern و Academic و Premium، وأضف شعارك وألوانك.",
  },
  {
    icon: "book",
    title: "أضف دوراتك وطلابك",
    body: "ارفع الدورات والدروس، وولّد أكواد التسجيل وشاركها مع طلابك.",
  },
  {
    icon: "rocket",
    title: "أطلق أكاديميتك",
    body: "أكاديميتك متاحة على نطاقها الخاص، والطلاب يسجّلون ويبدؤون التعلّم.",
  },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqs: { question: string; answer: string }[] = [
  {
    question: "ماذا يعني أن My Academy منصة متعددة الأكاديميات؟",
    answer:
      "تعمل جميع الأكاديميات على منصة واحدة، لكن كل أكاديمية مستقلة تماماً: لها معلّمها ونطاقها الفرعي وقالبها وطلابها ودوراتها وبياناتها الخاصة، ولا تتداخل مع أي أكاديمية أخرى.",
  },
  {
    question: "هل تحصل كل أكاديمية على نطاق فرعي خاص؟",
    answer: `نعم. تحصل كل أكاديمية على عنوان خاص بها مثل yourname.${ROOT_DOMAIN}، ويصل إليه طلابك مباشرةً للتسجيل والدخول ومتابعة الدورات.`,
  },
  {
    question: "ما القوالب المتاحة لموقع الأكاديمية؟",
    answer:
      "تتوفر ثلاثة قوالب احترافية: Modern و Academic و Premium. جميعها مصممة للعمل على الجوال والحاسوب، وتُخصَّص بشعارك وألوانك ومحتوى أكاديميتك.",
  },
  {
    question: "كيف يسجّل الطلاب في أكاديميتي؟",
    answer:
      "يتم تسجيل الطلاب من داخل موقع أكاديميتك نفسه، وليس من موقع My Academy. بعد التسجيل يفعّل الطالب الدورة بكود التسجيل الذي تزوّده به.",
  },
  {
    question: "ما الفرق بين خطة Basic وخطة Pro؟",
    answer:
      "تشمل الخطتان لوحة التحكم وإدارة الطلاب والدورات والدروس وأكواد التسجيل. في Basic يتولّى فريق المنصة تعديلات محتوى الموقع نيابةً عنك، أما في Pro فتدير المحتوى والصفحة الرئيسية والوسائط بنفسك مباشرةً.",
  },
  {
    question: "كيف أنضم كمعلّم؟ لا أجد صفحة تسجيل للمعلّمين.",
    answer:
      "لا يوجد تسجيل ذاتي للمعلّمين. أرسل طلب إنشاء أكاديمية، وسيتواصل معك فريقنا لإنشاء أكاديميتك وحسابك من لوحة المشرف العام وتسليمك بيانات الدخول.",
  },
  {
    question: "من يدير محتوى موقع الأكاديمية؟",
    answer:
      "يدير المعلّم دائماً الدورات والدروس والطلاب والأكواد. أما محتوى الموقع العام (الصفحة الرئيسية والوسائط) فيديره فريق المنصة في خطة Basic، ويديره المعلّم بنفسه في خطة Pro.",
  },
  {
    question: "هل بيانات طلابي منفصلة عن الأكاديميات الأخرى؟",
    answer:
      "نعم. البنية متعددة الأكاديميات تعزل بيانات كل أكاديمية، فلا يرى أي معلّم أو طالب بيانات أكاديمية أخرى.",
  },
];

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const footerColumns = [
  {
    title: "المنتج",
    links: [
      { label: "نظرة عامة", href: "/#platform" },
      { label: "المميزات", href: "/#features" },
      { label: "القوالب", href: "/#templates" },
      { label: "الأسعار", href: "/#pricing" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { label: "الأسئلة الشائعة", href: "/#faq" },
      { label: "تواصل معنا", href: "/#contact" },
      { label: "تسجيل الدخول", href: "/login" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الخصوصية", href: "/privacy" },
    ],
  },
];
