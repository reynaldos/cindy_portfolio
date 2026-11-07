"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { db } from "@/lib/db";

export type SaveResult = { ok: true } | { error: string } | undefined;

const Recent = z.object({
  title: z.string().trim().min(1),
  copy: z.string().trim().min(1),
  stampValue: z.string().trim().transform((v) => v || null),
  stampText: z.string().trim().transform((v) => v || null),
  // feedback pins: label, note, and where on the sequence (0..1)
  markers: z.string().transform((v) => JSON.parse(v || "[]")).pipe(z.array(z.object({ label: z.string().trim().min(1), note: z.string().trim().min(1), at: z.number().min(0).max(1) }))),
  spots: z.string().transform((v) => JSON.parse(v || "[]")).pipe(z.array(z.string().min(1)).max(5)),
});

// Saves the story and the five spots. recentOrder is unique, so every row is cleared before the new order is set.
export async function saveRecentWork(_: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const parsed = Recent.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
  const { spots, ...data } = parsed.data;
  if (new Set(spots).size !== spots.length) return { error: "A spot is listed twice." };
  await db.$transaction([
    db.recentWork.update({ where: { id: 1 }, data }),
    db.project.updateMany({ where: { recentOrder: { not: null } }, data: { recentOrder: null } }),
    ...spots.map((id, i) => db.project.update({ where: { id }, data: { recentOrder: i } })),
  ]);
  updateTag(TAGS.recent);
  updateTag(TAGS.projects);
  return { ok: true };
}
