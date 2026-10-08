import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/site";

/* Illustrative sample data for the product mockups only. */
type Kpi = { label: string; value: string; delta?: string };
type ListItem = { title: string; meta: string; badge?: string; badgeTone?: "brand" | "gold" | "neutral" };

type RoleView = {
  workspace: string;
  user: string;
  greeting: string;
  subtitle: string;
  nav: { icon: IconName; label: string }[];
  kpis: Kpi[];
  panelTitle: string;
  panel: { kind: "bars"; data: number[] } | { kind: "progress"; data: { label: string; value: number }[] };
  listTitle: string;
  list: ListItem[];
};

const views: Record<Role, RoleView> = {
  admin: {
    workspace: "My Academy",
    user: "المشرف العام",
    greeting: "لوحة المشرف العام",
    subtitle: "نظرة شاملة على جميع الأكاديميات في المنصة",
    nav: [
      { icon: "home", label: "الرئيسية" },
      { icon: "academy", label: "الأكاديميات" },
      { icon: "teacher", label: "المعلّمون" },
      { icon: "layout", label: "القوالب" },
      { icon: "layers", label: "الخطط" },
      { icon: "settings", label: "الإعدادات" },
    ],
    kpis: [
      { label: "الأكاديميات", value: "48", delta: "+6" },
      { label: "المعلّمون", value: "52", delta: "+7" },
      { label: "الطلاب", value: "18,420", delta: "+12%" },
      { label: "أكاديميات Pro", value: "21" },
    ],
    panelTitle: "نمو الأكاديميات",
    panel: { kind: "bars", data: [18, 22, 21, 27, 30, 29, 34, 38, 37, 42, 45, 48] },
    listTitle: "أحدث الأكاديميات",
    list: [
      { title: "ahmed.myacademy.com", meta: "قالب Modern", badge: "Pro", badgeTone: "gold" },
      { title: "dr-sara.myacademy.com", meta: "قالب Academic", badge: "Basic", badgeTone: "neutral" },
      { title: "elite.myacademy.com", meta: "قالب Premium", badge: "Pro", badgeTone: "gold" },
      { title: "physics.myacademy.com", meta: "قالب Modern", badge: "Basic", badgeTone: "neutral" },
    ],
  },
  teacher: {
    workspace: "أكاديمية أحمد",
    user: "م. أحمد سامي",
    greeting: "مرحباً، م. أحمد",
    subtitle: "إليك ملخص أداء أكاديميتك هذا الشهر",
    nav: [
      { icon: "home", label: "الرئيسية" },
      { icon: "book", label: "الدورات" },
      { icon: "play", label: "الدروس" },
      { icon: "users", label: "الطلاب" },
      { icon: "ticket", label: "أكواد التسجيل" },
      { icon: "exam", label: "الاختبارات" },
      { icon: "layout", label: "الصفحة الرئيسية" },
      { icon: "image", label: "الوسائط" },
    ],
    kpis: [
      { label: "الطلاب", value: "1,248", delta: "+86" },
      { label: "الدورات النشطة", value: "12" },
      { label: "أكواد مفعّلة", value: "342", delta: "+41" },
      { label: "متوسط التقدّم", value: "74%", delta: "+5%" },
    ],
    panelTitle: "التسجيلات الشهرية",
    panel: { kind: "bars", data: [40, 52, 48, 61, 58, 72, 69, 80, 76, 88, 94, 86] },
    listTitle: "أحدث التسجيلات",
    list: [
      { title: "يوسف خالد", meta: "أساسيات JavaScript", badge: "جديد", badgeTone: "brand" },
      { title: "مريم عادل", meta: "React من الصفر", badge: "جديد", badgeTone: "brand" },
      { title: "عمر حسن", meta: "تطوير الواجهات", badge: "92%", badgeTone: "neutral" },
      { title: "نور الهدى", meta: "أساسيات JavaScript", badge: "68%", badgeTone: "neutral" },
    ],
  },
  student: {
    workspace: "أكاديمية أحمد",
    user: "يوسف خالد",
    greeting: "أهلاً يوسف",
    subtitle: "تابع من حيث توقفت",
    nav: [
      { icon: "home", label: "الرئيسية" },
      { icon: "book", label: "دوراتي" },
      { icon: "exam", label: "اختباراتي" },
      { icon: "ticket", label: "تفعيل كود" },
      { icon: "settings", label: "حسابي" },
    ],
    kpis: [
      { label: "دوراتي", value: "4" },
      { label: "دروس مكتملة", value: "38" },
      { label: "اختبارات", value: "9" },
      { label: "متوسط الدرجات", value: "88%" },
    ],
    panelTitle: "تقدّمي في الدورات",
    panel: {
      kind: "progress",
      data: [
        { label: "أساسيات JavaScript", value: 86 },
        { label: "React من الصفر", value: 54 },
        { label: "تطوير الواجهات", value: 32 },
        { label: "Git و GitHub", value: 100 },
      ],
    },
    listTitle: "الاختبارات",
    list: [
      { title: "اختبار الوحدة الثالثة", meta: "React من الصفر", badge: "متاح", badgeTone: "brand" },
      { title: "الاختبار النهائي", meta: "Git و GitHub", badge: "95%", badgeTone: "neutral" },
      { title: "اختبار الدوال", meta: "أساسيات JavaScript", badge: "88%", badgeTone: "neutral" },
    ],
  },
};

const badgeTones = {
  brand: "bg-brand-50 text-brand-700",
  gold: "bg-gold-50 text-gold-600",
  neutral: "bg-muted text-ink-600",
};

