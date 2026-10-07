"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { courseStatus, dash } from "@/lib/academy-admin/meta";
import type { CourseStatus, DashCourse } from "@/lib/academy-admin/types";
import { useAcademy } from "./AcademyStore";
import { CourseThumb } from "./parts";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export function CourseForm({ course }: { course?: DashCourse }) {
  const router = useRouter();
  const { createCourse, updateCourse, notify, live } = useAcademy();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    content: course?.content ?? "",
    thumbnailUrl: course?.thumbnailUrl,
    status: course?.status ?? ("DRAFT" as CourseStatus),
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string; thumbnail?: string }>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: typeof errors = {};
    if (values.title.trim().length < 3) next.title = "أدخل عنوان الدورة (3 أحرف على الأقل)";
    else if (values.title.trim().length > 191) next.title = "العنوان 191 حرفاً كحد أقصى";
    if (!values.description.trim()) next.description = "أضف وصفاً مختصراً يظهر في بطاقة الدورة";
    else if (values.description.length > 200) next.description = "الوصف المختصر 200 حرف كحد أقصى";
    if (live && values.thumbnailUrl && !URL.canParse(values.thumbnailUrl)) next.thumbnail = "أدخل رابطاً صحيحاً يبدأ بـ https://";
    setErrors(next);
    if (Object.keys(next).length) return;

    const input = { ...values, title: values.title.trim(), description: values.description.trim(), content: values.content.trim() };
    setSaving(true);
    if (course) {
      const res = await updateCourse(course.id, input);
      setSaving(false);
      if (!res.ok) return notify(res.message, "error");
      notify("تم حفظ الدورة");
      router.push(dash.course(course.id));
    } else {
      const res = await createCourse(input);
      setSaving(false);
      if (!res.ok) return notify(res.message, "error");
      notify(`تم إنشاء «${res.data.title}» — أضف دروسها الآن`);
      router.push(dash.lessons(res.data.id));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Panel title="معلومات الدورة">
          <div className="grid gap-5">
            <Field label="عنوان الدورة" htmlFor="title" error={errors.title}>
              <Input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="مثال: أساسيات JavaScript" aria-invalid={!!errors.title} />
            </Field>
            <Field
              label="وصف مختصر"
              htmlFor="description"
              error={errors.description}
              hint={`${values.description.length}/200 — يظهر في بطاقة الدورة وصفحة الدورات.`}
            >
              <Textarea id="description" rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} />
            </Field>
          </div>
        </Panel>

        {/* The API has no field for a course's long-form content yet. */}
        {!live && (
          <Panel title="محتوى الدورة" description="يظهر في صفحة الدورة: ما الذي سيتعلّمه الطالب، المتطلبات، وطريقة الدراسة.">
            <Field label="المحتوى" htmlFor="content" optional hint="افصل الفقرات بسطر فارغ. ابدأ السطر بـ • لعمل قائمة.">
              <Textarea id="content" rows={10} value={values.content} onChange={(e) => set("content", e.target.value)} placeholder={"عن الدورة…\n\nماذا ستتعلّم:\n• …\n• …"} />
            </Field>
          </Panel>
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <Panel title="صورة الدورة" bodyClassName="p-5">
          <CourseThumb course={{ thumbnailUrl: values.thumbnailUrl, tint: course?.tint ?? "#e0e7ff", title: values.title }} className="w-full rounded-xl" />
          {/* The API stores a link to the image (`imageUrl`); there is no image upload yet. */}
          {live && (
            <Field label="رابط الصورة" htmlFor="thumbnail" optional error={errors.thumbnail} hint="رابط صورة مرفوعة على الإنترنت، بنسبة 16:10." className="mt-3">
              <Input
                id="thumbnail"
                type="url"
                dir="ltr"
                className="text-start"
                placeholder="https://"
                value={values.thumbnailUrl ?? ""}
                onChange={(e) => {
                  set("thumbnailUrl", e.target.value.trim() || undefined);
                  setErrors((x) => ({ ...x, thumbnail: undefined }));
                }}
                aria-invalid={!!errors.thumbnail}
              />
            </Field>
          )}
          <div className={cn("mt-3 flex gap-2", live && "hidden")}>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" className="size-4" />
              {values.thumbnailUrl ? "تغيير الصورة" : "رفع صورة"}
            </Button>
            {values.thumbnailUrl && (
              <Button variant="ghost" size="sm" onClick={() => set("thumbnailUrl", undefined)}>
                إزالة
              </Button>
            )}
          </div>
          <p className={cn("mt-2 text-xs", errors.thumbnail ? "text-red-600" : "text-ink-500", live && "hidden")}>
            {errors.thumbnail ?? "JPG أو PNG بنسبة 16:10، حتى 4MB."}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="صورة الدورة"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > MAX_IMAGE_BYTES) return setErrors((x) => ({ ...x, thumbnail: "حجم الصورة أكبر من 4MB" }));
              set("thumbnailUrl", URL.createObjectURL(file));
            }}
          />
        </Panel>

        <Panel title="الحالة" bodyClassName="p-5">
          <div role="radiogroup" aria-label="حالة الدورة" className="grid gap-2">
            {(["DRAFT", "PUBLISHED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={values.status === s}
                onClick={() => set("status", s)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 text-start transition-[border-color,box-shadow]",
                  values.status === s ? "border-brand-600 ring-4 ring-brand-500/12" : "border-line hover:border-line-strong",
                )}
              >
                <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2", values.status === s ? "border-brand-600" : "border-line-strong")}>
                  {values.status === s && <span className="size-1.5 rounded-full bg-brand-600" />}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink-950">{courseStatus[s].label}</span>
                  <span className="block text-xs leading-5 text-ink-500">
                    {s === "DRAFT" ? "لا يراها الطلاب. جهّز الدروس أولاً." : "تظهر في موقع الأكاديمية فوراً."}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "جارٍ الحفظ…" : course ? "حفظ التعديلات" : "إنشاء الدورة"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.back()}>
              إلغاء
            </Button>
          </div>
        </Panel>
      </aside>
    </form>
  );
}
