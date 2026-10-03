"use client";

import { useRef, useState } from "react";
import { useConfirm } from "@/components/dashboard/ConfirmDialog";
import { RowMenu } from "@/components/dashboard/RowMenu";
import { EmptyState, PageHeader, Switch } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { formatLessons } from "@/lib/academy/format";
import { dash } from "@/lib/academy-admin/meta";
import type { Attachment, DashLesson } from "@/lib/academy-admin/types";
import { formatDuration, formatFileSize } from "@/lib/format";
import { useAcademy, type LessonInput } from "../AcademyStore";
import { CourseStatusBadge, CourseThumb } from "../parts";

export function LessonsView({ initialCourseId }: { initialCourseId?: string }) {
  const { courses, lessonsOf, moveLesson, deleteLesson, notify } = useAcademy();
  const { confirm, dialog } = useConfirm();
  const [courseId, setCourseId] = useState(() => courses.find((c) => c.id === initialCourseId)?.id ?? courses[0]?.id ?? "");
  const [editor, setEditor] = useState<{ open: boolean; lesson?: DashLesson; version: number }>({ open: false, version: 0 });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const course = courses.find((c) => c.id === courseId);
  const lessons = course ? lessonsOf(course.id) : [];
  const totalMinutes = lessons.reduce((sum, l) => sum + l.durationMinutes, 0);
  const openEditor = (lesson?: DashLesson) => setEditor((e) => ({ open: true, lesson, version: e.version + 1 }));

  if (courses.length === 0) {
    return (
      <>
        <PageHeader title="الدروس" />
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon="book" title="أنشئ دورة أولاً" description="الدروس تُضاف داخل الدورات." action={<Button href={dash.newCourse}>دورة جديدة</Button>} />
        </div>
      </>
    );
  }

  const move = (lesson: DashLesson, to: number) => {
    moveLesson(lesson.id, to);
    // Keep keyboard focus on the moved row's handle.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-lesson="${lesson.id}"] [data-move]`)?.focus());
  };

  return (
    <>
      <PageHeader
        title="الدروس"
        description="اختر الدورة، ثم أضف دروسها ورتّبها بالسحب أو بأزرار التحريك."
        actions={
          course && (
            <Button onClick={() => openEditor()}>
              <Icon name="plus" className="size-4" />
              درس جديد
            </Button>
          )
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Course picker */}
        <div className="lg:hidden">
          <Select aria-label="الدورة" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({lessonsOf(c.id).length})
              </option>
            ))}
          </Select>
        </div>
        <nav aria-label="الدورات" className="hidden rounded-2xl border border-line bg-white p-2 shadow-card lg:block">
          <p className="px-3 pt-2 pb-1.5 text-[0.6875rem] font-bold text-ink-400">الدورات</p>
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourseId(c.id)}
              aria-current={c.id === courseId ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors",
                c.id === courseId ? "bg-brand-50" : "hover:bg-muted",
              )}
            >
              <CourseThumb course={c} className="w-11" />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm font-bold", c.id === courseId ? "text-brand-800" : "text-ink-900")}>{c.title}</span>
                <span className="block text-xs text-ink-500">{formatLessons(lessonsOf(c.id).length)}</span>
              </span>
            </button>
          ))}
        </nav>

        {course && (
          <section className="rounded-2xl border border-line bg-white shadow-card">
            <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-6 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2 font-bold text-ink-950">
                  <span className="truncate">{course.title}</span>
                  <CourseStatusBadge status={course.status} />
                </h2>
                <p className="mt-0.5 text-sm text-ink-500">
                  {formatLessons(lessons.length)}
                  {totalMinutes > 0 && <> · {formatDuration(totalMinutes)}</>}
                </p>
              </div>
              <Button href={dash.course(course.id)} size="sm" variant="ghost">
                صفحة الدورة
              </Button>
            </header>

            {lessons.length === 0 ? (
              <EmptyState
                icon="play"
                title="لا توجد دروس في هذه الدورة"
                description="أضف الدرس الأول: فيديو وشرح ومرفقات."
                action={<Button onClick={() => openEditor()}>إضافة أول درس</Button>}
              />
            ) : (
              <ol ref={listRef} className="p-2" onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDropIndex(null)}>
                {lessons.map((l, i) => (
                  <li
                    key={l.id}
                    data-lesson={l.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(l.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", l.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropIndex(null);
                    }}
                    onDragOver={(e) => {
                      if (!dragId) return;
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropIndex(e.clientY < rect.top + rect.height / 2 ? i : i + 1);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId === null || dropIndex === null) return;
                      const from = lessons.findIndex((x) => x.id === dragId);
                      moveLesson(dragId, dropIndex > from ? dropIndex - 1 : dropIndex);
                      setDragId(null);
                      setDropIndex(null);
                    }}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-canvas",
                      dragId === l.id && "opacity-40",
                    )}
                  >
                    {dropIndex === i && dragId && <span className="absolute inset-x-3 -top-px h-0.5 rounded-full bg-brand-500" aria-hidden="true" />}
                    {dropIndex === i + 1 && i === lessons.length - 1 && dragId && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-500" aria-hidden="true" />
                    )}

                    <span className="cursor-grab text-ink-300 group-hover:text-ink-500 active:cursor-grabbing" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                        {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
                      </svg>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-canvas text-xs font-bold text-ink-600 ring-1 ring-line tabular-nums">
                      {l.order}
                    </span>
                    <button type="button" onClick={() => openEditor(l)} className="min-w-0 flex-1 text-start">
                      <span className="block truncate font-semibold text-ink-950 hover:text-brand-700">{l.title}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" className="size-3.5" />
                          {formatDuration(l.durationMinutes)}
                        </span>
                        {l.videoUrl ? (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="play" className="size-3.5" />
                            فيديو
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gold-600">
                            <Icon name="alert" className="size-3.5" />
                            بدون فيديو
                          </span>
                        )}
                        {l.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Icon name="layers2" className="size-3.5" />
                            {l.attachments.length} مرفق
                          </span>
                        )}
                        {l.isPreview && <span className="font-semibold text-brand-700">معاينة مجانية</span>}
                      </span>
                    </button>

                    <div className="flex items-center opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        data-move
                        aria-label={`تحريك «${l.title}» لأعلى`}
                        disabled={i === 0}
                        onClick={() => move(l, i - 1)}
                        className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-muted hover:text-ink-900 disabled:opacity-30"
                      >
                        <Icon name="chevron-down" className="size-4 rotate-180" />
                      </button>
                      <button
                        type="button"
                        aria-label={`تحريك «${l.title}» لأسفل`}
                        disabled={i === lessons.length - 1}
                        onClick={() => move(l, i + 1)}
                        className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-muted hover:text-ink-900 disabled:opacity-30"
                      >
                        <Icon name="chevron-down" className="size-4" />
                      </button>
                    </div>
                    <RowMenu
                      label={`إجراءات ${l.title}`}
                      items={[
                        { label: "تعديل الدرس", icon: "edit", onSelect: () => openEditor(l) },
                        {
                          label: "حذف الدرس",
                          icon: "trash",
                          tone: "danger",
                          separated: true,
                          onSelect: () =>
                            confirm({
                              title: "حذف الدرس",
                              description: (
                                <>
                                  سيتم حذف <b className="text-ink-900">{l.title}</b> وفيديو الدرس ومرفقاته، وتُعاد أرقام الدروس التالية.
                                </>
                              ),
                              confirmLabel: "حذف الدرس",
                              tone: "danger",
                              onConfirm: () => {
                                deleteLesson(l.id);
                                notify("تم حذف الدرس");
                              },
                            }),
                        },
                      ]}
                    />
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>

      {course && (
        <LessonEditor
          key={editor.version}
          open={editor.open}
          courseId={course.id}
          lesson={editor.lesson}
          onClose={() => setEditor((e) => ({ ...e, open: false }))}
        />
      )}
      {dialog}
    </>
  );
}

