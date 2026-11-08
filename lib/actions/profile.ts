"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/r2";

export type SaveResult = { ok: true } | { error: string } | undefined;

const url = z.url().or(z.literal("")).transform((v) => v || null);
const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

const Profile = z.object({
  name: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  // textareas submit \r\n; the pages split paragraphs on \n\n
  bio: z.string().transform((v) => v.replace(/\r\n?/g, "\n").trim()).pipe(z.string().min(1)),
  quote: z.string().trim().transform((v) => v || null),
  location: z.string().trim().min(1),
  studied: z.string().trim().transform((v) => v || null),
  tools: z.string().transform(lines),
  clients: z.string().transform(lines),
  contactEmail: z.email(),
  replyTime: z.string().trim().transform((v) => v || null),
  instagramUrl: url,
  vimeoUrl: url,
  linkedinUrl: url,
  reelProjectId: z.string().transform((v) => v || null),
  portraitKey: z.string().transform((v) => v || null),
  resumeKey: z.string().transform((v) => v || null),
});

export async function saveProfile(_: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const parsed = Profile.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
  const old = await db.profile.findUnique({ where: { id: 1 }, select: { portraitKey: true, resumeKey: true } });
  await db.profile.update({ where: { id: 1 }, data: parsed.data });
  // a replaced file is dropped from R2 after the row points at the new one
  for (const k of [old?.portraitKey, old?.resumeKey]) if (k && ![parsed.data.portraitKey, parsed.data.resumeKey].includes(k)) await deleteObject(k).catch(() => {});
  updateTag(TAGS.profile);
  return { ok: true };
}
