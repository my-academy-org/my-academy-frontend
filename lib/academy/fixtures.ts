import type { AcademySite, Course } from "./types";

/**
 * Sample tenants used when no backend is configured (ACADEMY_API_URL unset).
 * They share one shape on purpose: any of them can be rendered by any template.
 */

const lessons = (prefix: string, titles: string[], preview = 1) =>
  titles.map((title, i) => ({
    id: `${prefix}-${i + 1}`,
    title,
    durationMinutes: 12 + ((i * 7) % 25),
    isPreview: i < preview,
  }));

/* ------------------------------------------------------------------ */

const ahmedCourses: Course[] = [
  {
    id: "c-js",
    slug: "javascript-basics",
    title: "أساسيات JavaScript",
    shortDescription: "ابدأ البرمجة من الصفر وافهم المتغيرات والدوال والمصفوفات بأمثلة عملية.",
    description:
      "دورة تأسيسية تأخذك من أول سطر كود حتى كتابة برامج تفاعلية حقيقية. نشرح كل مفهوم بمثال عملي، ثم نطبّقه في تمرين قصير واختبار في نهاية كل وحدة.",
    lessonCount: 24,
    examCount: 4,
    durationHours: 9,
    level: "مبتدئ",
    category: "البرمجة",
    featured: true,
    outcomes: [
      "كتابة برامج JavaScript صحيحة ومنظّمة",
      "التعامل مع المتغيرات والدوال والمصفوفات والكائنات",
      "فهم التحكم في سير البرنامج والحلقات",
      "التعامل مع صفحات الويب عبر DOM",
    ],
    requirements: ["جهاز حاسوب واتصال بالإنترنت", "لا يلزم أي خبرة برمجية سابقة"],
    curriculum: [
      { title: "البداية", lessons: lessons("js-a", ["مقدمة الدورة وتجهيز البيئة", "أول برنامج لك", "المتغيرات وأنواع البيانات"], 2) },
      { title: "المنطق والتحكم", lessons: lessons("js-b", ["العمليات والمقارنات", "الشروط if و switch", "الحلقات التكرارية"], 0) },
      { title: "الدوال والبيانات", lessons: lessons("js-c", ["الدوال", "المصفوفات", "الكائنات", "مشروع: قائمة المهام"], 0) },
    ],
  },
  {
    id: "c-react",
    slug: "react-from-scratch",
    title: "React من الصفر",
    shortDescription: "ابنِ واجهات حديثة بالمكوّنات والحالة والخطافات، مع مشروع متكامل.",
    description:
      "تعلّم بناء تطبيقات الويب الحديثة باستخدام React. نبدأ بالمكوّنات والخصائص ثم الحالة والخطافات، وننتهي بمشروع متكامل تنشره بنفسك.",
    lessonCount: 32,
    examCount: 5,
    durationHours: 14,
    level: "متوسط",
    category: "تطوير الواجهات",
    featured: true,
    outcomes: ["بناء مكوّنات قابلة لإعادة الاستخدام", "إدارة الحالة باستخدام الخطافات", "جلب البيانات من واجهات API", "نشر تطبيق كامل"],
    requirements: ["إتمام دورة أساسيات JavaScript أو ما يعادلها"],
    curriculum: [
      { title: "المكوّنات", lessons: lessons("re-a", ["لماذا React؟", "JSX والمكوّنات", "الخصائص Props"]) },
      { title: "الحالة والتفاعل", lessons: lessons("re-b", ["useState", "الأحداث والنماذج", "useEffect وجلب البيانات"], 0) },
    ],
  },
  {
    id: "c-html",
    slug: "html-css",
    title: "HTML و CSS للمبتدئين",
    shortDescription: "صمّم صفحات ويب متجاوبة وجميلة وافهم أساسيات التخطيط الحديث.",
    description: "أساس كل مطوّر ويب: هيكلة الصفحات بـ HTML وتنسيقها بـ CSS، مع Flexbox و Grid والتصميم المتجاوب.",
    lessonCount: 18,
    examCount: 3,
    durationHours: 7,
    level: "مبتدئ",
    category: "تطوير الواجهات",
    featured: true,
    outcomes: ["هيكلة صفحات ويب سليمة", "التخطيط بـ Flexbox و Grid", "تصميم متجاوب لكل الشاشات"],
  },
  {
    id: "c-git",
    slug: "git-github",
    title: "Git و GitHub",
    shortDescription: "أدر إصدارات مشاريعك واعمل مع فريق باحترافية.",
    description: "تعلّم إدارة الإصدارات والعمل الجماعي باستخدام Git و GitHub خطوة بخطوة.",
    lessonCount: 10,
    examCount: 1,
    durationHours: 3,
    level: "مبتدئ",
    category: "أدوات المطوّر",
  },
];

