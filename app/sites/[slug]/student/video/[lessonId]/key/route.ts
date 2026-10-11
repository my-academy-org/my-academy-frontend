import { lessonVideoKey } from "@/lib/academy/video";

/** The key that decrypts a lesson's video, for the signed-in student (lib/academy/video.ts). */
export async function GET(request: Request, { params }: RouteContext<"/sites/[slug]/student/video/[lessonId]/key">) {
  return lessonVideoKey(request, (await params).lessonId);
}
