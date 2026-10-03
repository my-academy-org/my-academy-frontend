"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { RESERVED_SUBDOMAINS } from "@/lib/academy/config";
import { EMAIL_RE, ROOT_DOMAIN } from "@/lib/admin/meta";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { useToast } from "@/components/dashboard/Toaster";
import { Notice, PageHeader, Switch } from "@/components/dashboard/ui";

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  /** Shows the "request an academy" form on the marketing site. */
  acceptAcademyRequests: boolean;
  /** Takes every academy website offline behind a maintenance page. */
  maintenanceMode: boolean;
}

const defaultSettings: PlatformSettings = {
  platformName: "My Academy",
  supportEmail: "support@myacademy.com",
  acceptAcademyRequests: true,
  maintenanceMode: false,
};

/**
 * The API has no platform-settings endpoints yet, so this page only keeps its
 * values for the current visit.
 */
export function SettingsView() {
  const notify = useToast();
  const { confirm, dialog } = useConfirm();
  const [settings, setSettings] = useState(defaultSettings);
  const [values, setValues] = useState(settings);
  const [errors, setErrors] = useState<{ platformName?: string; supportEmail?: string }>({});

  const dirty = JSON.stringify(values) !== JSON.stringify(settings);
  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.platformName.trim()) next.platformName = "أدخل اسم المنصة";
    if (!EMAIL_RE.test(values.supportEmail.trim())) next.supportEmail = "أدخل بريداً إلكترونياً صحيحاً";
    setErrors(next);
    if (Object.keys(next).length) return;

    const commit = () => {
      const next = { ...values, platformName: values.platformName.trim(), supportEmail: values.supportEmail.trim() };
      setSettings(next);
      setValues(next);
      notify("طُبّقت الإعدادات لهذه الزيارة فقط — غير مرتبطة بالخادم بعد");
    };
    if (values.maintenanceMode && !settings.maintenanceMode) {
      confirm({
        title: "تفعيل وضع الصيانة",
        description: "ستتوقف جميع مواقع الأكاديميات مؤقتاً وتعرض صفحة صيانة للطلاب.",
        points: ["لا يستطيع الطلاب ولا الملّاك الدخول حتى إيقاف وضع الصيانة.", "لوحة المشرف العام تبقى متاحة."],
        confirmLabel: "تفعيل وحفظ",
        tone: "danger",
        onConfirm: commit,
      });
    } else {
      commit();
    }
  };

  return (
    <>
      <PageHeader title="الإعدادات" description="إعدادات المنصة العامة. تنطبق على المنصة كلها، وليس على أكاديمية بعينها." />

      <Notice tone="warning" className="mb-6">
        هذه الصفحة غير مرتبطة بالـ backend بعد (لا توجد مسارات لإعدادات المنصة في الـ API)، لذلك لا تُحفظ التغييرات ولا تؤثّر على المنصة.
      </Notice>

      <form onSubmit={save} noValidate className="rounded-2xl border border-line bg-white shadow-card">
        <Section title="عام" description="هوية المنصة وعنوان الدعم الذي يظهر للملّاك.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="اسم المنصة" htmlFor="platformName" error={errors.platformName}>
              <Input id="platformName" value={values.platformName} onChange={(e) => set("platformName", e.target.value)} aria-invalid={!!errors.platformName} />
            </Field>
            <Field label="بريد الدعم" htmlFor="supportEmail" error={errors.supportEmail}>
              <Input
                id="supportEmail"
                type="email"
                dir="ltr"
                className="text-start"
                value={values.supportEmail}
                onChange={(e) => set("supportEmail", e.target.value)}
                aria-invalid={!!errors.supportEmail}
              />
            </Field>
          </div>
        </Section>

        <Section title="النطاقات" description="كل أكاديمية تعمل على نطاق فرعي من النطاق الرئيسي.">
          <dl className="grid gap-5">
            <div>
              <dt className="text-sm font-semibold text-ink-800">النطاق الرئيسي</dt>
              <dd className="mt-1.5 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 items-center rounded-xl border border-line bg-canvas px-3.5 font-mono text-sm text-ink-800">
                  <bdi>
                    <span className="text-ink-400">slug.</span>
                    {ROOT_DOMAIN}
                  </bdi>
                </span>
                <span className="text-xs text-ink-500">
                  يُضبط عند النشر عبر <bdi className="font-mono">NEXT_PUBLIC_ROOT_DOMAIN</bdi>
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-800">نطاقات محجوزة</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {[...RESERVED_SUBDOMAINS].map((s) => (
                  <span key={s} dir="ltr" className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-ink-600">
                    {s}
                  </span>
                ))}
              </dd>
              <p className="mt-2 text-xs text-ink-500">لا يمكن استخدامها كنطاق لأي أكاديمية.</p>
            </div>
          </dl>
        </Section>


        <Section title="الوصول" description="التحكّم في إتاحة المنصة.">
          <div className="divide-y divide-line">
            <ToggleRow
              id="acceptAcademyRequests"
              title="استقبال طلبات إنشاء الأكاديميات"
              description="يعرض نموذج «اطلب أكاديميتك» في الموقع التعريفي للمنصة."
              checked={values.acceptAcademyRequests}
              onChange={(v) => set("acceptAcademyRequests", v)}
            />
            <ToggleRow
              id="maintenanceMode"
              title="وضع الصيانة"
              description="يوقف جميع مواقع الأكاديميات مؤقتاً ويعرض صفحة صيانة."
              checked={values.maintenanceMode}
              onChange={(v) => set("maintenanceMode", v)}
              danger
            />
          </div>
        </Section>

        <div
          className={cn(
            "sticky bottom-0 flex flex-col-reverse gap-2 rounded-b-2xl border-t border-line bg-canvas/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end",
          )}
        >
          <p className={cn("text-sm text-ink-500 sm:me-auto", !dirty && "invisible")} aria-live="polite">
            لديك تغييرات غير محفوظة
          </p>
          <Button variant="ghost" disabled={!dirty} onClick={() => setValues(settings)}>
            تجاهل
          </Button>
          <Button type="submit" disabled={!dirty}>
            حفظ الإعدادات
          </Button>
        </div>
      </form>

      {dialog}
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-b border-line px-6 py-8 last-of-type:border-b-0 md:grid-cols-[16rem_1fr] md:gap-10">
      <div>
        <h2 className="font-bold text-ink-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
  danger,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <label htmlFor={id} className="cursor-pointer">
        <span className={cn("block text-[0.9375rem] font-semibold", danger && checked ? "text-red-700" : "text-ink-900")}>{title}</span>
        <span className="mt-0.5 block text-sm leading-6 text-ink-500">{description}</span>
      </label>
      <Switch id={id} checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
