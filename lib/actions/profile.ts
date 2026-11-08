"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
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
  youtubeUrl: url,
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

// A video of its own for the home page: a hidden draft project the profile points at, so the upload, encode, and poster
// path is the one every project uses. It sits in the first category and never shows on the site while it stays a draft.
export async function createReelProject() {
  await requireAdmin();
  const cat = await db.category.findFirst({ orderBy: { sortOrder: "asc" }, select: { id: true } });
  if (!cat) return;
  const last = await db.project.aggregate({ where: { categoryId: cat.id }, _max: { sortOrder: true } });
  const p = await db.project.create({ data: { title: "Home reel", slug: `home-reel-${Date.now()}`, categoryId: cat.id, description: "The video on the home page. Keep it a draft so it stays out of the clip lists.", sortOrder: (last._max.sortOrder ?? -1) + 1 } });
  await db.profile.update({ where: { id: 1 }, data: { reelProjectId: p.id } });
  updateTag(TAGS.profile);
  redirect(`/admin/projects/${p.id}`);
}
