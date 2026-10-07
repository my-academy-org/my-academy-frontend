"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Notice, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { loadLessonAction } from "@/lib/academy-admin/course-actions";
import { dash, lessonStatus } from "@/lib/academy-admin/meta";
import type { DashLesson, LessonStatus } from "@/lib/academy-admin/types";
import { uploadLessonVideo, type UploadedVideo } from "@/lib/academy-admin/video-upload";
import { minutesOf } from "@/lib/academy/courses";
import { useAcademy } from "./AcademyStore";

type Upload =
  | { phase: "idle" }
  /** The file is on its way to storage. */
  | { phase: "uploading"; fileName: string; percent: number }
  /** The file is in storage and is being registered (POST /lessons/video). */
  | { phase: "saving"; fileName: string }
  | { phase: "done"; fileName: string; video: UploadedVideo }
  | { phase: "error"; message: string };

/**
 * Add or edit a lesson against the API (docs/courses-lessons-api.md §4–5).
 *
 * A lesson can't exist without a video, so the video comes first: as soon as
 * a file is picked it is uploaded to storage and registered, and only then —
 * once there is a `mediaId` — can the lesson be saved. On an edit the lesson
 * already has its video; a `mediaId` is sent only when it was replaced.
 */
export function LessonForm({ courseId, lesson }: { courseId: string; lesson?: DashLesson }) {
  const router = useRouter();
  const { lessonsOf, createLesson, updateLesson, moveLesson, notify } = useAcademy();
  const siblings = lessonsOf(courseId);
  const positions = lesson ? siblings.length : siblings.length + 1;
  const [values, setValues] = useState({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    content: lesson?.content ?? "",
    status: lesson?.status ?? ("DRAFT" as LessonStatus),
    position: lesson?.order ?? siblings.length + 1,
  });
  // The list has no text or video: an existing lesson's are loaded with the page.
  const [current, setCurrent] = useState<{ loading: boolean; videoUrl?: string | null; error?: string }>({ loading: !!lesson });
  const [upload, setUpload] = useState<Upload>({ phase: "idle" });
  const [errors, setErrors] = useState<{ title?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const lessonId = lesson?.id;
  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    loadLessonAction(lessonId).then((res) => {
      if (cancelled) return;
      if (!res.ok) return setCurrent({ loading: false, error: res.message });
      setCurrent({ loading: false, videoUrl: res.data.videoUrl });
      setValues((v) => ({ ...v, content: res.data.content }));
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // An upload still running when the page is left is dropped.
  useEffect(() => () => abortRef.current?.abort(), []);

  const pickVideo = async (file: File) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({ phase: "uploading", fileName: file.name, percent: 0 });
    const res = await uploadLessonVideo(courseId, file, {
      signal: controller.signal,
      onProgress: (percent) => setUpload({ phase: "uploading", fileName: file.name, percent }),
      onSaving: () => setUpload({ phase: "saving", fileName: file.name }),
    });
    if (controller.signal.aborted) return;
    setUpload(res.ok ? { phase: "done", fileName: file.name, video: res.data } : { phase: "error", message: res.message });
  };

  const transferring = upload.phase === "uploading" || upload.phase === "saving";
  // A new lesson needs its video uploaded and registered first; an existing one already has it.
  const videoReady = lesson ? !transferring : upload.phase === "done";
  const locked = saving || current.loading || !videoReady;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const title = values.title.trim();
    const next: typeof errors = {};
    if (title.length < 2) next.title = "أدخل عنوان الدرس";
    else if (title.length > 191) next.title = "العنوان 191 حرفاً كحد أقصى";
    setErrors(next);
    if (Object.keys(next).length) return;

    const video = upload.phase === "done" ? upload.video : undefined;
    const input = {
      title,
      description: values.description.trim(),
      content: values.content.trim(),
      status: values.status,
      attachments: [],
      isPreview: false,
      durationMinutes: video ? minutesOf(video.seconds ?? null) : (lesson?.durationMinutes ?? 0),
      mediaId: video?.mediaId,
      videoSeconds: video?.seconds,
    };

    setSaving(true);
    const res = lesson ? await updateLesson(lesson.id, input) : await createLesson(courseId, input, values.position);
    if (!res.ok) {
      setSaving(false);
      return setErrors({ form: res.message });
    }
    if (lesson && values.position !== lesson.order) {
      const moved = await moveLesson(lesson.id, values.position - 1);
      if (!moved.ok) notify(`حُفظ الدرس، لكن تعذّر تغيير ترتيبه: ${moved.message}`, "error");
    }
    notify(lesson ? "تم حفظ الدرس" : `تمت إضافة «${title}»`);
    router.push(dash.lessons(courseId));
  };

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        {errors.form && <Notice tone="warning">{errors.form}</Notice>}
        {current.error && <Notice tone="warning">تعذّر تحميل محتوى الدرس وفيديوه: {current.error}</Notice>}

        <Panel
          title="فيديو الدرس"
          description={lesson ? "ارفع ملفاً جديداً لاستبدال الفيديو الحالي؛ يُحذف القديم عند حفظ الدرس." : "ابدأ من هنا: يُحفظ الدرس بعد اكتمال رفع الفيديو."}
        >
          {lesson && (upload.phase === "idle" || upload.phase === "error") && current.videoUrl && (
            <VideoPlayer src={current.videoUrl} title={lesson.title} className="mb-4 rounded-xl" />
          )}
          <div className="rounded-xl border border-dashed border-line-strong px-4 py-4">
            {transferring ? (
              <>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <bdi className="min-w-0 truncate text-ink-800">{upload.fileName}</bdi>
                  <span className="shrink-0 font-bold text-ink-900 tabular-nums">{upload.phase === "uploading" ? `${upload.percent}%` : "جارٍ حفظ الفيديو…"}</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="تقدّم رفع الفيديو"
                  aria-valuenow={upload.phase === "uploading" ? upload.percent : 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={cn("h-full rounded-full bg-brand-500 transition-[width]", upload.phase === "saving" && "animate-pulse")}
                    style={{ width: `${upload.phase === "uploading" ? upload.percent : 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ink-500">لا تغادر الصفحة حتى يكتمل رفع الفيديو وحفظه.</p>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="min-w-0 flex-1 text-sm text-ink-600">
                  {upload.phase === "done" ? (
                    <span className="inline-flex max-w-full items-center gap-1.5 font-semibold text-brand-700">
                      <Icon name="check" className="size-4 shrink-0" strokeWidth={2.5} />
                      <span className="truncate">
                        تم رفع الفيديو وحفظه: <bdi>{upload.fileName}</bdi>
                      </span>
                    </span>
                  ) : lesson ? (
                    "الفيديو الحالي محفوظ مع الدرس."
                  ) : (
                    "اختر ملف الفيديو (MP4 مثلاً). يبدأ الرفع فوراً."
                  )}
                </p>
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={saving}>
                  <Icon name="upload" className="size-4" />
                  {upload.phase === "done" || lesson ? "تغيير الفيديو" : "رفع فيديو"}
                </Button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="sr-only"
              tabIndex={-1}
              aria-label="ملف الفيديو"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) pickVideo(file);
              }}
            />
          </div>
          {upload.phase === "error" && <p className="mt-2 text-xs text-red-600">{upload.message}</p>}
        </Panel>

        <Panel title="معلومات الدرس">
          <div className="grid gap-5">
            <Field label="عنوان الدرس" htmlFor="l-title" error={errors.title}>
              <Input id="l-title" value={values.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} />
            </Field>
            <Field label="وصف مختصر" htmlFor="l-desc" optional>
              <Textarea id="l-desc" rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="محتوى الدرس" htmlFor="l-content" optional hint="شرح مكتوب أو ملاحظات تظهر أسفل الفيديو.">
              <Textarea id="l-content" rows={8} value={values.content} onChange={(e) => set("content", e.target.value)} disabled={current.loading} />
            </Field>
          </div>
        </Panel>
      </div>

      <aside className="lg:sticky lg:top-24">
        <Panel title="النشر والترتيب" bodyClassName="p-5">
          <div className="grid gap-5">
            <Field label="الحالة" htmlFor="l-status" hint="يرى الطلاب الدرس عندما يكون هو ودورته منشورَين.">
              <Select id="l-status" value={values.status} onChange={(e) => set("status", e.target.value as LessonStatus)}>
                {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((s) => (
                  <option key={s} value={s}>
                    {lessonStatus[s].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="الترتيب" htmlFor="l-order">
              <Select id="l-order" value={values.position} onChange={(e) => set("position", Number(e.target.value))}>
                {Array.from({ length: positions }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1 === positions && !lesson ? `${i + 1} (الأخير)` : i + 1}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={locked}>
              {saving ? "جارٍ الحفظ…" : lesson ? "حفظ الدرس" : "إضافة الدرس"}
            </Button>
            <Button variant="ghost" className="w-full" href={dash.lessons(courseId)}>
              إلغاء
            </Button>
          </div>
          {!saving && !videoReady && (
            <p className="mt-3 text-center text-xs leading-5 text-ink-500">
              {transferring ? "يُفتح الحفظ بعد اكتمال رفع الفيديو وحفظه." : "ارفع فيديو الدرس أولاً ليُفتح الحفظ."}
            </p>
          )}
        </Panel>
      </aside>
    </form>
  );
}
