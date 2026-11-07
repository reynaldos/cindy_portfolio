import Link from "next/link";
import { field, kick } from "@/components/admin/fields";
import { createProject } from "@/lib/actions/projects";
import { db } from "@/lib/db";

export const instant = false;

const VIDEO = { none: "no video", processing: "processing", ready: "ready", error: "video error" };

export default async function AdminProjects() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { projects: { orderBy: { sortOrder: "asc" } } } });
  return (
    <>
      <h1 className="font-display text-4xl font-semibold mb-6">Projects</h1>
      <form action={createProject} className="flex gap-2 flex-wrap items-end bg-panel border border-line p-4 mb-6 max-w-2xl">
        <label className={`${kick} grid gap-1 flex-1 min-w-48`}>New project title<input name="title" required className={field} /></label>
        <label className={`${kick} grid gap-1`}>Category<select name="categoryId" className={field}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <button type="submit" className="btn pri">Create</button>
      </form>
      {cats.map((c) => (
        <section key={c.id} className="mb-6 max-w-2xl">
          <h2 className={`${kick} mb-2`}>{c.name} · {c.projects.length}</h2>
          {c.projects.length === 0 && <p className="font-mono text-xs text-dim">None yet.</p>}
          <ul className="grid gap-px bg-line border border-line">
            {c.projects.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3 bg-panel hover:bg-track px-4 py-3">
                  <span className="font-sans text-sm flex-1 truncate">{p.title}{p.subtitle && <span className="text-dim"> · {p.subtitle}</span>}</span>
                  <span className={`font-mono text-[11px] uppercase ${p.status === "published" ? "text-paper" : "text-dim"}`}>{p.status}</span>
                  <span className={`font-mono text-[11px] uppercase ${p.videoStatus === "error" ? "text-cut-text" : "text-dim"}`}>{VIDEO[p.videoStatus]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
