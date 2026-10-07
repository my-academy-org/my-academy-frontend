import type { ApiResult } from "@/lib/academy/courses";
import { registerVideoAction, requestVideoUploadAction } from "./course-actions";

/**
 * Lesson video upload (docs/courses-lessons-api.md §5), in the browser: the
 * file goes straight to storage through a signed link, never through the API
 * or this app's server.
 */

const failed = (message: string): ApiResult<never> => ({ ok: false, status: 0, message, raw: "" });

/** `fetch` reports no upload progress, hence XMLHttpRequest. Sent without credentials or extra headers. */
function putFile(url: string, headers: Record<string, string>, file: File, onProgress?: (percent: number) => void, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });
}

/** Whole seconds, read from the file's own metadata; undefined when the browser can't tell. */
function videoDuration(file: File) {
  return new Promise<number | undefined>((resolve) => {
    const video = document.createElement("video");
    const done = (seconds?: number) => {
      URL.revokeObjectURL(video.src);
      resolve(seconds);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? Math.round(video.duration) : undefined);
    video.onerror = () => done();
    video.src = URL.createObjectURL(file);
  });
}

export type UploadedVideo = { mediaId: number; seconds?: number };

/**
 * The three steps before a lesson can be saved, in order:
 *   1. POST /lessons/video/upload-url → a signed `uploadUrl` and its `key`
 *   2. PUT the file to `uploadUrl` (storage, not the API)
 *   3. POST /lessons/video with the `key` → `media.id`
 * The result's `mediaId` is what the lesson is then created or updated with.
 * `onSaving` fires once the file is in storage and step 3 starts.
 */
export async function uploadLessonVideo(
  courseId: string,
  file: File,
  { onProgress, onSaving, signal }: { onProgress?: (percent: number) => void; onSaving?: () => void; signal?: AbortSignal } = {},
): Promise<ApiResult<UploadedVideo>> {
  if (!file.type.startsWith("video/")) return failed("اختر ملف فيديو (مثل MP4).");

  const upload = await requestVideoUploadAction(courseId, file.name, file.type);
  if (!upload.ok) return upload;

  try {
    // The signed link only accepts the headers it was issued for (Content-Type must match).
    await putFile(upload.data.uploadUrl, upload.data.headers, file, onProgress, signal);
  } catch {
    return failed(signal?.aborted ? "أُلغي رفع الفيديو." : "تعذّر رفع الفيديو. تحقّق من اتصالك ثم حاول مرة أخرى.");
  }

  onSaving?.();
  const seconds = await videoDuration(file);
  const media = await registerVideoAction(upload.data.key, file.name, seconds);
  return media.ok ? { ok: true, data: { mediaId: media.data, seconds } } : media;
}
