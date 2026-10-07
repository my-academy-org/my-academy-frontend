import { headers } from "next/headers";
import { accessTokenHeader } from "@/lib/auth/backend";
import { getAccessToken } from "@/lib/auth/server";
import { sharesApiDomain } from "@/lib/auth/session";
import { ACADEMY_API_URL, PUBLIC_API_URL } from "./config";
import { apiId } from "./courses";

/**
 * Lesson video playback (docs/courses-lessons-api.md, GET /lessons/:id/video).
 *
 * The API streams the file itself and authenticates the request with the
 * session cookie. The browser only sends that cookie when the page lives on
 * the API's own domain (`*.my-academy.online`); anywhere else — an academy on
 * `ahmed.localhost`, a preview host — the request would arrive without it and
 * get a 401. There the video is played through this app instead, which adds
 * the cookie on the server.
 */

/**
 * What goes in `<video src>`: the API's address in front of the lesson's
 * `videoUrl` path when the browser can reach it with its cookie, else
 * `proxyPath` — a route of this app that calls `streamLessonVideo`.
 */
export async function lessonVideoSrc(apiPath: string | null, proxyPath: string) {
  if (!apiPath) return null;
  const hostname = ((await headers()).get("host") ?? "").split(":")[0];
  return sharesApiDomain(PUBLIC_API_URL, hostname) ? new URL(apiPath, PUBLIC_API_URL).href : proxyPath;
}

/** Headers of the API's answer the player needs, `Range` support included. */
const PASSED_ON = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];

/**
 * GET /lessons/:id/video with the session's `access_token`, passed straight
 * through: the body is streamed, never buffered, and `Range` goes both ways
 * so seeking works (200 for the whole file, 206 for a part). The API decides
 * who may watch: 401 without a session, 403 when not enrolled, 404 when the
 * lesson isn't available.
 */
export async function streamLessonVideo(request: Request, id: string) {
  const lessonId = apiId(id);
  if (!lessonId) return new Response(null, { status: 404 });
  const token = await getAccessToken();
  if (!token) return new Response(null, { status: 401 });

  const range = request.headers.get("range");
  let res: Response;
  try {
    res = await fetch(`${ACADEMY_API_URL}/lessons/${lessonId}/video`, {
      headers: { ...accessTokenHeader(token), ...(range ? { range } : {}) },
      cache: "no-store",
      // Stops the download from the API when the viewer seeks away or leaves.
      signal: request.signal,
    });
  } catch (error) {
    if (!request.signal.aborted) console.error(`[video] GET /lessons/${lessonId}/video failed`, error);
    return new Response(null, { status: 502 });
  }

  const passed = new Headers({ "cache-control": "private, no-store" });
  for (const name of PASSED_ON) {
    const value = res.headers.get(name);
    if (value) passed.set(name, value);
  }
  return new Response(res.ok ? res.body : null, { status: res.status, headers: passed });
}