const ahmed: AcademySite = {
  tenant: { slug: "ahmed", name: "أكاديمية أحمد للبرمجة", plan: "PRO", status: "ACTIVE" },
  academy: {
    template: "MODERN",
    contact: {
      email: "hello@ahmed-academy.com",
      phone: "+20 100 000 0000",
      whatsapp: "+201000000000",
      workingHours: "يومياً من 10 صباحاً حتى 8 مساءً",
      socials: [
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
        { platform: "instagram", url: "https://instagram.com" },
      ],
    },
  },
  landing: {
    hero: {
      eyebrow: "دفعة جديدة متاحة الآن",
      title: "تعلّم البرمجة خطوة بخطوة حتى الاحتراف",
      description:
        "دورات عملية في البرمجة وتطوير الويب، بشرح واضح ومشاريع حقيقية واختبارات بعد كل وحدة لتتأكد أنك تتقدّم فعلاً.",
    },
    about: {
      title: "تعلّم بالتطبيق، لا بالحفظ",
      description:
        "كل درس في الأكاديمية مبني على مثال عملي تكتبه بنفسك. نؤمن أن البرمجة مهارة تُكتسب بالممارسة، لذلك صمّمنا المسار ليأخذك من الأساسيات إلى بناء مشاريع كاملة.",
    },
    teacher: {
      name: "م. أحمد سامي",
      title: "مهندس برمجيات ومدرّب تطوير ويب",
      bio: "مهندس برمجيات عمل على تطوير تطبيقات ويب لشركات ناشئة ومؤسسات، ويدرّس البرمجة بأسلوب عملي مبسّط يركّز على الفهم قبل الحفظ.",
      experienceYears: 9,
      qualifications: [
        { title: "بكالوريوس هندسة الحاسبات", institution: "جامعة القاهرة", year: "2015" },
        { title: "شهادة مطوّر واجهات احترافي", year: "2019" },
      ],
    },
    features: [
      { icon: "video", title: "دروس فيديو مركّزة", description: "دروس قصيرة وواضحة تشاهدها في أي وقت ومن أي جهاز." },
      { icon: "exam", title: "اختبار بعد كل وحدة", description: "تأكد من فهمك قبل الانتقال للخطوة التالية." },
      { icon: "progress", title: "تابع تقدّمك", description: "اعرف نسبة إنجازك في كل دورة لحظة بلحظة." },
      { icon: "materials", title: "ملفات ومشاريع", description: "أكواد المصدر والتمارين متاحة مع كل درس." },
    ],
    benefits: ["محتوى عربي واضح", "مشاريع عملية", "اختبارات دورية", "وصول من أي جهاز"],
    footer: { tagline: "دورات برمجة عملية باللغة العربية." },
  },
  courses: ahmedCourses,
};

/* ------------------------------------------------------------------ */

