import { academyRoutes } from "@/lib/academy/nav";
import { lessonVideoPlaylist } from "@/lib/academy/video";

/** A lesson's video playlist for the signed-in student, when the browser can't reach the API with its cookie (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/sites/[slug]/student/video/[lessonId]">) {
  const { lessonId } = await params;
  return lessonVideoPlaylist(request, lessonId, academyRoutes.student.videoKey(lessonId));
}
