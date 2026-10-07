import { streamLessonVideo } from "@/lib/academy/video";

/** A lesson's video for its owner, when the browser can't reach the API with its cookie (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/dashboard/lessons/[lessonId]/video">) {
  return streamLessonVideo(request, (await params).lessonId);
}
