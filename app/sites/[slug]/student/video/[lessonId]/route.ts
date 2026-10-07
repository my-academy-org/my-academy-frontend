import { streamLessonVideo } from "@/lib/academy/video";

/** A lesson's video for the signed-in student, when the browser can't reach the API with its cookie (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/sites/[slug]/student/video/[lessonId]">) {
  return streamLessonVideo(request, (await params).lessonId);
}
