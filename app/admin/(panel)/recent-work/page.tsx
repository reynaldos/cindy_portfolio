import { RecentForm } from "@/components/admin/recent-form";
import { CATEGORY_COLOR } from "@/components/bay/const";
import type { Marker } from "@/components/pages/spots";
import { db } from "@/lib/db";

export const instant = false;

export default async function AdminRecentWork() {
  const [r, projects] = await Promise.all([
    db.recentWork.findUnique({ where: { id: 1 } }),
    db.project.findMany({ orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }], select: { id: true, title: true, subtitle: true, status: true, recentOrder: true, category: { select: { name: true, slug: true } } } }),
  ]);
  if (!r) return <p className="font-mono text-sm text-dim">No Recent Work row. Run the seed first.</p>;
  const items = projects.map((p) => ({ id: p.id, title: p.subtitle ? `${p.title} · ${p.subtitle}` : p.title, live: p.status === "published", color: CATEGORY_COLOR[p.category.slug], group: p.category.name, recentOrder: p.recentOrder }));
  return (
    <>
      <h1 className="font-display text-4xl font-semibold mb-6">Recent Work</h1>
      <RecentForm
        values={{ title: r.title, copy: r.copy, stampValue: r.stampValue ?? "", stampText: r.stampText ?? "" }}
        markers={Array.isArray(r.markers) ? (r.markers as Marker[]) : []}
        projects={items}
      />
    </>
  );
}
