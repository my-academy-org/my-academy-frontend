"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { createAcademyAction, updateAcademyAction } from "@/lib/admin/actions";
import { Notice } from "@/components/dashboard/ui";
import { useToast } from "@/components/dashboard/Toaster";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { academyUrl, EMAIL_RE, normalizeSlug, planLabels, ROOT_DOMAIN, slugError } from "@/lib/admin/meta";
import type { AcademyPatch, AdminAcademyDetail, AdminTemplate, Plan } from "@/lib/admin/types";
import { TemplateThumb } from "./TemplateThumb";
import { AcademyMark, AcademyStatusBadge } from "./ui";

type Values = {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  plan: Plan;
  /** Kept as text so a template id can also be typed by hand. */
  templateId: string;
  email: string;
  phone: string;
  address: string;
};

type Errors = Partial<Record<"name" | "slug" | "description" | "logoUrl" | "templateId" | "email", string>>;

const planHints: Record<Plan, string> = {
  BASIC: "الخطة الأساسية — الافتراضية لكل أكاديمية جديدة.",
  PRO: "الخطة الاحترافية بكامل المزايا.",
};

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Create / edit an academy. Creation takes name, subdomain, plan and template;
 * the remaining details are saved right after. The owner is added from the
 * academy's page once it exists (the API verifies their email with an OTP).
 */
