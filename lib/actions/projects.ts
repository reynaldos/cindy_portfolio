"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { db } from "@/lib/db";
import { MarkersField } from "@/lib/markers-field";
import { Prisma } from "@/lib/generated/prisma/client";
import { deleteObject } from "@/lib/r2";
import { createUpload, deleteVideo, getVideo } from "@/lib/stream";
import { singular, slugify } from "@/lib/utils";

export type SaveResult = { ok: true } | { error: string } | undefined;

// what a video change clears
const NO_VIDEO = { durationSec: null, width: null, height: null, peaks: Prisma.DbNull };
const opt = z.string().trim().transform((v) => v || null);

const Project = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).transform(slugify),
  subtitle: opt,
  client: opt,
  categoryId: z.string().min(1),
  year: z.string().trim().transform((v) => (v ? Number(v) : null)).pipe(z.number().int().min(1900).max(2100).nullable()),
  role: opt,
  director: opt,
  productionCo: opt,
  agency: opt,
  deliverables: opt,
  // one skill per line, from the chip field
  skills: z.string().transform((v) => [...new Set(v.split("\n").map((s) => s.trim()).filter(Boolean))]),
  description: z.string().trim().min(1),
  // one credit per line as "Role: Name"
  credits: z.string().transform((v) => v.split("\n").map((l) => l.split(/:\s*/, 2)).filter((p) => p[0]?.trim() && p[1]?.trim()).map(([role, name]) => ({ role: role.trim(), name: name.trim() }))),
  markers: MarkersField,
  posterKey: opt,
  posterTimeSec: z.coerce.number().min(0),
  captionsKey: opt,
  status: z.enum(["draft", "published"]),
  stills: z.string().transform((v) => JSON.parse(v || "[]")).pipe(z.array(z.object({ key: z.string().min(1), alt: z.string().trim() }))),
});

// every public page that can show a project
async function refresh(id: string) {
  const p = await db.project.findUnique({ where: { id }, select: { slug: true, category: { select: { slug: true } } } });
  for (const t of [TAGS.projects, TAGS.categories, TAGS.recent, TAGS.profile, ...(p ? [TAGS.project(p.slug), TAGS.category(p.category.slug)] : [])]) updateTag(t);
}

export async function createProject(form: FormData) {
  await requireAdmin();
  const title = String(form.get("title") ?? "").trim(), categoryId = String(form.get("categoryId") ?? "");
  if (!title || !categoryId) return;
  const slug = slugify(title) || `project-${Date.now()}`;
  const taken = await db.project.findUnique({ where: { slug }, select: { id: true } });
  const last = await db.project.aggregate({ where: { categoryId }, _max: { sortOrder: true } });
  const p = await db.project.create({ data: { title, slug: taken ? `${slug}-${Date.now()}` : slug, categoryId, description: title, sortOrder: (last._max.sortOrder ?? -1) + 1 } });
  redirect(`/admin/projects/${p.id}`);
}

export async function saveProject(id: string, _: SaveResult, form: FormData): Promise<SaveResult> {
  await requireAdmin();
  const parsed = Project.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
  const { stills, ...data } = parsed.data;
  const clash = await db.project.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } });
  if (clash) return { error: "URL slug must be unique. Another project already uses it." };
  const old = await db.project.findUnique({ where: { id }, select: { posterKey: true, captionsKey: true, stills: { select: { key: true } } } });
  if (!old) return { error: "Project not found." };
  await db.$transaction([
    db.project.update({ where: { id }, data }),
    db.projectStill.deleteMany({ where: { projectId: id } }),
    ...(stills.length ? [db.projectStill.createMany({ data: stills.map((s, i) => ({ projectId: id, key: s.key, alt: s.alt || data.title, sortOrder: i })) })] : []),
  ]);
  // files no longer referenced are dropped from R2
  const keep = new Set([data.posterKey, data.captionsKey, ...stills.map((s) => s.key)]);
  for (const k of [old.posterKey, old.captionsKey, ...old.stills.map((s) => s.key)]) if (k && !keep.has(k)) await deleteObject(k).catch(() => {});
  await refresh(id);
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const p = await db.project.findUnique({ where: { id }, include: { stills: true } });
  if (!p) return;
  await refresh(id);
  await db.$transaction([db.profile.updateMany({ where: { reelProjectId: id }, data: { reelProjectId: null } }), db.project.delete({ where: { id } })]);
  if (p.streamUid && !/^https?:/.test(p.streamUid)) await deleteVideo(p.streamUid).catch(() => {});
  for (const k of [p.posterKey, p.captionsKey, ...p.stills.map((s) => s.key)]) if (k) await deleteObject(k).catch(() => {});
  redirect("/admin/projects");
}

// A tus URL for the browser. The old video is dropped once the row points at the new one.
export async function videoUpload(id: string, name: string, size: number): Promise<{ uploadUrl: string } | { error: string }> {
  await requireAdmin();
  const p = await db.project.findUnique({ where: { id }, select: { streamUid: true } });
  if (!p) return { error: "Project not found." };
  const { uploadUrl, uid } = await createUpload(size, name);
  await db.project.update({ where: { id }, data: { streamUid: uid, videoStatus: "processing", ...NO_VIDEO } });
  if (p.streamUid && !/^https?:/.test(p.streamUid)) await deleteVideo(p.streamUid).catch(() => {});
  await refresh(id);
  return { uploadUrl };
}

