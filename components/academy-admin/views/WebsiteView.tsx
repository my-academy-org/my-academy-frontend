"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { DetailRow, EmptyState, Notice, PageHeader, Panel, Tabs } from "@/components/dashboard/ui";
import { BrowserFrame } from "@/components/mockups/BrowserFrame";
import { TemplatePreview } from "@/components/mockups/TemplatePreview";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { ROOT_DOMAIN } from "@/lib/academy/config";
import { dash } from "@/lib/academy-admin/meta";
import { planLabels } from "@/lib/academy-admin/plan";
import type { MediaItem, WebsiteContent } from "@/lib/academy-admin/types";
import { formatDate, formatFileSize } from "@/lib/format";
import { templates as templateInfo } from "@/lib/site";
import { useAcademy } from "../AcademyStore";
import { AcademyLogo, CourseThumb } from "../parts";
import { PlanGate, ProBadge, useUpgrade } from "../Upgrade";

type Tab = "content" | "courses" | "media";

const templateKey = { MODERN: "modern", ACADEMIC: "academic", PREMIUM: "premium" } as const;

export function WebsiteView() {
  const { profile, website, can } = useAcademy();
  const [tab, setTab] = useState<Tab>("content");
  const editable = can("websiteEditor");
  const template = templateInfo.find((t) => t.id === templateKey[profile.template])!;
  const url = `${profile.slug}.${ROOT_DOMAIN}`;

  return (
    <>
      <PageHeader
        title="موقع الأكاديمية"
        description="الموقع العام الذي يزوره طلابك للتعرّف على أكاديميتك والتسجيل في دوراتها."
      />

      <section className="mb-8 grid items-center gap-6 rounded-2xl border border-line bg-white p-5 shadow-card md:grid-cols-[18rem_1fr]">
        <BrowserFrame url={url} compact className="pointer-events-none shadow-card">
          <div className="aspect-[16/10] overflow-hidden">
            <TemplatePreview template={template.id} academy={{ name: profile.name, teacher: website.instructor.name, subject: template.sample.subject, subdomain: profile.slug }} />
          </div>
        </BrowserFrame>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <SiteFact label="العنوان">
            <a href={profile.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
              <bdi>{url}</bdi>
              <Icon name="external" className="size-3.5" />
            </a>
          </SiteFact>
          <SiteFact label="القالب">
            <span className="font-semibold text-ink-900">
              <bdi>{template.name}</bdi> · {template.arabicName}
            </span>
            <span className="block text-xs text-ink-500">يُغيَّر القالب عبر فريق المنصة.</span>
          </SiteFact>
          <SiteFact label="الحالة">
            <span className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              منشور ومتاح للطلاب
            </span>
          </SiteFact>
          <SiteFact label="إدارة المحتوى">
            <span className="font-semibold text-ink-900">{editable ? "مباشرةً من لوحتك" : "عبر فريق المنصة"}</span>
            <span className="block text-xs text-ink-500">خطة {planLabels[profile.plan]}</span>
          </SiteFact>
        </dl>
      </section>

      <Tabs
        label="أقسام الموقع"
        value={tab}
        onChange={setTab}
        className="mb-6"
        tabs={[
          { value: "content", label: "محتوى الصفحات" },
          { value: "courses", label: "الدورات في الموقع" },
          { value: "media", label: <span className="inline-flex items-center gap-1.5">مكتبة الوسائط {!can("mediaLibrary") && <ProBadge />}</span> },
        ]}
      />

      {tab === "content" && (editable ? <ContentEditor /> : <ContentReadOnly />)}
      {tab === "courses" && <CoursesOnSite editable={editable} />}
      {tab === "media" && (can("mediaLibrary") ? <MediaLibrary /> : <PlanGate feature="mediaLibrary" />)}
    </>
  );
}

function SiteFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PRO: direct editing                                                 */
/* ------------------------------------------------------------------ */

function ContentEditor() {
  const { website, profile, updateWebsite, notify } = useAcademy();
  const [values, setValues] = useState<WebsiteContent>(website);
  const logoRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(website);

  const patch = <K extends keyof WebsiteContent>(key: K, value: Partial<WebsiteContent[K]>) =>
    setValues((v) => ({ ...v, [key]: typeof value === "object" && value !== null ? { ...(v[key] as object), ...value } : value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.hero.title.trim()) return notify("عنوان الواجهة مطلوب", "error");
        updateWebsite(values);
        notify("تم نشر التغييرات على موقع الأكاديمية");
      }}
      className="space-y-6"
    >
      <Section title="الشعار" description="يظهر في أعلى الموقع وفي تبويب المتصفح.">
        <div className="flex items-center gap-4">
          <AcademyLogo name={profile.name} logoUrl={values.logoUrl} color={profile.brandColor} className="size-16 rounded-2xl text-xl" />
          <div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => logoRef.current?.click()}>
                <Icon name="upload" className="size-4" />
                {values.logoUrl ? "تغيير الشعار" : "رفع شعار"}
              </Button>
              {values.logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setValues((v) => ({ ...v, logoUrl: undefined }))}>
                  إزالة
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-500">PNG أو SVG مربّع، حتى 2MB.</p>
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="ملف الشعار"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) setValues((v) => ({ ...v, logoUrl: URL.createObjectURL(file) }));
            }}
          />
        </div>
      </Section>

      <Section title="الواجهة الرئيسية" description="أول ما يراه الزائر في الصفحة الرئيسية.">
        <div className="grid gap-5">
          <Field label="سطر تمهيدي" htmlFor="w-eyebrow" optional>
            <Input id="w-eyebrow" value={values.hero.eyebrow} onChange={(e) => patch("hero", { eyebrow: e.target.value })} placeholder="مثال: دفعة جديدة متاحة الآن" />
          </Field>
          <Field label="العنوان الرئيسي" htmlFor="w-title">
            <Input id="w-title" value={values.hero.title} onChange={(e) => patch("hero", { title: e.target.value })} />
          </Field>
          <Field label="الوصف" htmlFor="w-desc">
            <Textarea id="w-desc" rows={3} value={values.hero.description} onChange={(e) => patch("hero", { description: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="عن الأكاديمية" description="نبذة تعرّف الزائر بأسلوبك وما يميّز أكاديميتك.">
        <div className="grid gap-5">
          <Field label="العنوان" htmlFor="w-about-title">
            <Input id="w-about-title" value={values.about.title} onChange={(e) => patch("about", { title: e.target.value })} />
          </Field>
          <Field label="النص" htmlFor="w-about">
            <Textarea id="w-about" rows={4} value={values.about.description} onChange={(e) => patch("about", { description: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="بيانات المعلّم" description="تظهر في صفحة «عن المعلّم» وفي الصفحة الرئيسية.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الاسم" htmlFor="w-name">
            <Input id="w-name" value={values.instructor.name} onChange={(e) => patch("instructor", { name: e.target.value })} />
          </Field>
          <Field label="المسمّى" htmlFor="w-role" optional>
            <Input id="w-role" value={values.instructor.title} onChange={(e) => patch("instructor", { title: e.target.value })} placeholder="مثال: مدرّس الفيزياء للمرحلة الثانوية" />
          </Field>
          <Field label="سنوات الخبرة" htmlFor="w-years" optional>
            <Input
              id="w-years"
              type="number"
              min={0}
              value={values.instructor.experienceYears ?? ""}
              onChange={(e) => patch("instructor", { experienceYears: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label="نبذة" htmlFor="w-bio" className="sm:col-span-2">
            <Textarea id="w-bio" rows={4} value={values.instructor.bio} onChange={(e) => patch("instructor", { bio: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="معلومات التواصل" description="تظهر في صفحة «تواصل معنا» وتذييل الموقع.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="البريد الإلكتروني" htmlFor="w-email" optional>
            <Input id="w-email" type="email" dir="ltr" className="text-start" value={values.contact.email} onChange={(e) => patch("contact", { email: e.target.value })} />
          </Field>
          <Field label="الهاتف" htmlFor="w-phone" optional>
            <Input id="w-phone" type="tel" dir="ltr" className="text-start" value={values.contact.phone} onChange={(e) => patch("contact", { phone: e.target.value })} />
          </Field>
          <Field label="واتساب" htmlFor="w-wa" optional>
            <Input id="w-wa" type="tel" dir="ltr" className="text-start" value={values.contact.whatsapp} onChange={(e) => patch("contact", { whatsapp: e.target.value })} />
          </Field>
          <Field label="مواعيد العمل" htmlFor="w-hours" optional>
            <Input id="w-hours" value={values.contact.workingHours} onChange={(e) => patch("contact", { workingHours: e.target.value })} />
          </Field>
          <Field label="العنوان" htmlFor="w-address" optional className="sm:col-span-2">
            <Input id="w-address" value={values.contact.address} onChange={(e) => patch("contact", { address: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="تذييل الموقع" description="جملة قصيرة أسفل كل الصفحات.">
        <Field label="الوصف المختصر" htmlFor="w-footer" optional>
          <Input id="w-footer" value={values.footerTagline} onChange={(e) => setValues((v) => ({ ...v, footerTagline: e.target.value }))} />
        </Field>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-white/95 px-5 py-3.5 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        <p className={cn("text-sm text-ink-500 sm:me-auto", !dirty && "invisible")} aria-live="polite">
          لديك تغييرات غير منشورة
        </p>
        <Button variant="ghost" disabled={!dirty} onClick={() => setValues(website)}>تجاهل</Button>
        <Button type="submit" disabled={!dirty}>نشر التغييرات</Button>
      </div>
    </form>
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

/* ------------------------------------------------------------------ */
/* BASIC: content is managed by the platform team                      */
/* ------------------------------------------------------------------ */

const SECTIONS = ["الشعار", "الواجهة الرئيسية", "عن الأكاديمية", "بيانات المعلّم", "معلومات التواصل", "تذييل الموقع", "أخرى"];

function ContentReadOnly() {
  const { website, profile } = useAcademy();
  const upgrade = useUpgrade();
  const [request, setRequest] = useState<{ open: boolean; section: string; version: number }>({ open: false, section: SECTIONS[1], version: 0 });
  const ask = (section: string) => setRequest((r) => ({ open: true, section, version: r.version + 1 }));
  const empty = <span className="text-ink-400">—</span>;

  const block = (title: string, rows: [string, ReactNode][]) => (
    <Panel
      title={title}
      bodyClassName="px-6 py-2"
      action={
        <Button size="sm" variant="ghost" onClick={() => ask(title)}>
          <Icon name="chat" className="size-4" />
          طلب تعديل
        </Button>
      }
    >
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <DetailRow key={label} label={label}>
            {value || empty}
          </DetailRow>
        ))}
      </dl>
    </Panel>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-600 ring-1 ring-line">
          <Icon name="users" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink-950">فريق المنصة يحدّث محتوى موقعك</p>
          <p className="mt-0.5 text-sm leading-6 text-ink-500">
            في خطة Basic ترسل ما تريد تغييره، ونطبّقه لك عادةً خلال يوم عمل. لتعديل المحتوى بنفسك فوراً، رقِّ إلى Pro.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => upgrade("websiteEditor")}>
            عن خطة Pro
          </Button>
          <Button onClick={() => ask(SECTIONS[1])}>طلب تعديل</Button>
        </div>
      </div>

      {block("الواجهة الرئيسية", [
        ["سطر تمهيدي", website.hero.eyebrow],
        ["العنوان الرئيسي", website.hero.title],
        ["الوصف", <p key="d" className="leading-7 text-ink-700">{website.hero.description}</p>],
      ])}
      {block("عن الأكاديمية", [
        ["العنوان", website.about.title],
        ["النص", <p key="a" className="leading-7 text-ink-700">{website.about.description}</p>],
      ])}
      {block("بيانات المعلّم", [
        ["الاسم", website.instructor.name],
        ["المسمّى", website.instructor.title],
        ["سنوات الخبرة", website.instructor.experienceYears?.toString()],
        ["نبذة", <p key="b" className="leading-7 text-ink-700">{website.instructor.bio}</p>],
      ])}
      {block("معلومات التواصل", [
        ["البريد الإلكتروني", website.contact.email && <bdi>{website.contact.email}</bdi>],
        ["الهاتف", website.contact.phone && <bdi>{website.contact.phone}</bdi>],
        ["واتساب", website.contact.whatsapp && <bdi>{website.contact.whatsapp}</bdi>],
        ["مواعيد العمل", website.contact.workingHours],
        ["العنوان", website.contact.address],
      ])}
      {block("الشعار والتذييل", [
        ["الشعار", <AcademyLogo key="l" name={profile.name} logoUrl={website.logoUrl} color={profile.brandColor} />],
        ["تذييل الموقع", website.footerTagline],
      ])}

      <ChangeRequestModal key={request.version} open={request.open} section={request.section} onClose={() => setRequest((r) => ({ ...r, open: false }))} />
    </div>
  );
}

function ChangeRequestModal({ open, section, onClose }: { open: boolean; section: string; onClose: () => void }) {
  const { notify } = useAcademy();
  const [values, setValues] = useState({ section: SECTIONS.includes(section) ? section : "أخرى", message: "" });
  const [error, setError] = useState<string>();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="طلب تعديل محتوى الموقع"
      description="صف التغيير المطلوب بوضوح، وسيطبّقه فريق المنصة ويُعلمك عند الانتهاء."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button type="submit" form="change-request">إرسال الطلب</Button>
        </>
      }
    >
      <form
        id="change-request"
        noValidate
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (values.message.trim().length < 10) return setError("اكتب وصفاً للتعديل (10 أحرف على الأقل)");
          notify("تم إرسال طلب التعديل إلى فريق المنصة");
          onClose();
        }}
      >
        <Field label="القسم" htmlFor="cr-section">
          <Select id="cr-section" value={values.section} onChange={(e) => setValues((v) => ({ ...v, section: e.target.value }))}>
            {SECTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="التعديل المطلوب" htmlFor="cr-message" error={error}>
          <Textarea
            id="cr-message"
            rows={5}
            value={values.message}
            onChange={(e) => {
              setValues((v) => ({ ...v, message: e.target.value }));
              setError(undefined);
            }}
            placeholder="مثال: غيّر العنوان الرئيسي إلى…"
            aria-invalid={!!error}
            autoFocus
          />
        </Field>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

function CoursesOnSite({ editable }: { editable: boolean }) {
  const { courses, website, updateWebsite, notify } = useAcademy();
  const upgrade = useUpgrade();
  const published = courses.filter((c) => c.status === "PUBLISHED");
  const featured = new Set(website.featuredCourseIds);

  return (
    <div className="space-y-4">
      <Notice tone="info">
        تظهر في الموقع الدورات <b>المنشورة</b> فقط، بعنوانها ووصفها وصورتها. لتعديل بيانات أي دورة افتح{" "}
        <Link href={dash.courses} className="font-semibold text-brand-700 underline">الدورات</Link>.
      </Notice>
      <Panel
        title="الدورات المميّزة في الصفحة الرئيسية"
        description={editable ? "اختر حتى 3 دورات تظهر في الواجهة." : "تحديد الدورات المميّزة متاح في خطة Pro."}
        bodyClassName="p-0"
        action={!editable && <ProBadge />}
      >
        {published.length === 0 ? (
          <EmptyState icon="book" title="لا توجد دورات منشورة" className="py-10" />
        ) : (
          <ul className="divide-y divide-line">
            {published.map((c) => {
              const on = featured.has(c.id);
              return (
                <li key={c.id} className="flex items-center gap-4 px-6 py-3.5">
                  <CourseThumb course={c} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink-950">{c.title}</p>
                    <p className="truncate text-xs text-ink-500">{c.description}</p>
                  </div>
                  {editable ? (
                    <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-700">
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={!on && featured.size >= 3}
                        onChange={() => {
                          const ids = on ? website.featuredCourseIds.filter((x) => x !== c.id) : [...website.featuredCourseIds, c.id];
                          updateWebsite({ ...website, featuredCourseIds: ids });
                          notify(on ? "أُزيلت من الدورات المميّزة" : "أُضيفت إلى الدورات المميّزة");
                        }}
                        className="size-4 rounded accent-brand-700 disabled:opacity-40"
                      />
                      مميّزة
                    </label>
                  ) : (
                    on && <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-ink-600">مميّزة</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {!editable && (
          <div className="border-t border-line px-6 py-3">
            <button type="button" onClick={() => upgrade("websiteEditor")} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
              تعرّف على خطة Pro
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PRO: media library                                                  */
/* ------------------------------------------------------------------ */

const mediaIcon = { image: "image", video: "play", file: "layers2" } as const;

function MediaLibrary() {
  const { media, addMedia, deleteMedia, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const totalKb = media.reduce((s, m) => s + m.sizeKb, 0);

  const kindOf = (type: string): MediaItem["kind"] => (type.startsWith("image/") ? "image" : type.startsWith("video/") ? "video" : "file");

  return (
    <div className="rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
        <p className="text-sm text-ink-500">
          {media.length} ملف · {formatFileSize(totalKb)}
        </p>
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          <Icon name="upload" className="size-4" />
          رفع ملفات
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="رفع ملفات"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            files.forEach((f) => addMedia({ name: f.name, kind: kindOf(f.type), sizeKb: Math.max(1, Math.round(f.size / 1024)) }));
            if (files.length) notify(`تم رفع ${files.length} ملف`);
          }}
        />
      </div>
      {media.length === 0 ? (
        <EmptyState icon="image" title="المكتبة فارغة" description="ارفع الصور والفيديوهات والملفات لتستخدمها في الدروس وموقع الأكاديمية." />
      ) : (
        <ul className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="group overflow-hidden rounded-xl border border-line">
              <div className="grid aspect-[4/3] place-items-center bg-canvas text-ink-400">
                <Icon name={mediaIcon[m.kind]} className="size-8" />
              </div>
              <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <bdi className="block truncate text-sm font-semibold text-ink-900">{m.name}</bdi>
                  <p className="text-xs text-ink-500">
                    {formatFileSize(m.sizeKb)} · {formatDate(m.uploadedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`حذف ${m.name}`}
                  onClick={() =>
                    confirm({
                      title: "حذف الملف",
                      description: (
                        <>
                          سيُحذف <bdi className="font-semibold text-ink-900">{m.name}</bdi> من المكتبة، وأي مكان يستخدمه سيعرض مساحة فارغة.
                        </>
                      ),
                      confirmLabel: "حذف",
                      tone: "danger",
                      onConfirm: () => {
                        deleteMedia(m.id);
                        notify("تم حذف الملف");
                      },
                    })
                  }
                  className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-muted hover:text-red-600"
                >
                  <Icon name="trash" className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dialog}
    </div>
  );
}
