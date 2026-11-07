"use server";

import { requireAdmin } from "@/lib/auth";
import { presignPut } from "@/lib/r2";

// One signed PUT per file. The browser sends the bytes to R2 itself, then the form carries the key.
const KINDS = {
  portrait: { folder: "profile", types: ["image/jpeg", "image/png", "image/webp"] },
  resume: { folder: "profile", types: ["application/pdf"] },
  poster: { folder: "posters", types: ["image/jpeg", "image/png", "image/webp"] },
  still: { folder: "stills", types: ["image/jpeg", "image/png", "image/webp"] },
  captions: { folder: "captions", types: ["text/vtt", ""] },
};
const MAX = 10 * 1024 * 1024;

export type UploadKind = keyof typeof KINDS;

export async function uploadUrl(kind: UploadKind, name: string, type: string, size: number): Promise<{ url: string; key: string } | { error: string }> {
  await requireAdmin();
  const ext = name.split(".").pop()?.toLowerCase() ?? "bin";
  if (!KINDS[kind].types.includes(type) || (kind === "captions" && ext !== "vtt")) return { error: `Use ${KINDS[kind].types.filter(Boolean).map((t) => t.split("/")[1]).join(", ")}.` };
  if (size > MAX) return { error: "The file is larger than 10 MB." };
  const key = `${KINDS[kind].folder}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  return { url: await presignPut(key), key };
}
