import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

// Cache tags. Admin actions call updateTag with these after a save.
export const TAGS = {
  profile: "profile",
  recent: "recent",
  categories: "categories",
  projects: "projects",
  category: (slug: string) => `category:${slug}`,
  project: (slug: string) => `project:${slug}`,
} as const;

export async function getProfile() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.profile);
  return db.profile.findUnique({ where: { id: 1 } });
}

// the lander reel: whichever project the profile points at, published or not
export async function getReel() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.profile, TAGS.projects);
  const p = await db.profile.findUnique({ where: { id: 1 }, select: { reelProjectId: true } });
  return p?.reelProjectId ? db.project.findUnique({ where: { id: p.reelProjectId } }) : null;
}

export async function getRecentWork() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.recent, TAGS.projects);
  const story = await db.recentWork.findUnique({ where: { id: 1 } });
  if (!story) return null;
  const spots = await db.project.findMany({
    where: { recentOrder: { not: null }, status: "published" },
    orderBy: { recentOrder: "asc" },
    include: { category: true },
  });
  return { ...story, spots };
}

export async function getCategories() {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.categories, TAGS.projects);
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { projects: { where: { status: "published" }, orderBy: { sortOrder: "asc" } } },
  });
}

export async function getCategoryProjects(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects, TAGS.category(slug));
  return db.category.findUnique({
    where: { slug },
    include: { projects: { where: { status: "published" }, orderBy: { sortOrder: "asc" }, include: { stills: { select: { id: true } } } } },
  });
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects, TAGS.project(slug));
  return db.project.findFirst({
    where: { slug, status: "published" },
    include: { category: true, stills: { orderBy: { sortOrder: "asc" } } },
  });
}
