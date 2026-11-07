import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { db } from "@/lib/db";
import { r2Ready } from "@/lib/r2";

export const instant = false;

export default async function AdminProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, cats] = await Promise.all([
    db.project.findUnique({ where: { id }, include: { stills: { orderBy: { sortOrder: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);
  if (!p) notFound();
  const credits = Array.isArray(p.credits) ? (p.credits as { role: string; name: string }[]).map((c) => `${c.role}: ${c.name}`).join("\n") : "";
  const values = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v == null || typeof v === "object" ? "" : String(v)]));
  const cat = cats.find((c) => c.id === p.categoryId);
  return (
    <>
      <p className="font-mono text-xs text-dim mb-2"><Link href="/admin/projects" className="hover:text-paper">Projects</Link> / {cat?.name}</p>
      <h1 className="font-display text-4xl font-semibold mb-6">{p.title}</h1>
      <ProjectForm
        id={p.id}
        values={{ ...values, credits }}
        cats={cats}
        stills={p.stills.map((s) => ({ key: s.key, alt: s.alt }))}
        video={{ uid: p.streamUid, status: p.videoStatus, peaks: Array.isArray(p.peaks), durationSec: p.durationSec }}
        publicUrl={cat && p.status === "published" ? `/projects/${cat.slug}/${p.slug}` : null}
        uploads={r2Ready()}
      />
    </>
  );
}
