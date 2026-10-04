"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useConfirm } from "./ConfirmDialog";
import { useToast } from "./Toaster";
import { StatusPill } from "./ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import {
  LANDING_FIELDS,
  type LandingFeature,
  type LandingPageAdmin,
  type LandingPageContent,
  type LandingPageInput,
  type LandingResult,
} from "@/lib/academy/landing";

/**
 * Editor for an academy's landing page (docs/landing-page-api.md §4), shared
 * by the owner dashboard and the Super Admin. No page yet → the form creates
 * one (POST); otherwise it saves changes (PATCH), publishes/unpublishes and
 * deletes it. How those calls reach the API is up to the caller.
 */

type TextKey = Exclude<keyof LandingPageContent, "experienceYears" | "features">;
type Form = Record<TextKey, string> & { experienceYears: string; features: { title: string; description: string }[] };

const TEXT_KEYS = LANDING_FIELDS.filter((k): k is TextKey => k !== "experienceYears" && k !== "features");
const URL_KEYS: TextKey[] = ["heroImageUrl", "instructorImage"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toForm(page: LandingPageAdmin | null, defaults: Partial<Form> = {}): Form {
  const form = Object.fromEntries(TEXT_KEYS.map((k) => [k, page?.[k] ?? defaults[k] ?? ""])) as Record<TextKey, string>;
  return {
    ...form,
    experienceYears: page?.experienceYears != null ? String(page.experienceYears) : "",
    features: (Array.isArray(page?.features) ? page.features : []).map((f) => ({ title: f?.title ?? "", description: f?.description ?? "" })),
  };
}

const cleanFeatures = (features: Form["features"]): LandingFeature[] =>
  features
    .map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
    .filter((f) => f.title)
    .map((f) => (f.description ? f : { title: f.title }));

function isUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validate(form: Form) {
  const errors: Partial<Record<keyof Form, string>> = {};
  for (const key of URL_KEYS) {
    const v = form[key].trim();
    if (v && !isUrl(v)) errors[key] = "أدخل رابطاً صحيحاً يبدأ بـ https://";
  }
  if (form.contactEmail.trim() && !EMAIL_RE.test(form.contactEmail.trim())) errors.contactEmail = "أدخل بريداً إلكترونياً صحيحاً";
  const years = form.experienceYears.trim();
  if (years && !(Number.isInteger(Number(years)) && Number(years) >= 0)) errors.experienceYears = "أدخل عدداً صحيحاً (0 أو أكثر)";
  return errors;
}

/**
 * The request body. On create, empty fields are left out; on update only
 * changed fields are sent, and a cleared field is sent as null — the API
 * rejects "" for most fields.
 */
function toInput(form: Form, page: LandingPageAdmin | null): LandingPageInput {
  const body: LandingPageInput = {};
  const initial = toForm(page);
  for (const key of TEXT_KEYS) {
    const value = form[key].trim();
    if (page ? value !== initial[key].trim() : value) body[key] = value || null;
  }
  const years = form.experienceYears.trim();
  if (page ? years !== initial.experienceYears : years) body.experienceYears = years ? Number(years) : null;
  const features = cleanFeatures(form.features);
  if (page ? JSON.stringify(features) !== JSON.stringify(cleanFeatures(initial.features)) : features.length) {
    body.features = features.length ? features : null;
  }
  return body;
}

export type LandingPageApi = {
  save: (id: number | null, input: LandingPageInput) => Promise<LandingResult>;
  remove: (id: number) => Promise<LandingResult>;
};

export function LandingPageForm({
  page,
  onChange,
  api,
  academyName,
  defaultInstructor,
  onUpgrade,
  intro,
}: {
  page: LandingPageAdmin | null;
  onChange: (page: LandingPageAdmin | null) => void;
  api: LandingPageApi;
  academyName: string;
  /** Prefills the instructor name when creating the page. */
  defaultInstructor?: string;
  /** Called when the API refuses because of the academy's plan. */
  onUpgrade?: () => void;
  /** Status line under the heading; defaults to the owner's wording. */
  intro?: string;
}) {
  const notify = useToast();
  const { confirm, dialog } = useConfirm();
  const [pending, startTransition] = useTransition();
  const defaults = { instructorName: defaultInstructor };
  const [values, setValues] = useState<Form>(() => toForm(page, defaults));
  const [publishNow, setPublishNow] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  const creating = !page;
  const dirty = creating || Object.keys(toInput(values, page)).length > 0;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const text = (key: TextKey) => ({ value: values[key], onChange: (e: { target: { value: string } }) => set(key, e.target.value) });

  /** Runs a mutation; on success replaces the page and, unless `keepForm`, resets the form to it. */
  const run = (action: () => Promise<LandingResult>, success: string, keepForm = false) =>
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        if (res.upgrade) onUpgrade?.();
        notify(res.message, "error");
        return;
      }
      if (res.page === undefined) return notify(`${success}. أعد تحميل الصفحة لعرض آخر نسخة.`);
      onChange(res.page);
      if (!keepForm) setValues(toForm(res.page, defaults));
      notify(success);
    });

  const submit = () => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return notify("تحقّق من الحقول المميّزة", "error");
    const body = toInput(values, page);
    if (creating) {
      run(() => api.save(null, { ...body, published: publishNow }), publishNow ? "تم إنشاء صفحة الهبوط ونشرها" : "تم إنشاء صفحة الهبوط كمسودة");
    } else {
      run(() => api.save(page.id, body), "تم حفظ التغييرات");
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-600 ring-1 ring-line">
          <Icon name="layout" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-bold text-ink-950">
            صفحة الهبوط
            {page && <StatusPill tone={page.published ? "success" : "neutral"}>{page.published ? "منشورة" : "مسودة"}</StatusPill>}
          </p>
          <p className="mt-0.5 text-sm leading-6 text-ink-500">
            {intro ??
              (creating
              ? "لم تُنشأ صفحة الهبوط بعد. حتى تنشرها، يعرض موقعك صفحة افتراضية من بيانات الأكاديمية."
              : page.published
                ? "المحتوى أدناه ظاهر للزوار على موقع الأكاديمية."
                : "الصفحة غير منشورة: يرى الزوار الصفحة الافتراضية حتى تنشرها.")}
          </p>
        </div>
        {page && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() =>
                confirm({
                  title: "حذف صفحة الهبوط",
                  description: "سيُحذف كل محتوى صفحة الهبوط، ويعود موقعك لعرض الصفحة الافتراضية. لا يمكن التراجع عن ذلك.",
                  confirmLabel: "حذف",
                  tone: "danger",
                  onConfirm: () => run(() => api.remove(page.id), "تم حذف صفحة الهبوط"),
                })
              }
            >
              <Icon name="trash" className="size-4" />
              حذف
            </Button>
            <Button
              variant={page.published ? "secondary" : "primary"}
              disabled={pending}
              onClick={() =>
                run(() => api.save(page.id, { published: !page.published }), page.published ? "تم إلغاء نشر الصفحة" : "تم نشر الصفحة على موقعك", true)
              }
            >
              <Icon name={page.published ? "eye" : "rocket"} className="size-4" />
              {page.published ? "إلغاء النشر" : "نشر الصفحة"}
            </Button>
          </div>
        )}
      </div>

      <Section title="الواجهة الرئيسية" description="أول ما يراه الزائر في الصفحة الرئيسية.">
        <div className="grid gap-5">
          <Field label="العنوان الرئيسي" htmlFor="lp-hero-title" optional>
            <Input id="lp-hero-title" {...text("heroTitle")} placeholder={academyName} />
          </Field>
          <Field label="الوصف" htmlFor="lp-hero-desc" optional>
            <Textarea id="lp-hero-desc" rows={3} {...text("heroDescription")} />
          </Field>
          <UrlField id="lp-hero-image" label="رابط صورة الواجهة" error={errors.heroImageUrl} {...text("heroImageUrl")} />
        </div>
      </Section>

      <Section title="عن الأكاديمية" description="نبذة تعرّف الزائر بأسلوبك وما يميّز أكاديميتك.">
        <div className="grid gap-5">
          <Field label="العنوان" htmlFor="lp-about-title" optional>
            <Input id="lp-about-title" {...text("aboutTitle")} placeholder={`عن ${academyName}`} />
          </Field>
          <Field label="النص" htmlFor="lp-about" optional>
            <Textarea id="lp-about" rows={4} {...text("aboutDescription")} />
          </Field>
        </div>
      </Section>

      <Section title="بيانات المعلّم" description="تظهر في صفحة «عن المعلّم» وفي الصفحة الرئيسية.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الاسم" htmlFor="lp-name" optional>
            <Input id="lp-name" {...text("instructorName")} />
          </Field>
          <Field label="سنوات الخبرة" htmlFor="lp-years" optional error={errors.experienceYears}>
            <Input
              id="lp-years"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={values.experienceYears}
              onChange={(e) => set("experienceYears", e.target.value)}
              aria-invalid={!!errors.experienceYears}
            />
          </Field>
          <Field label="نبذة" htmlFor="lp-bio" optional className="sm:col-span-2">
            <Textarea id="lp-bio" rows={4} {...text("instructorBio")} />
          </Field>
          <Field label="المؤهلات" htmlFor="lp-quals" optional hint="مؤهل في كل سطر." className="sm:col-span-2">
            <Textarea id="lp-quals" rows={3} {...text("qualifications")} placeholder="بكالوريوس حاسبات" />
          </Field>
          <UrlField id="lp-instructor-image" label="رابط صورة المعلّم" error={errors.instructorImage} className="sm:col-span-2" {...text("instructorImage")} />
        </div>
      </Section>

      <Section title="المميزات" description="ما يميّز التعلّم في أكاديميتك. يظهر القسم عند إضافة ميزة واحدة على الأقل.">
        <div className="space-y-3">
          {values.features.map((f, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-start">
              <Input
                aria-label={`عنوان الميزة ${i + 1}`}
                placeholder="العنوان، مثل: دعم مباشر"
                value={f.title}
                onChange={(e) => set("features", values.features.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
              />
              <Input
                aria-label={`وصف الميزة ${i + 1}`}
                placeholder="الوصف، مثل: رد خلال 24 ساعة"
                value={f.description}
                onChange={(e) => set("features", values.features.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
              />
              <Button variant="ghost" aria-label={`حذف الميزة ${i + 1}`} onClick={() => set("features", values.features.filter((_, j) => j !== i))}>
                <Icon name="trash" className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => set("features", [...values.features, { title: "", description: "" }])}>
            <Icon name="plus" className="size-4" />
            إضافة ميزة
          </Button>
        </div>
      </Section>

      <Section title="معلومات التواصل" description="تظهر في صفحة «تواصل معنا» وتذييل الموقع. الحقول الفارغة تأخذ بيانات الأكاديمية.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="البريد الإلكتروني" htmlFor="lp-email" optional error={errors.contactEmail}>
            <Input id="lp-email" type="email" dir="ltr" className="text-start" {...text("contactEmail")} aria-invalid={!!errors.contactEmail} />
          </Field>
          <Field label="الهاتف" htmlFor="lp-phone" optional>
            <Input id="lp-phone" type="tel" dir="ltr" className="text-start" {...text("contactPhone")} />
          </Field>
          <Field label="العنوان" htmlFor="lp-address" optional className="sm:col-span-2">
            <Input id="lp-address" {...text("contactAddress")} />
          </Field>
        </div>
      </Section>

      <Section title="تذييل الموقع" description="جملة قصيرة أسفل كل الصفحات.">
        <Field label="نص التذييل" htmlFor="lp-footer" optional>
          <Input id="lp-footer" {...text("footerText")} />
        </Field>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-white/95 px-5 py-3.5 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        {creating ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-700 sm:me-auto">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} className="size-4 rounded accent-brand-700" />
            نشر الصفحة فور إنشائها
          </label>
        ) : (
          <p className={cn("text-sm text-ink-500 sm:me-auto", !dirty && "invisible")} aria-live="polite">
            لديك تغييرات غير محفوظة
          </p>
        )}
        {!creating && (
          <Button variant="ghost" disabled={!dirty || pending} onClick={() => (setValues(toForm(page)), setErrors({}))}>
            تجاهل
          </Button>
        )}
        <Button type="submit" disabled={!dirty || pending}>
          {pending ? "جارٍ الحفظ…" : creating ? "إنشاء الصفحة" : "حفظ التغييرات"}
        </Button>
      </div>
      {dialog}
    </form>
  );
}

function UrlField({ id, label, error, className, value, onChange }: { id: string; label: string; error?: string; className?: string; value: string; onChange: (e: { target: { value: string } }) => void }) {
  return (
    <Field label={label} htmlFor={id} optional error={error} hint="رابط صورة مرفوعة مسبقاً." className={className}>
      <Input id={id} type="url" dir="ltr" className="text-start" placeholder="https://" value={value} onChange={onChange} aria-invalid={!!error} />
    </Field>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 rounded-2xl border border-line bg-white p-6 shadow-card md:grid-cols-[14rem_1fr] md:gap-10">
      <div>
        <h2 className="font-bold text-ink-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