export async function savePeaks(id: string, peaks: number[]) {
  await requireAdmin();
  if (peaks.length !== 240 || peaks.some((n) => typeof n !== "number" || n < 0 || n > 1)) return;
  await db.project.update({ where: { id }, data: { peaks } });
  await refresh(id);
}

export async function removeVideo(id: string) {
  await requireAdmin();
  const p = await db.project.findUnique({ where: { id }, select: { streamUid: true } });
  if (!p?.streamUid) return;
  await db.project.update({ where: { id }, data: { streamUid: null, videoStatus: "none", ...NO_VIDEO } });
  if (!/^https?:/.test(p.streamUid)) await deleteVideo(p.streamUid).catch(() => {});
  await refresh(id);
}

// the whole order of one category, as the dialog lays it out left to right
export async function setOrder(categoryId: string, ids: string[]): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const own = await db.project.findMany({ where: { categoryId }, select: { id: true } });
  if (own.length !== ids.length || !own.every((p) => ids.includes(p.id))) return { error: "The list changed. Reload and try again." };
  await db.$transaction(ids.map((id, i) => db.project.update({ where: { id }, data: { sortOrder: i } })));
  await refresh(ids[0]);
  return { ok: true };
}

export async function setStatus(id: string, status: "draft" | "published") {
  await requireAdmin();
  await db.project.update({ where: { id }, data: { status } });
  await refresh(id);
}

// Asks Stream how the encode is going and writes the answer, so the admin never waits on the webhook
export async function videoState(id: string) {
  await requireAdmin();
  const p = await db.project.findUnique({ where: { id }, select: { streamUid: true, videoStatus: true } });
  if (!p?.streamUid || p.videoStatus !== "processing" || /^https?:/.test(p.streamUid)) return p?.videoStatus ?? "none";
  const v = await getVideo(p.streamUid).catch(() => null);
  if (!v) return "processing";
  if (v.readyToStream) await db.project.update({ where: { id }, data: { videoStatus: "ready", durationSec: v.duration, width: v.input?.width, height: v.input?.height } });
  else if (v.status?.state === "error") await db.project.update({ where: { id }, data: { videoStatus: "error" } });
  else return "processing";
  await refresh(id);
  return v.readyToStream ? "ready" : "error";
}

// Everything the admin shell should be watching: encodes to poll, and ready videos still without a waveform to scan
export async function pendingVideos() {
  await requireAdmin();
  const rows = await db.project.findMany({
    where: { streamUid: { not: null }, OR: [{ videoStatus: "processing" }, { videoStatus: "ready", peaks: { equals: Prisma.DbNull }, durationSec: { not: null } }] },
    select: { id: true, title: true, streamUid: true, durationSec: true, videoStatus: true },
    orderBy: { durationSec: "asc" },
  });
  return {
    encoding: rows.filter((r) => r.videoStatus === "processing").map((r) => ({ id: r.id, title: r.title })),
    scanning: rows.filter((r) => r.videoStatus === "ready").map((r) => ({ id: r.id, title: r.title, uid: r.streamUid!, durationSec: r.durationSec! })),
  };
}

// The whole category list from the dialog, top to bottom: renames, colours, order, new rows (ids starting "new"), and
// rows left out are deleted when they hold no project. The slug follows the name; the old one is kept for redirects.
export async function saveCategories(rows: { id: string; name: string; color: string }[]): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const own = await db.category.findMany({ select: { id: true, slug: true, oldSlugs: true, _count: { select: { projects: true } } } });
  if (rows.some((r) => !r.id.startsWith("new") && !own.some((c) => c.id === r.id))) return { error: "The list changed. Reload and try again." };
  const clean = rows.map((r) => ({ ...r, name: r.name.trim(), slug: slugify(r.name) }));
  if (clean.some((r) => !r.name)) return { error: "Every category needs a name." };
  if (clean.some((r) => !r.slug)) return { error: "A name needs at least one letter or number." };
  if (new Set(clean.map((r) => r.slug)).size !== clean.length) return { error: "Two categories would share the same URL." };
  if (clean.some((r) => !/^#[0-9a-f]{6}$/i.test(r.color))) return { error: "Colours must be hex, like #f28c38." };
  const gone = own.filter((c) => !clean.some((r) => r.id === c.id));
  if (gone.some((c) => c._count.projects)) return { error: "Move or delete the clips in a category before deleting it." };
  const taken = new Set(clean.map((r) => r.slug));
  await db.$transaction([
    ...gone.map((c) => db.category.delete({ where: { id: c.id } })),
    ...clean.map((r, i) => {
      const data = { name: r.name, one: singular(r.name), slug: r.slug, color: r.color.toLowerCase(), sortOrder: i + 1 };
      const was = own.find((c) => c.id === r.id);
      if (!was) return db.category.create({ data });
      // a slug that is live again is no longer old anywhere; a slug just left behind is kept for its redirect
      const oldSlugs = [...new Set([...was.oldSlugs, ...(was.slug !== r.slug ? [was.slug] : [])])].filter((s) => !taken.has(s));
      return db.category.update({ where: { id: r.id }, data: { ...data, oldSlugs } });
    }),
  ]);
  for (const t of [TAGS.categories, TAGS.projects, TAGS.recent, ...own.map((c) => TAGS.category(c.slug)), ...clean.map((r) => TAGS.category(r.slug))]) updateTag(t);
  return { ok: true };
}
