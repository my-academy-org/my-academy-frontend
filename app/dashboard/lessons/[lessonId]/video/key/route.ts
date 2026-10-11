import { lessonVideoKey } from "@/lib/academy/video";

/** The key that decrypts a lesson's video, for its owner (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/dashboard/lessons/[lessonId]/video/key">) {
  return lessonVideoKey(request, (await params).lessonId);
}
