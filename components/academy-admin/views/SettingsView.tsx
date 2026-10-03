"use client";

import { useState, type ReactNode } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { PageHeader, Switch, Tabs } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ROOT_DOMAIN } from "@/lib/academy/config";
import { EMAIL_RE } from "@/lib/admin/meta";
import { planLabels } from "@/lib/academy-admin/plan";
import type { AcademyProfile } from "@/lib/academy-admin/types";
import { templates as templateInfo } from "@/lib/site";
import { useAcademy } from "../AcademyStore";
import { AcademyLogo } from "../parts";
import { useUpgrade } from "../Upgrade";

type Tab = "academy" | "branding" | "account" | "security" | "notifications";

const BRAND_PRESETS = ["#105544", "#2f5bea", "#1c2b4a", "#7a2232", "#b45309", "#6d28d9", "#0f766e", "#0f0f11"];
const templateKey = { MODERN: "modern", ACADEMIC: "academic", PREMIUM: "premium" } as const;

export function SettingsView() {
  const [tab, setTab] = useState<Tab>("academy");
  return (
    <>
      <PageHeader title="الإعدادات" description="بيانات أكاديميتك وهويتها، وحسابك كمالك لها." />
      <Tabs
        label="أقسام الإعدادات"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { value: "academy", label: "الأكاديمية" },
          { value: "branding", label: "الهوية" },
          { value: "account", label: "الحساب" },
          { value: "security", label: "الأمان" },
          { value: "notifications", label: "الإشعارات" },
        ]}
      />
      {tab === "academy" && <AcademyTab />}
      {tab === "branding" && <BrandingTab />}
      {tab === "account" && <AccountTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "notifications" && <NotificationsTab />}
    </>
  );
}

/** Settings card with a save bar that appears once something changes. */
function SettingsForm({
  title,
  description,
  dirty,
  onSubmit,
  onReset,
  submitLabel = "حفظ التغييرات",
  children,
}: {
  title: string;
  description: string;
  dirty?: boolean;
  onSubmit?: () => void;
  onReset?: () => void;
  submitLabel?: string;
  children: ReactNode;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="rounded-2xl border border-line bg-white shadow-card"
    >
      <div className="grid gap-5 p-6 md:grid-cols-[14rem_1fr] md:gap-10">
        <div>
          <h2 className="font-bold text-ink-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
      {onSubmit && (
        <div className="flex items-center justify-end gap-2 rounded-b-2xl border-t border-line bg-canvas px-6 py-3.5">
          {onReset && (
            <Button variant="ghost" disabled={!dirty} onClick={onReset}>
              تجاهل
            </Button>
          )}
          <Button type="submit" disabled={dirty === false}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

function useProfileDraft() {
  const { profile, updateProfile, notify } = useAcademy();
  const [draft, setDraft] = useState<AcademyProfile>(profile);
  return {
    draft,
    setDraft,
    dirty: JSON.stringify(draft) !== JSON.stringify(profile),
    reset: () => setDraft(profile),
    save: (message = "تم حفظ الإعدادات") => {
      updateProfile(draft);
      notify(message);
    },
  };
}

/* ------------------------------------------------------------------ */

function AcademyTab() {
  const { profile } = useAcademy();
  const upgrade = useUpgrade();
  const { draft, setDraft, dirty, reset, save } = useProfileDraft();
  const [error, setError] = useState<string>();

  return (
    <div className="space-y-6">
      <SettingsForm
        title="بيانات الأكاديمية"
        description="اسم الأكاديمية يظهر في موقعها وفي رسائل الطلاب."
        dirty={dirty}
        onReset={reset}
        onSubmit={() => {
          if (draft.name.trim().length < 3) return setError("أدخل اسم الأكاديمية");
          save();
        }}
      >
        <div className="grid gap-5">
          <Field label="اسم الأكاديمية" htmlFor="s-name" error={error}>
            <Input
              id="s-name"
              value={draft.name}
              onChange={(e) => {
                setDraft((d) => ({ ...d, name: e.target.value }));
                setError(undefined);
              }}
              aria-invalid={!!error}
            />
          </Field>
          <Field label="عنوان الأكاديمية" htmlFor="s-slug" hint="النطاق الفرعي ثابت. لتغييره تواصل مع فريق المنصة.">
            <Input id="s-slug" value={profile.slug} suffix={`.${ROOT_DOMAIN}`} readOnly disabled />
          </Field>
        </div>
      </SettingsForm>

      <SettingsForm title="الخطة" description="المميزات المتاحة لأكاديميتك.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line p-4">
          <div>
            <p className="flex items-center gap-2 font-bold text-ink-950">
              خطة {planLabels[profile.plan]}
              <span className="rounded-md bg-brand-50 px-1.5 py-px text-[0.6875rem] font-bold text-brand-700 ring-1 ring-brand-100">مفعّلة</span>
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {profile.plan === "PRO"
                ? "تحرير موقع الأكاديمية مباشرةً ومكتبة الوسائط مفعّلان."
                : "الدورات والدروس والطلاب والأكواد والاختبارات متاحة كاملة. تعديلات محتوى الموقع عبر فريق المنصة."}
            </p>
          </div>
          {profile.plan === "BASIC" && (
            <Button variant="secondary" onClick={() => upgrade()}>
              الترقية إلى Pro
            </Button>
          )}
        </div>
      </SettingsForm>
    </div>
  );
}

function BrandingTab() {
  const { profile, website } = useAcademy();
  const { draft, setDraft, dirty, reset, save } = useProfileDraft();
  const color = draft.brandColor ?? "#105544";
  const template = templateInfo.find((t) => t.id === templateKey[profile.template])!;

  return (
    <div className="space-y-6">
      <SettingsForm title="لون الأكاديمية" description="يُستخدم للأزرار والروابط والعناصر البارزة في موقع الأكاديمية." dirty={dirty} onReset={reset} onSubmit={() => save("تم تحديث لون الأكاديمية")}>
        <div role="radiogroup" aria-label="اللون" className="flex flex-wrap gap-2.5">
          {BRAND_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setDraft((d) => ({ ...d, brandColor: c }))}
              className={cn("grid size-9 place-items-center rounded-full ring-offset-2 transition-shadow", color === c ? "ring-2 ring-ink-900" : "hover:ring-2 hover:ring-line-strong")}
              style={{ background: c }}
            >
              {color === c && <Icon name="check" className="size-4 text-white" strokeWidth={3} />}
            </button>
          ))}
          <label className="flex h-9 items-center gap-2 rounded-full border border-line-strong ps-1 pe-3 text-sm text-ink-600">
            <input type="color" value={color} onChange={(e) => setDraft((d) => ({ ...d, brandColor: e.target.value }))} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label="لون مخصّص" />
            <bdi className="font-mono text-xs">{color}</bdi>
          </label>
        </div>
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-line bg-canvas p-4">
          <AcademyLogo name={profile.name} logoUrl={website.logoUrl} color={color} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink-950">{profile.name}</p>
            <p className="text-sm" style={{ color }}>
              تصفّح الدورات ←
            </p>
          </div>
          <span className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: color }}>
            سجّل الآن
          </span>
        </div>
      </SettingsForm>

      <SettingsForm title="القالب" description="شكل موقع أكاديميتك. يُختار ويُغيَّر عبر فريق المنصة.">
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">
          <span className="flex gap-1" aria-hidden="true">
            {template.palette.map((c) => (
              <span key={c} className="size-5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
            ))}
          </span>
          <div>
            <p className="font-bold text-ink-950">
              <bdi>{template.name}</bdi> · {template.arabicName}
            </p>
            <p className="text-sm text-ink-500">{template.description}</p>
          </div>
        </div>
      </SettingsForm>
    </div>
  );
}

