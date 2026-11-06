import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { TAGS } from "@/lib/data";
import { verifyWebhook, type StreamVideo } from "@/lib/stream";

// Stream calls this when a video finishes encoding (or fails)
export async function POST(req: Request) {
  const body = await req.text();
  if (!verifyWebhook(body, req.headers.get("Webhook-Signature"))) return new Response("bad signature", { status: 401 });

  const v = JSON.parse(body) as StreamVideo;
  const project = await db.project.findFirst({ where: { streamUid: v.uid }, include: { category: true } });
  if (!project) return new Response("unknown video", { status: 200 });

  const ready = v.readyToStream || v.status?.state === "ready";
  const failed = v.status?.state === "error";
  if (!ready && !failed) return new Response("still processing", { status: 200 });

  await db.project.update({
    where: { id: project.id },
    data: ready
      ? { videoStatus: "ready", durationSec: v.duration, width: v.input?.width, height: v.input?.height }
      : { videoStatus: "error" },
  });
  for (const t of [TAGS.projects, TAGS.category(project.category.slug), TAGS.project(project.slug), TAGS.recent, TAGS.profile]) revalidateTag(t, "max");
  return new Response("ok");
}
