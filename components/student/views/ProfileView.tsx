"use client";

import { useRef, useState, type ReactNode } from "react";
import { Switch } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Input";
import { EMAIL_RE } from "@/lib/admin/meta";
import type { StudentProfile } from "@/lib/student/types";
import { StudentAvatar } from "../parts";
import { useStudent } from "../StudentStore";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function ProfileView() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-[1.75rem] font-extrabold tracking-tight text-ink-950">حسابي</h1>
        <p className="mt-1.5 text-ink-500">بياناتك الشخصية وكلمة المرور والإشعارات.</p>
      </header>
      <div className="space-y-6">
        <PersonalInfo />
        <PasswordForm />
        <Notifications />
        <a href="/login" className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3.5 text-sm font-semibold text-ink-600 shadow-card transition-colors hover:text-red-600">
          <Icon name="logout" className="size-4 rtl:rotate-180" />
          تسجيل الخروج
        </a>
      </div>
    </div>
  );
}

function Card({ title, description, footer, children }: { title: string; description?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white shadow-card">
      <div className="p-6">
        <h2 className="font-bold text-ink-950">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <div className="flex justify-end gap-2 rounded-b-2xl border-t border-line bg-canvas px-6 py-3.5">{footer}</div>}
    </section>
  );
}

function PersonalInfo() {
  const { profile, updateProfile, notify } = useStudent();
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; photo?: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);
  // Only the fields edited here; notifications save on their own.
  const pick = (p: StudentProfile) => [p.name, p.email, p.phone ?? "", p.avatarUrl ?? ""].join("|");
  const dirty = pick(draft) !== pick(profile);
  const set = (key: "name" | "email" | "phone", value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (draft.name.trim().length < 3) next.name = "أدخل اسمك الكامل";
        if (!EMAIL_RE.test(draft.email.trim())) next.email = "أدخل بريداً إلكترونياً صحيحاً";
        if (draft.phone && !/^\+?[\d\s-]{8,}$/.test(draft.phone)) next.phone = "رقم الجوال غير صحيح";
        setErrors(next);
        if (Object.keys(next).length) return;
        updateProfile({ ...profile, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone?.trim() || undefined, avatarUrl: draft.avatarUrl });
        notify("تم حفظ بياناتك");
      }}
    >
      <Card
        title="البيانات الشخصية"
        footer={
          <>
            <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(profile)}>تجاهل</Button>
            <Button type="submit" disabled={!dirty}>حفظ</Button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <StudentAvatar profile={draft} className="size-20 text-2xl" />
          <div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <Icon name="upload" className="size-4" />
                {draft.avatarUrl ? "تغيير الصورة" : "رفع صورة"}
              </Button>
              {draft.avatarUrl && (
                <Button variant="ghost" size="sm" onClick={() => setDraft((d) => ({ ...d, avatarUrl: undefined }))}>
                  إزالة
                </Button>
              )}
            </div>
            <p className={errors.photo ? "mt-2 text-xs text-red-600" : "mt-2 text-xs text-ink-500"}>{errors.photo ?? "صورة مربّعة JPG أو PNG، حتى 2MB."}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="صورة الملف الشخصي"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > MAX_PHOTO_BYTES) return setErrors((x) => ({ ...x, photo: "حجم الصورة أكبر من 2MB" }));
              setErrors((x) => ({ ...x, photo: undefined }));
              setDraft((d) => ({ ...d, avatarUrl: URL.createObjectURL(file) }));
            }}
          />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="الاسم الكامل" htmlFor="p-name" error={errors.name} className="sm:col-span-2">
            <Input id="p-name" value={draft.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
          </Field>
          <Field label="البريد الإلكتروني" htmlFor="p-email" error={errors.email}>
            <Input id="p-email" type="email" dir="ltr" className="text-start" value={draft.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
          </Field>
          <Field label="رقم الجوال" htmlFor="p-phone" optional error={errors.phone}>
            <Input id="p-phone" type="tel" dir="ltr" className="text-start" value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} />
          </Field>
        </div>
      </Card>
    </form>
  );
}

function PasswordForm() {
  const { notify } = useStudent();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const set = (key: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next: typeof errors = {};
        if (!values.current) next.current = "أدخل كلمة المرور الحالية";
        if (values.next.length < 8) next.next = "8 أحرف على الأقل";
        if (values.confirm !== values.next) next.confirm = "كلمتا المرور غير متطابقتين";
        setErrors(next);
        if (Object.keys(next).length) return;
        setValues({ current: "", next: "", confirm: "" });
        notify("تم تغيير كلمة المرور");
      }}
    >
      <Card title="كلمة المرور" description="استخدم 8 أحرف على الأقل." footer={<Button type="submit">تغيير كلمة المرور</Button>}>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="الحالية" htmlFor="pw-current" error={errors.current}>
            <Input id="pw-current" type="password" dir="ltr" className="text-start" autoComplete="current-password" value={values.current} onChange={(e) => set("current", e.target.value)} aria-invalid={!!errors.current} />
          </Field>
          <Field label="الجديدة" htmlFor="pw-new" error={errors.next}>
            <Input id="pw-new" type="password" dir="ltr" className="text-start" autoComplete="new-password" value={values.next} onChange={(e) => set("next", e.target.value)} aria-invalid={!!errors.next} />
          </Field>
          <Field label="تأكيد الجديدة" htmlFor="pw-confirm" error={errors.confirm}>
            <Input id="pw-confirm" type="password" dir="ltr" className="text-start" autoComplete="new-password" value={values.confirm} onChange={(e) => set("confirm", e.target.value)} aria-invalid={!!errors.confirm} />
          </Field>
        </div>
      </Card>
    </form>
  );
}

function Notifications() {
  const { profile, updateProfile, notify } = useStudent();
  const rows: { key: keyof StudentProfile["notifications"]; title: string; description: string }[] = [
    { key: "newLessons", title: "دروس جديدة", description: "عند إضافة دروس إلى دوراتك." },
    { key: "examReminders", title: "تذكير بالاختبارات", description: "قبل بدء أي اختبار بيوم." },
    { key: "results", title: "النتائج", description: "عند صدور نتيجة اختبار." },
  ];

  return (
    <Card title="الإشعارات" description={`تُرسل إلى ${profile.email}`}>
      <div className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
            <label htmlFor={`nt-${r.key}`} className="cursor-pointer">
              <span className="block text-[0.9375rem] font-semibold text-ink-900">{r.title}</span>
              <span className="block text-sm text-ink-500">{r.description}</span>
            </label>
            <Switch
              id={`nt-${r.key}`}
              label={r.title}
              checked={profile.notifications[r.key]}
              onChange={(v) => {
                updateProfile({ ...profile, notifications: { ...profile.notifications, [r.key]: v } });
                notify("تم حفظ تفضيلاتك");
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