export function AcademyForm({ academy, templates }: { academy?: AdminAcademyDetail; templates: AdminTemplate[] }) {
  const router = useRouter();
  const notify = useToast();
  const editing = !!academy;

  const [values, setValues] = useState<Values>(() => ({
    name: academy?.name ?? "",
    slug: academy?.slug ?? "",
    description: academy?.description ?? "",
    logoUrl: academy?.logoUrl ?? "",
    plan: academy?.plan ?? "BASIC",
    templateId: String(academy?.template?.id ?? templates[0]?.id ?? ""),
    email: academy?.email ?? "",
    phone: academy?.phone ?? "",
    address: academy?.address ?? "",
  }));
  // The API has no templates list yet, so an id outside the known ones can be entered by hand.
  const [customTemplate, setCustomTemplate] = useState(templates.length === 0);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Live feedback only once the slug is long enough to be meaningful; length errors wait for submit.
  const liveSlugError = values.slug.length >= 3 ? slugError(values.slug) : null;
  const selectedTemplate = customTemplate ? undefined : templates.find((t) => String(t.id) === values.templateId);
  const logoPreview = isHttpUrl(values.logoUrl.trim()) ? values.logoUrl.trim() : undefined;

  function validate(): Errors {
    const e: Errors = {};
    if (values.name.trim().length < 3) e.name = "أدخل اسم الأكاديمية (3 أحرف على الأقل)";
    const se = slugError(values.slug);
    if (se) e.slug = se;
    if (values.description.length > 280) e.description = "الوصف 280 حرفاً كحد أقصى";
    if (values.logoUrl.trim() && !isHttpUrl(values.logoUrl.trim())) e.logoUrl = "أدخل رابطاً صحيحاً يبدأ بـ https://";
    if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) e.email = "أدخل بريداً إلكترونياً صحيحاً";
    if (!/^[1-9]\d*$/.test(values.templateId)) e.templateId = customTemplate ? "أدخل رقم القالب" : "اختر قالباً";
    return e;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // Bring the first invalid field into view.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      notify("تحقّق من الحقول المطلوبة", "error");
      return;
    }

    const next = {
      name: values.name.trim(),
      slug: values.slug,
      plan: values.plan,
      templateId: Number(values.templateId),
      description: values.description.trim(),
      logoUrl: values.logoUrl.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    };

    setSaving(true);
    if (academy) {
      // The API expects only the fields that changed.
      const patch: AcademyPatch = {};
      if (next.name !== academy.name) patch.name = next.name;
      if (next.slug !== academy.slug) patch.slug = next.slug;
      if (next.plan !== academy.plan) patch.plan = next.plan;
      if (next.templateId !== academy.template?.id) patch.templateId = next.templateId;
      if (next.description !== (academy.description ?? "")) patch.description = next.description;
      if (next.phone !== (academy.phone ?? "")) patch.phone = next.phone;
      if (next.address !== (academy.address ?? "")) patch.address = next.address;
      // An empty string isn't a valid URL / email, so clearing these sends null.
      if (next.logoUrl !== (academy.logoUrl ?? "")) patch.logoUrl = next.logoUrl || null;
      if (next.email !== (academy.email ?? "")) patch.email = next.email || null;

      if (Object.keys(patch).length === 0) {
        notify("لا توجد تغييرات للحفظ");
        return router.push(`/super-admin/academies/${academy.id}`);
      }
      const result = await updateAcademyAction(academy.id, patch);
      if (!result.ok) {
        setSaving(false);
        if (result.status === 409) setErrors({ slug: result.message });
        return notify(result.message, "error");
      }
      notify("تم حفظ التعديلات");
      router.push(`/super-admin/academies/${academy.id}`);
    } else {
      const details: AcademyPatch = {};
      if (next.description) details.description = next.description;
      if (next.logoUrl) details.logoUrl = next.logoUrl;
      if (next.email) details.email = next.email;
      if (next.phone) details.phone = next.phone;
      if (next.address) details.address = next.address;

      const result = await createAcademyAction({ templateId: next.templateId, name: next.name, slug: next.slug, plan: next.plan, details });
      if (!result.ok) {
        setSaving(false);
        return notify(result.message, "error");
      }
      if (result.data.detailsError) notify(`أُنشئت الأكاديمية، لكن تعذّر حفظ بياناتها الإضافية: ${result.data.detailsError}`, "error");
      else notify(`تم إنشاء «${next.name}»`);
      // Straight to adding the owner, the natural next step.
      router.push(`/super-admin/academies/${result.data.id}?addOwner=1`);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        {/* 1. Identity */}
        <FormSection step={1} title="بيانات الأكاديمية" description="الاسم والنطاق الفرعي يظهران للطلاب في موقع الأكاديمية.">
          <div className="grid gap-5">
            <Field label="اسم الأكاديمية" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="مثال: أكاديمية أحمد للبرمجة"
                aria-invalid={!!errors.name}
              />
            </Field>

            <Field
              label="النطاق الفرعي (Slug)"
              htmlFor="slug"
              error={errors.slug ?? liveSlugError ?? undefined}
              hint={
                values.slug.length >= 3 && !liveSlugError ? (
                  <bdi className="font-semibold text-ink-700">{academyUrl(values.slug)}</bdi>
                ) : (
                  "حروف إنجليزية صغيرة وأرقام وشرطة. يصبح عنوان موقع الأكاديمية."
                )
              }
            >
              <Input
                id="slug"
                value={values.slug}
                onChange={(e) => set("slug", normalizeSlug(e.target.value))}
                suffix={`.${ROOT_DOMAIN}`}
                placeholder="ahmed"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors.slug || !!liveSlugError}
              />
            </Field>
            {editing && academy.slug !== values.slug && (
              <Notice tone="warning">
                تغيير النطاق يغيّر عنوان موقع الأكاديمية. الروابط القديمة على <bdi>{academyUrl(academy.slug)}</bdi> ستتوقف عن العمل.
              </Notice>
            )}

            <Field
              label="الوصف"
              htmlFor="description"
              optional
              error={errors.description}
              hint={`${values.description.length}/280 — وصف مختصر يظهر في محركات البحث وصفحة الأكاديمية.`}
            >
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="نبذة قصيرة عن الأكاديمية وما تقدّمه."
                aria-invalid={!!errors.description}
              />
            </Field>

            <Field label="رابط الشعار" htmlFor="logoUrl" optional error={errors.logoUrl} hint="رابط مباشر لصورة الشعار (PNG أو JPG أو SVG). يُفضّل شعار مربّع.">
              <div className="flex items-center gap-3">
                <AcademyMark name={values.name || "أ"} logoUrl={logoPreview} className="size-11" />
                <Input
                  id="logoUrl"
                  type="url"
                  dir="ltr"
                  className="text-start"
                  value={values.logoUrl}
                  onChange={(e) => set("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  aria-invalid={!!errors.logoUrl}
                />
              </div>
            </Field>
          </div>
        </FormSection>

        {/* 2. Plan */}
        <FormSection step={2} title="الخطة" description="خطة اشتراك الأكاديمية. يمكن تغييرها لاحقاً.">
          <div role="radiogroup" aria-label="خطة الأكاديمية" className="grid gap-3 sm:grid-cols-2">
            {(["BASIC", "PRO"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={values.plan === p}
                onClick={() => set("plan", p)}
                className={cn(
                  "flex gap-3 rounded-xl border p-4 text-start transition-[border-color,box-shadow]",
                  values.plan === p ? "border-brand-600 ring-4 ring-brand-500/12" : "border-line hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2",
                    values.plan === p ? "border-brand-600" : "border-line-strong",
                  )}
                  aria-hidden="true"
                >
                  {values.plan === p && <span className="size-1.5 rounded-full bg-brand-600" />}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink-950">
                    <bdi>{planLabels[p]}</bdi>
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-ink-500">{planHints[p]}</span>
                </span>
              </button>
            ))}
          </div>
        </FormSection>

        {/* 3. Template */}
        <FormSection step={3} title="القالب" description="شكل موقع الأكاديمية. يمكن تغييره لاحقاً دون فقدان أي محتوى.">
          {templates.length > 0 && (
            <div role="radiogroup" aria-label="قالب الأكاديمية" className="grid gap-4 sm:grid-cols-3">
              {templates.map((t) => {
                const selected = !customTemplate && values.templateId === String(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setCustomTemplate(false);
                      set("templateId", String(t.id));
                    }}
                    className={cn(
                      "group relative rounded-2xl border bg-white p-2 text-start transition-[border-color,box-shadow]",
                      selected ? "border-brand-600 ring-4 ring-brand-500/12" : "border-line hover:border-line-strong",
                    )}
                  >
                    <TemplateThumb type={t.type} name={values.name} slug={values.slug} compact className="rounded-xl" />
                    <div className="flex items-center justify-between gap-2 px-1.5 pt-3 pb-1">
                      <div>
                        <p className="text-sm font-bold text-ink-950">
                          <bdi>{t.name}</bdi>
                        </p>
                        <p className="font-mono text-xs text-ink-500">
                          <bdi>
                            #{t.id} · {t.type}
                          </bdi>
                        </p>
                      </div>
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                          selected ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong",
                        )}
                        aria-hidden="true"
                      >
                        {selected && <Icon name="check" className="size-3" strokeWidth={3.5} />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {templates.length > 0 && !customTemplate ? (
            <button
              type="button"
              onClick={() => {
                setCustomTemplate(true);
                set("templateId", "");
              }}
              className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              استخدام قالب آخر برقمه
            </button>
          ) : (
            <div className={cn("grid gap-3", templates.length > 0 && "mt-5")}>
              <Field label="رقم القالب" htmlFor="templateId" error={customTemplate ? errors.templateId : undefined} className="sm:max-w-xs">
                <Input
                  id="templateId"
                  dir="ltr"
                  inputMode="numeric"
                  className="text-start"
                  value={values.templateId}
                  onChange={(e) => set("templateId", e.target.value.replace(/\D/g, ""))}
                  placeholder="1"
                  aria-invalid={customTemplate && !!errors.templateId}
                />
              </Field>
              <Notice tone="info">
                لا يوفّر الـ API قائمة بالقوالب بعد، لذلك تظهر هنا القوالب المستخدمة في أكاديميات موجودة فقط. لاستخدام قالب آخر أدخل رقمه كما هو في قاعدة البيانات.
              </Notice>
            </div>
          )}
          {!customTemplate && errors.templateId && <p className="mt-2 text-xs text-red-600">{errors.templateId}</p>}
        </FormSection>

        {/* 4. Contact */}
        <FormSection step={4} title="معلومات التواصل" description="بيانات تواصل الأكاديمية نفسها، وليست بيانات المالك. كل الحقول اختيارية.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="البريد الإلكتروني" htmlFor="contactEmail" optional error={errors.email}>
              <Input
                id="contactEmail"
                type="email"
                dir="ltr"
                className="text-start"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="hello@academy.com"
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field label="الهاتف" htmlFor="contactPhone" optional>
              <Input id="contactPhone" type="tel" dir="ltr" className="text-start" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+966 5x xxx xxxx" />
            </Field>
            <Field label="العنوان" htmlFor="contactAddress" optional className="sm:col-span-2">
              <Input id="contactAddress" value={values.address} onChange={(e) => set("address", e.target.value)} placeholder="المدينة، الدولة" />
            </Field>
          </div>
        </FormSection>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <div className="border-b border-line p-5">
            <p className="text-xs font-bold text-ink-400">ملخّص</p>
            <div className="mt-3 flex items-center gap-3">
              <AcademyMark name={values.name || "أ"} logoUrl={logoPreview} />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink-950">{values.name || "أكاديمية بدون اسم"}</p>
                <p className="truncate text-xs text-ink-500">
                  <bdi>{values.slug ? academyUrl(values.slug) : `—.${ROOT_DOMAIN}`}</bdi>
                </p>
              </div>
            </div>
          </div>
          <dl className="space-y-3 p-5 text-sm">
            <SummaryRow label="الخطة">
              <bdi>{planLabels[values.plan]}</bdi>
            </SummaryRow>
            <SummaryRow label="القالب">
              {selectedTemplate ? <bdi>{selectedTemplate.name}</bdi> : values.templateId ? <bdi>#{values.templateId}</bdi> : <span className="text-ink-400">لم يُحدَّد</span>}
            </SummaryRow>
            {academy && (
              <SummaryRow label="الحالة">
                <AcademyStatusBadge status={academy.status} />
              </SummaryRow>
            )}
          </dl>
          <div className="flex flex-col gap-2 rounded-b-2xl border-t border-line bg-canvas p-5">
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "إنشاء الأكاديمية"}
            </Button>
            <Button variant="ghost" className="w-full" disabled={saving} onClick={() => router.back()}>
              إلغاء
            </Button>
          </div>
        </div>
        <p className="mt-4 flex gap-2 px-1 text-xs leading-5 text-ink-500">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          {editing
            ? "تفعيل الأكاديمية أو إيقافها يتم من صفحة تفاصيلها."
            : "تُنشأ الأكاديمية نشطة، ثم تضيف مالكها في الخطوة التالية بعد تأكيد بريده برمز تحقق."}
        </p>
      </aside>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-card">
      <header className="flex gap-4 border-b border-line px-6 py-5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink-950 text-xs font-bold text-white tabular-nums">
          {step}
        </span>
        <div>
          <h2 className="font-bold text-ink-950">{title}</h2>
          <p className="mt-0.5 text-sm leading-6 text-ink-500">{description}</p>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="min-w-0 truncate font-semibold text-ink-900">{children}</dd>
    </div>
  );
}