/* ------------------------------------------------------------------ */

function LessonEditor({ open, courseId, lesson, onClose }: { open: boolean; courseId: string; lesson?: DashLesson; onClose: () => void }) {
  const { lessonsOf, createLesson, updateLesson, moveLesson, notify } = useAcademy();
  const siblings = lessonsOf(courseId);
  const positions = lesson ? siblings.length : siblings.length + 1;
  const [values, setValues] = useState<LessonInput & { position: number }>({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    videoUrl: lesson?.videoUrl ?? "",
    content: lesson?.content ?? "",
    attachments: lesson?.attachments ?? [],
    durationMinutes: lesson?.durationMinutes ?? 10,
    isPreview: lesson?.isPreview ?? false,
    position: lesson?.order ?? siblings.length + 1,
  });
  const [errors, setErrors] = useState<{ title?: string; duration?: string; video?: string }>({});
  const videoRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (values.title.trim().length < 2) next.title = "أدخل عنوان الدرس";
    if (!(values.durationMinutes > 0)) next.duration = "أدخل مدة صحيحة بالدقائق";
    if (values.videoUrl && !/^(https?:\/\/|blob:)/.test(values.videoUrl)) next.video = "أدخل رابطاً يبدأ بـ https://";
    setErrors(next);
    if (Object.keys(next).length) return;

    const { position, ...input } = { ...values, title: values.title.trim(), videoUrl: values.videoUrl || undefined };
    if (lesson) {
      updateLesson(lesson.id, input);
      if (position !== lesson.order) moveLesson(lesson.id, position - 1);
      notify("تم حفظ الدرس");
    } else {
      const created = createLesson(courseId, input);
      if (position <= siblings.length) moveLesson(created.id, position - 1);
      notify(`تمت إضافة «${created.title}»`);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={lesson ? "تعديل الدرس" : "درس جديد"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button type="submit" form="lesson-form">{lesson ? "حفظ الدرس" : "إضافة الدرس"}</Button>
        </>
      }
    >
      <form id="lesson-form" onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-6">
        <Field label="عنوان الدرس" htmlFor="l-title" error={errors.title} className="sm:col-span-6">
          <Input id="l-title" value={values.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} autoFocus />
        </Field>
        <Field label="وصف مختصر" htmlFor="l-desc" optional className="sm:col-span-6">
          <Textarea id="l-desc" rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <Field label="الفيديو" htmlFor="l-video" error={errors.video} hint="رابط الفيديو من خدمة الاستضافة، أو ارفع ملفاً." className="sm:col-span-6">
          <div className="flex gap-2">
            <Input
              id="l-video"
              dir="ltr"
              className="text-start"
              value={values.videoUrl?.startsWith("blob:") ? "" : values.videoUrl}
              placeholder={values.videoUrl?.startsWith("blob:") ? "تم اختيار ملف فيديو" : "https://"}
              onChange={(e) => set("videoUrl", e.target.value)}
              aria-invalid={!!errors.video}
            />
            <Button variant="secondary" onClick={() => videoRef.current?.click()} className="h-11">
              <Icon name="upload" className="size-4" />
              رفع
            </Button>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="sr-only"
              tabIndex={-1}
              aria-label="ملف الفيديو"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                // Uploaded to video storage on save once the API is connected.
                if (file) set("videoUrl", URL.createObjectURL(file));
              }}
            />
          </div>
        </Field>

        <Field label="المدة (دقيقة)" htmlFor="l-duration" error={errors.duration} className="sm:col-span-2">
          <Input
            id="l-duration"
            type="number"
            min={1}
            inputMode="numeric"
            value={values.durationMinutes || ""}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
            aria-invalid={!!errors.duration}
          />
        </Field>
        <Field label="الترتيب" htmlFor="l-order" className="sm:col-span-2">
          <Select id="l-order" value={values.position} onChange={(e) => set("position", Number(e.target.value))}>
            {Array.from({ length: positions }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1 === positions && !lesson ? `${i + 1} (الأخير)` : i + 1}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="l-preview" className="text-sm font-semibold text-ink-800">معاينة مجانية</label>
          <div className="flex h-11 items-center gap-3">
            <Switch id="l-preview" checked={values.isPreview} onChange={(v) => set("isPreview", v)} label="معاينة مجانية" />
            <span className="text-xs text-ink-500">يظهر قبل التسجيل</span>
          </div>
        </div>

        <Field label="محتوى الدرس" htmlFor="l-content" optional hint="شرح مكتوب أو ملاحظات تظهر أسفل الفيديو." className="sm:col-span-6">
          <Textarea id="l-content" rows={5} value={values.content} onChange={(e) => set("content", e.target.value)} />
        </Field>

        <div className="sm:col-span-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-800">
              المرفقات <span className="ms-1 font-normal text-ink-400">(اختياري)</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => filesRef.current?.click()}>
              <Icon name="plus" className="size-4" />
              إضافة ملف
            </Button>
            <input
              ref={filesRef}
              type="file"
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-label="ملفات مرفقة"
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = "";
                const added: Attachment[] = files.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }));
                set("attachments", [...values.attachments, ...added]);
              }}
            />
          </div>
          {values.attachments.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line-strong px-4 py-4 text-center text-sm text-ink-500">ملفات PDF أو تمارين أو أكواد مصدرية يحمّلها الطالب.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
              {values.attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <Icon name="layers2" className="size-4 text-ink-400" />
                  <bdi className="min-w-0 flex-1 truncate text-ink-800">{a.name}</bdi>
                  <span className="text-xs text-ink-400">{formatFileSize(a.sizeKb)}</span>
                  <button
                    type="button"
                    aria-label={`إزالة ${a.name}`}
                    onClick={() => set("attachments", values.attachments.filter((x) => x.id !== a.id))}
                    className="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-muted hover:text-red-600"
                  >
                    <Icon name="x" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </Modal>
  );
}