const mohamedCourses: Course[] = [
  {
    id: "p-mech",
    slug: "mechanics",
    title: "الميكانيكا: الحركة والقوى",
    shortDescription: "قوانين نيوتن والحركة الخطية والدائرية مع حل مسائل الامتحانات.",
    description:
      "مقرر متكامل يغطي وحدة الميكانيكا كاملة وفق المنهج، مع شرح نظري مبسّط وحل نماذج امتحانات السنوات السابقة.",
    lessonCount: 28,
    examCount: 6,
    durationHours: 18,
    level: "الصف الثالث الثانوي",
    category: "الفصل الدراسي الأول",
    featured: true,
    outcomes: ["فهم قوانين نيوتن وتطبيقاتها", "حل مسائل الحركة الخطية والدائرية", "التدرّب على نماذج الامتحانات"],
    requirements: ["أساسيات الرياضيات للمرحلة الثانوية"],
    curriculum: [
      { title: "الوحدة الأولى: الحركة الخطية", lessons: lessons("me-a", ["الإزاحة والسرعة", "العجلة", "معادلات الحركة", "السقوط الحر"]) },
      { title: "الوحدة الثانية: القوى", lessons: lessons("me-b", ["قانون نيوتن الأول", "قانون نيوتن الثاني", "قانون نيوتن الثالث"], 0) },
      { title: "الوحدة الثالثة: الحركة الدائرية", lessons: lessons("me-c", ["الحركة الدائرية المنتظمة", "قانون الجذب العام"], 0) },
    ],
  },
  {
    id: "p-elec",
    slug: "electricity",
    title: "الكهربية التيارية",
    shortDescription: "قانون أوم وكيرشوف وتوصيل المقاومات وحل الدوائر الكهربية.",
    description: "شرح منهجي لوحدة الكهربية التيارية مع مسائل متدرّجة الصعوبة واختبار في نهاية كل فصل.",
    lessonCount: 22,
    examCount: 5,
    durationHours: 14,
    level: "الصف الثالث الثانوي",
    category: "الفصل الدراسي الأول",
    featured: true,
  },
  {
    id: "p-mag",
    slug: "magnetism",
    title: "التأثير المغناطيسي للتيار",
    shortDescription: "المجال المغناطيسي والقوة المؤثرة على سلك والأجهزة الكهربية.",
    description: "مقرر يغطي المجال المغناطيسي الناشئ عن التيار وتطبيقاته في الأجهزة الكهربية.",
    lessonCount: 16,
    examCount: 3,
    durationHours: 10,
    level: "الصف الثالث الثانوي",
    category: "الفصل الدراسي الثاني",
    featured: true,
  },
  {
    id: "p-modern",
    slug: "modern-physics",
    title: "الفيزياء الحديثة",
    shortDescription: "ازدواجية الموجة والجسيم والأطياف الذرية والليزر.",
    description: "مدخل منظّم للفيزياء الحديثة كما يقرّرها المنهج، مع ربط المفاهيم بالتطبيقات.",
    lessonCount: 14,
    examCount: 3,
    durationHours: 9,
    level: "الصف الثالث الثانوي",
    category: "الفصل الدراسي الثاني",
  },
  {
    id: "p-rev",
    slug: "final-revision",
    title: "المراجعة النهائية",
    shortDescription: "مراجعة شاملة للمنهج وحل امتحانات تجريبية كاملة.",
    description: "مراجعة مركّزة لكل وحدات المنهج قبل الامتحان، مع امتحانات تجريبية بتوقيت حقيقي.",
    lessonCount: 12,
    examCount: 6,
    durationHours: 12,
    level: "الصف الثالث الثانوي",
    category: "مراجعات",
  },
];