function AccountTab() {
  const { draft, setDraft, dirty, reset, save } = useProfileDraft();
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const setOwner = (key: "name" | "email" | "phone", value: string) => {
    setDraft((d) => ({ ...d, owner: { ...d.owner, [key]: value } }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <SettingsForm
      title="حسابك"
      description="بيانات دخولك كمالك للأكاديمية (ACADEMY_ADMIN)."
      dirty={dirty}
      onReset={reset}
      onSubmit={() => {
        const next: typeof errors = {};
        if (draft.owner.name.trim().length < 3) next.name = "أدخل اسمك الكامل";
        if (!EMAIL_RE.test(draft.owner.email)) next.email = "أدخل بريداً إلكترونياً صحيحاً";
        setErrors(next);
        if (!Object.keys(next).length) save("تم تحديث بيانات الحساب");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الاسم الكامل" htmlFor="a-name" error={errors.name} className="sm:col-span-2">
          <Input id="a-name" value={draft.owner.name} onChange={(e) => setOwner("name", e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field label="البريد الإلكتروني" htmlFor="a-email" error={errors.email} hint="يُستخدم لتسجيل الدخول واستقبال الإشعارات.">
          <Input id="a-email" type="email" dir="ltr" className="text-start" value={draft.owner.email} onChange={(e) => setOwner("email", e.target.value)} aria-invalid={!!errors.email} />
        </Field>
        <Field label="رقم الجوال" htmlFor="a-phone" optional>
          <Input id="a-phone" type="tel" dir="ltr" className="text-start" value={draft.owner.phone ?? ""} onChange={(e) => setOwner("phone", e.target.value)} />
        </Field>
      </div>
    </SettingsForm>
  );
}

function SecurityTab() {
  const { notify } = useAcademy();
  const { confirm, dialog } = useConfirm();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const set = (key: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <div className="space-y-6">
      <SettingsForm
        title="كلمة المرور"
        description="استخدم 8 أحرف على الأقل، ويُفضّل مزيج من الحروف والأرقام."
        submitLabel="تغيير كلمة المرور"
        onSubmit={() => {
          const next: typeof errors = {};
          if (!values.current) next.current = "أدخل كلمة المرور الحالية";
          if (values.next.length < 8) next.next = "8 أحرف على الأقل";
          else if (values.next === values.current) next.next = "اختر كلمة مرور مختلفة عن الحالية";
          if (values.confirm !== values.next) next.confirm = "كلمتا المرور غير متطابقتين";
          setErrors(next);
          if (Object.keys(next).length) return;
          setValues({ current: "", next: "", confirm: "" });
          notify("تم تغيير كلمة المرور");
        }}
      >
        <div className="grid gap-5 sm:max-w-md">
          <Field label="كلمة المرور الحالية" htmlFor="p-current" error={errors.current}>
            <Input id="p-current" type="password" autoComplete="current-password" dir="ltr" className="text-start" value={values.current} onChange={(e) => set("current", e.target.value)} aria-invalid={!!errors.current} />
          </Field>
          <Field label="كلمة المرور الجديدة" htmlFor="p-new" error={errors.next}>
            <Input id="p-new" type="password" autoComplete="new-password" dir="ltr" className="text-start" value={values.next} onChange={(e) => set("next", e.target.value)} aria-invalid={!!errors.next} />
          </Field>
          <Field label="تأكيد كلمة المرور" htmlFor="p-confirm" error={errors.confirm}>
            <Input id="p-confirm" type="password" autoComplete="new-password" dir="ltr" className="text-start" value={values.confirm} onChange={(e) => set("confirm", e.target.value)} aria-invalid={!!errors.confirm} />
          </Field>
        </div>
      </SettingsForm>

      <SettingsForm title="الأجهزة المتصلة" description="الأجهزة التي سجّلت الدخول إلى لوحة أكاديميتك.">
        <ul className="divide-y divide-line rounded-xl border border-line">
          {[
            { device: "Chrome · Windows", place: "القاهرة، مصر", current: true },
            { device: "Safari · iPhone", place: "القاهرة، مصر", current: false },
          ].map((s) => (
            <li key={s.device} className="flex items-center gap-3 px-4 py-3">
              <Icon name="device" className="size-5 text-ink-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">
                  <bdi>{s.device}</bdi>
                </p>
                <p className="text-xs text-ink-500">{s.place}</p>
              </div>
              {s.current && <span className="text-xs font-semibold text-brand-700">هذا الجهاز</span>}
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() =>
            confirm({
              title: "تسجيل الخروج من الأجهزة الأخرى",
              description: "ستبقى مسجّلاً على هذا الجهاز فقط، وسيُطلب تسجيل الدخول مجدداً على بقية الأجهزة.",
              confirmLabel: "تسجيل الخروج",
              onConfirm: () => notify("تم تسجيل الخروج من الأجهزة الأخرى"),
            })
          }
        >
          تسجيل الخروج من الأجهزة الأخرى
        </Button>
      </SettingsForm>
      {dialog}
    </div>
  );
}

function NotificationsTab() {
  const { draft, setDraft, dirty, reset, save } = useProfileDraft();
  const rows: { key: keyof AcademyProfile["notifications"]; title: string; description: string }[] = [
    { key: "newEnrollment", title: "تسجيل طالب في دورة", description: "عند تفعيل طالب لدورة بكود تسجيل." },
    { key: "examSubmission", title: "تسليم اختبار", description: "عند إنهاء طالب لاختبار." },
    { key: "weeklySummary", title: "الملخّص الأسبوعي", description: "أعداد الطلاب والتسجيلات والنتائج كل أسبوع." },
    { key: "productUpdates", title: "تحديثات المنصة", description: "المميزات الجديدة في My Academy." },
  ];

  return (
    <SettingsForm title="إشعارات البريد" description={`تُرسل إلى ${draft.owner.email}.`} dirty={dirty} onReset={reset} onSubmit={() => save("تم حفظ تفضيلات الإشعارات")}>
      <div className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.key} className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
            <label htmlFor={`n-${r.key}`} className="cursor-pointer">
              <span className="block text-[0.9375rem] font-semibold text-ink-900">{r.title}</span>
              <span className="mt-0.5 block text-sm text-ink-500">{r.description}</span>
            </label>
            <Switch
              id={`n-${r.key}`}
              label={r.title}
              checked={draft.notifications[r.key]}
              onChange={(v) => setDraft((d) => ({ ...d, notifications: { ...d.notifications, [r.key]: v } }))}
            />
          </div>
        ))}
      </div>
    </SettingsForm>
  );
}
