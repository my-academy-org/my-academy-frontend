import { lessonVideoPlaylist } from "@/lib/academy/video";
import { dash } from "@/lib/academy-admin/meta";

/** A lesson's video playlist for its owner, when the browser can't reach the API with its cookie (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/dashboard/lessons/[lessonId]/video">) {
  const { lessonId } = await params;
  return lessonVideoPlaylist(request, lessonId, dash.lessonVideoKey(lessonId));
}