const mohamed: AcademySite = {
  tenant: { slug: "mohamed", name: "أكاديمية أ. محمد للفيزياء", plan: "BASIC", status: "ACTIVE" },
  academy: {
    template: "ACADEMIC",
    contact: {
      email: "info@mohamed-physics.com",
      phone: "+20 111 000 0000",
      address: "القاهرة، مصر",
      workingHours: "السبت – الخميس، 4 – 9 مساءً",
      socials: [
        { platform: "facebook", url: "https://facebook.com" },
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "telegram", url: "https://t.me" },
      ],
    },
  },
  landing: {
    hero: {
      eyebrow: "الفيزياء للمرحلة الثانوية",
      title: "منهج متكامل لفهم الفيزياء بعمق ووضوح",
      description:
        "مقررات مرتّبة وفق المنهج الدراسي، تجمع بين الشرح النظري الدقيق وحل المسائل والتدريب المنتظم على نماذج الامتحانات.",
    },
    about: {
      title: "عن الأكاديمية",
      description:
        "تأسست الأكاديمية لتقدّم لطلاب المرحلة الثانوية تعليماً منظّماً في الفيزياء يعتمد على الفهم المتدرّج. يُقسَّم كل مقرر إلى وحدات ومحاضرات قصيرة، تتبعها اختبارات تقيس الفهم وتحدّد نقاط الضعف مبكراً.\n\nنحرص على أن يخرج الطالب من كل وحدة وهو قادر على تفسير الظاهرة وحل مسائلها، لا حفظ قوانينها فقط.",
    },
    teacher: {
      name: "أ. محمد عبد الرحمن",
      title: "مدرّس أول فيزياء للمرحلة الثانوية",
      bio: "مدرّس فيزياء متخصص في المرحلة الثانوية، درّس آلاف الطلاب في المدارس والمراكز التعليمية، ويهتم بتبسيط المفاهيم الفيزيائية وربطها بالحياة اليومية. يؤمن بأن التدريب المنتظم على المسائل هو الطريق الأقصر للتفوّق.",
      experienceYears: 15,
      qualifications: [
        { title: "بكالوريوس العلوم والتربية – فيزياء", institution: "جامعة عين شمس", year: "2008" },
        { title: "دبلوم خاص في التربية", institution: "جامعة عين شمس", year: "2010" },
        { title: "ماجستير في مناهج وطرق تدريس العلوم", institution: "جامعة حلوان", year: "2016" },
      ],
      methodology: [
        { title: "الفهم قبل الحفظ", description: "نبدأ كل درس بالظاهرة ثم نصل إلى القانون، فيفهم الطالب من أين جاءت المعادلة." },
        { title: "مسائل متدرّجة", description: "تبدأ المسائل بمستوى مباشر ثم ترتفع تدريجياً حتى مستوى الامتحان." },
        { title: "تقييم مستمر", description: "اختبار قصير بعد كل محاضرة واختبار شامل بعد كل وحدة." },
        { title: "مراجعة دورية", description: "مراجعات مجدولة تربط الوحدات ببعضها قبل الامتحانات." },
      ],
    },
    features: [
      { icon: "video", title: "محاضرات مسجّلة", description: "شاهد كل محاضرة أكثر من مرة وفي الوقت المناسب لك." },
      { icon: "exam", title: "بنك أسئلة واختبارات", description: "اختبارات بعد كل محاضرة ووحدة بتصحيح فوري." },
      { icon: "materials", title: "مذكرات منظّمة", description: "ملخصات وأوراق عمل مرفقة بكل محاضرة." },
      { icon: "progress", title: "متابعة المستوى", description: "نسبة الإنجاز ونتائج الاختبارات في مكان واحد." },
      { icon: "schedule", title: "خطة دراسية", description: "مقررات مرتّبة زمنياً وفق الفصل الدراسي." },
      { icon: "support", title: "متابعة الاستفسارات", description: "قنوات للتواصل والرد على أسئلة الطلاب." },
    ],
    benefits: [
      "تغطية كاملة للمنهج الدراسي",
      "حل نماذج امتحانات السنوات السابقة",
      "اختبارات قصيرة بعد كل محاضرة",
      "مراجعات نهائية قبل الامتحان",
      "مذكرات وملخصات قابلة للتحميل",
      "مشاهدة غير محدودة للمحاضرات",
    ],
    footer: { tagline: "تعليم منظّم في الفيزياء لطلاب المرحلة الثانوية." },
  },
  courses: mohamedCourses,
};

/* ------------------------------------------------------------------ */

const aliCourses: Course[] = [
  {
    id: "e-biz",
    slug: "business-english",
    title: "Business English",
    shortDescription: "تواصل بثقة في الاجتماعات والعروض والمراسلات المهنية.",
    description:
      "برنامج مكثّف للمهنيين يطوّر لغة الأعمال: الاجتماعات، العروض التقديمية، التفاوض، والمراسلات الرسمية. مجموعات صغيرة ومتابعة فردية لكل مشارك.",
    lessonCount: 20,
    examCount: 4,
    durationHours: 16,
    level: "متوسط – متقدم",
    category: "للمهنيين",
    featured: true,
    outcomes: ["إدارة الاجتماعات والمشاركة فيها بثقة", "تقديم عروض احترافية", "كتابة مراسلات مهنية دقيقة", "مهارات التفاوض"],
    requirements: ["مستوى B1 أو أعلى"],
    curriculum: [
      { title: "Meetings", lessons: lessons("bz-a", ["Opening & chairing", "Agreeing & disagreeing", "Wrapping up"]) },
      { title: "Presentations", lessons: lessons("bz-b", ["Structure", "Signposting", "Handling Q&A"], 0) },
    ],
  },
  {
    id: "e-ielts",
    slug: "ielts-mastery",
    title: "IELTS Mastery",
    shortDescription: "استراتيجيات المهارات الأربع واختبارات تجريبية كاملة.",
    description: "تحضير منهجي لاختبار IELTS بمهاراته الأربع، مع اختبارات تجريبية بتوقيت حقيقي وتقييم مفصّل للكتابة والمحادثة.",
    lessonCount: 26,
    examCount: 6,
    durationHours: 22,
    level: "متوسط – متقدم",
    category: "الاختبارات الدولية",
    featured: true,
  },
  {
    id: "e-speak",
    slug: "public-speaking",
    title: "Public Speaking",
    shortDescription: "تحدّث أمام الجمهور بالإنجليزية بحضور ووضوح.",
    description: "برنامج عملي لبناء الحضور والثقة في الإلقاء باللغة الإنجليزية.",
    lessonCount: 12,
    examCount: 2,
    durationHours: 8,
    level: "متقدم",
    category: "مهارات",
    featured: true,
  },
];

