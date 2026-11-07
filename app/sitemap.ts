import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data";
import { SITE } from "@/lib/media";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cats = await getCategories();
  const page = (path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap[number] => ({ url: `${SITE}${path}`, priority, lastModified });
  return [
    page("/", 1),
    page("/projects", 0.9),
    page("/recent-work", 0.8),
    page("/about", 0.7),
    ...cats.map((c) => page(`/projects/${c.slug}`, 0.8, c.projects[0]?.updatedAt)),
    ...cats.flatMap((c) => c.projects.map((p) => page(`/projects/${c.slug}/${p.slug}`, 0.6, p.updatedAt))),
  ];
}
