import { headers } from "next/headers";
import { accessTokenHeader } from "@/lib/auth/backend";
import { getAccessToken } from "@/lib/auth/server";
import { sharesApiDomain } from "@/lib/auth/session";
import { ACADEMY_API_URL, PUBLIC_API_URL } from "./config";
import { apiId } from "./courses";

/**
 * Lesson video playback (docs/courses-lessons-api.md, GET /lessons/:id/video).
 *
 * A video is stored as encrypted HLS. The API answers with the playlist; its
 * segments are signed storage links the player downloads directly, and the
 * key that decrypts them comes from GET /lessons/:id/video/key. Both API
 * calls are authenticated with the session cookie, which the browser only
 * sends when the page lives on the API's own domain (`*.my-academy.online`);
 * anywhere else — an academy on `ahmed.localhost`, a preview host — they would
 * arrive without it and get a 401. There the playlist and the key are served
 * through this app instead, which adds the cookie on the server. The segments
 * come straight from storage either way.
 */

/**
 * The address the player loads: the API's address in front of the lesson's
 * `videoUrl` path when the browser can reach it with its cookie, else
 * `proxyPath` — a route of this app that calls `lessonVideoPlaylist`.
 */
export async function lessonVideoSrc(apiPath: string | null, proxyPath: string) {
  if (!apiPath) return null;
  const hostname = ((await headers()).get("host") ?? "").split(":")[0];
  return sharesApiDomain(PUBLIC_API_URL, hostname) ? new URL(apiPath, PUBLIC_API_URL).href : proxyPath;
}

const PRIVATE = { "cache-control": "private, no-store" };

/**
 * GET /lessons/:id/video{path} with the session's `access_token`. The API
 * decides who may watch: 401 without a session, 403 when not enrolled, 404
 * when the lesson isn't available, 409 while the video is still being
 * processed or when processing failed.
 */
async function videoRequest(request: Request, id: string, path: "" | "/key") {
  const lessonId = apiId(id);
  if (!lessonId) return new Response(null, { status: 404 });
  const token = await getAccessToken();
  if (!token) return new Response(null, { status: 401 });
  try {
    return await fetch(`${ACADEMY_API_URL}/lessons/${lessonId}/video${path}`, {
      headers: accessTokenHeader(token),
      cache: "no-store",
      signal: request.signal,
    });
  } catch (error) {
    if (!request.signal.aborted) console.error(`[video] GET /lessons/${lessonId}/video${path} failed`, error);
    return new Response(null, { status: 502 });
  }
}

/**
 * Points the playlist's key at `keyPath` and makes every other address
 * absolute, since the playlist is no longer read from where the API served it.
 */
function relocate(playlist: string, base: string, keyPath: string) {
  const absolute = (uri: string) => new URL(uri, base).href;
  return playlist
    .split("\n")
    .map((raw) => {
      const line = raw.trim();
      if (line.startsWith("#EXT-X-KEY")) return line.replace(/URI="[^"]*"/, `URI="${keyPath}"`);
      if (line.startsWith("#")) return line.replace(/URI="([^"]*)"/, (_, uri: string) => `URI="${absolute(uri)}"`);
      return line && absolute(line);
    })
    .join("\n");
}

/** The lesson's HLS playlist, with its decryption key read from `keyPath` — a route of this app that calls `lessonVideoKey`. */
export async function lessonVideoPlaylist(request: Request, id: string, keyPath: string) {
  const res = await videoRequest(request, id, "");
  if (!res.ok) return new Response(null, { status: res.status, headers: PRIVATE });
  const playlist = relocate(await res.text(), res.url, keyPath);
  return new Response(playlist, { headers: { ...PRIVATE, "content-type": "application/vnd.apple.mpegurl" } });
}

/** The 16 bytes that decrypt the lesson's video. */
export async function lessonVideoKey(request: Request, id: string) {
  const res = await videoRequest(request, id, "/key");
  if (!res.ok) return new Response(null, { status: res.status, headers: PRIVATE });
  return new Response(res.body, { headers: { ...PRIVATE, "content-type": "application/octet-stream" } });
}