const ali: AcademySite = {
  tenant: { slug: "ali", name: "أكاديمية علي للإنجليزية", plan: "PRO", status: "ACTIVE" },
  academy: {
    template: "PREMIUM",
    contact: {
      email: "contact@ali-english.com",
      phone: "+966 50 000 0000",
      whatsapp: "+966500000000",
      address: "الرياض، المملكة العربية السعودية",
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
      ],
    },
  },
  landing: {
    hero: {
      eyebrow: "برامج خاصة بأعداد محدودة",
      title: "إنجليزية بمستوى احترافي يفتح لك الأبواب",
      description: "برامج مكثّفة للمهنيين والطامحين، بمتابعة شخصية لكل طالب حتى يصل إلى هدفه.",
    },
    about: {
      title: "تجربة تعلّم مصمّمة حولك",
      description:
        "لا نقدّم دورات عامة لجمهور واسع. كل برنامج مبني لهدف محدّد، بأعداد محدودة، ومتابعة فردية تضمن أن يتحوّل ما تتعلّمه إلى أداء حقيقي.",
    },
    teacher: {
      name: "أ. علي حسن",
      title: "مدرّب لغة إنجليزية للأعمال والاختبارات الدولية",
      bio: "مدرّب متخصص في الإنجليزية المهنية والتحضير للاختبارات الدولية. عمل مع مهنيين في قطاعات مختلفة، وصمّم برامجه لتجمع بين المنهجية الدقيقة والمتابعة الشخصية.\n\nيؤمن بأن اللغة أداة للفرص، وأن الطريق إليها يبدأ بخطة واضحة والتزام مشترك بين المدرّب والطالب.",
      experienceYears: 12,
      qualifications: [
        { title: "CELTA", institution: "Cambridge Assessment English", year: "2014" },
        { title: "ماجستير في اللغويات التطبيقية", year: "2017" },
      ],
    },
    features: [
      { icon: "community", title: "مجموعات صغيرة", description: "عدد محدود في كل برنامج لضمان المشاركة الفعلية." },
      { icon: "support", title: "متابعة شخصية", description: "تقييم فردي وملاحظات مخصّصة على أدائك." },
      { icon: "certificate", title: "أهداف واضحة", description: "كل برنامج مرتبط بنتيجة يمكن قياسها." },
      { icon: "device", title: "مرونة كاملة", description: "محتوى مسجّل متاح في أي وقت ومن أي جهاز." },
    ],
    learningSteps: [
      { title: "جلسة تقييم", description: "نحدّد مستواك الحالي وهدفك بدقة." },
      { title: "خطة مخصّصة", description: "نختار البرنامج والمسار المناسبين لك." },
      { title: "تعلّم ومتابعة", description: "دروس واختبارات وملاحظات مستمرة." },
      { title: "النتيجة", description: "قياس التقدّم حتى تصل إلى هدفك." },
    ],
    testimonials: [
      { quote: "تغيّرت طريقة تعاملي مع اللغة بالكامل، والمتابعة الشخصية كانت الفارق الحقيقي.", author: "سارة م.", role: "مديرة مشاريع" },
      { quote: "برنامج واضح ومنظّم، وكل أسبوع كنت ألاحظ فرقاً في ثقتي أثناء الاجتماعات.", author: "خالد ع.", role: "مهندس" },
    ],
    footer: { tagline: "برامج إنجليزية خاصة للمهنيين." },
  },
  courses: aliCourses,
};

export const fixtures: Record<string, AcademySite> = { ahmed, mohamed, ali };