export function DashboardMock({ role, className }: { role: Role; className?: string }) {
  const v = views[role];

  return (
    <div className={cn("@container", className)} aria-hidden="true">
      <div className="flex bg-canvas text-[clamp(6.5px,1.2cqw,12.5px)] text-ink-900 select-none">
        {/* Sidebar */}
        <aside className="flex w-[15.5em] shrink-0 flex-col border-e border-line bg-white p-[1.1em] @max-xl:hidden">
          <div className="mb-[1.6em] flex items-center gap-[0.6em]">
            <span className="grid size-[2.3em] place-items-center rounded-[0.6em] bg-brand-700 text-[0.95em] font-extrabold text-gold-300">
              {role === "admin" ? "M" : "أ"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[1em] font-bold">{v.workspace}</p>
              <p className="text-[0.8em] text-ink-500">{role === "admin" ? "إدارة المنصة" : "ahmed.myacademy.com"}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-[0.25em]">
            {v.nav.map((item, i) => (
              <span
                key={item.label}
                className={cn(
                  "flex items-center gap-[0.7em] rounded-[0.6em] px-[0.8em] py-[0.62em] text-[0.95em] font-semibold",
                  i === 0 ? "bg-brand-50 text-brand-700" : "text-ink-600",
                )}
              >
                <Icon name={item.icon} className="size-[1.25em]" />
                {item.label}
              </span>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-[0.6em] rounded-[0.7em] border border-line p-[0.6em]">
            <span className="size-[2.2em] rounded-full bg-gradient-to-br from-brand-200 to-brand-400" />
            <div className="min-w-0">
              <p className="truncate text-[0.9em] font-bold">{v.user}</p>
              <p className="text-[0.75em] text-ink-500">{role === "admin" ? "Super Admin" : role === "teacher" ? "معلّم · Pro" : "طالب"}</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-[1.6em]">
          <div className="mb-[1.4em] flex items-center justify-between gap-[1em]">
            <div className="min-w-0">
              <p className="truncate text-[1.55em] font-extrabold leading-tight">{v.greeting}</p>
              <p className="mt-[0.2em] truncate text-[0.95em] text-ink-500">{v.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-[0.6em]">
              <span className="flex w-[14em] items-center gap-[0.5em] rounded-[0.6em] border border-line bg-white px-[0.8em] py-[0.55em] text-[0.9em] text-ink-400 @max-2xl:hidden">
                <Icon name="search" className="size-[1.2em]" /> بحث…
              </span>
              <span className="grid size-[2.6em] place-items-center rounded-[0.6em] border border-line bg-white text-ink-500">
                <Icon name="bell" className="size-[1.25em]" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-[0.9em] @max-xl:grid-cols-2">
            {v.kpis.map((k) => (
              <div key={k.label} className="rounded-[0.9em] border border-line bg-white p-[1em]">
                <p className="text-[0.85em] font-semibold text-ink-500">{k.label}</p>
                <div className="mt-[0.4em] flex items-baseline justify-between gap-[0.4em]">
                  <p className="text-[1.75em] font-extrabold leading-none" dir="ltr">{k.value}</p>
                  {k.delta && (
                    <span className="rounded-full bg-brand-50 px-[0.5em] py-[0.1em] text-[0.75em] font-bold text-brand-700" dir="ltr">
                      {k.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[0.9em] grid grid-cols-[1.55fr_1fr] gap-[0.9em] @max-xl:grid-cols-1">
            <div className="rounded-[0.9em] border border-line bg-white p-[1.1em]">
              <div className="mb-[1em] flex items-center justify-between">
                <p className="text-[1.05em] font-bold">{v.panelTitle}</p>
                <span className="rounded-[0.5em] bg-muted px-[0.6em] py-[0.2em] text-[0.8em] text-ink-500">آخر 12 شهراً</span>
              </div>
              {v.panel.kind === "bars" ? (
                <Bars data={v.panel.data} />
              ) : (
                <div className="flex flex-col gap-[1em]">
                  {v.panel.data.map((c) => (
                    <div key={c.label}>
                      <div className="mb-[0.4em] flex justify-between text-[0.9em]">
                        <span className="font-semibold">{c.label}</span>
                        <span className="text-ink-500" dir="ltr">{c.value}%</span>
                      </div>
                      <div className="h-[0.55em] overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", c.value === 100 ? "bg-gold-400" : "bg-brand-500")}
                          style={{ width: `${c.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[0.9em] border border-line bg-white p-[1.1em] @max-xl:hidden">
              <p className="mb-[0.8em] text-[1.05em] font-bold">{v.listTitle}</p>
              <ul className="flex flex-col divide-y divide-line">
                {v.list.map((item) => (
                  <li key={item.title} className="flex items-center justify-between gap-[0.6em] py-[0.65em]">
                    <div className="flex min-w-0 items-center gap-[0.6em]">
                      <span className="size-[2em] shrink-0 rounded-full bg-muted ring-1 ring-line" />
                      <div className="min-w-0">
                        <p className="truncate text-[0.92em] font-semibold" dir="auto">{item.title}</p>
                        <p className="truncate text-[0.78em] text-ink-500">{item.meta}</p>
                      </div>
                    </div>
                    {item.badge && (
                      <span className={cn("shrink-0 rounded-full px-[0.6em] py-[0.15em] text-[0.75em] font-bold", badgeTones[item.badgeTone ?? "neutral"])}>
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bars({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-[11em] items-end gap-[0.55em]" dir="ltr">
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col justify-end">
          <div
            className={cn(
              "w-full origin-bottom animate-grow-y rounded-t-[0.35em]",
              i === data.length - 1 ? "bg-brand-600" : "bg-brand-100",
            )}
            style={{ height: `${(d / max) * 100}%`, animationDelay: `${200 + i * 45}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
