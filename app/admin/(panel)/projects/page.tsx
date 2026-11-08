import Link from "next/link";
import { Select, field, kick } from "@/components/admin/fields";
import { CategoriesDialog } from "@/components/admin/categories-dialog";
import { OrderDialog } from "@/components/admin/order-dialog";
import { CATEGORY_COLOR } from "@/components/bay/const";
import { createProject, setStatus } from "@/lib/actions/projects";
import { db } from "@/lib/db";

export const instant = false;

const VIDEO = { none: "no video", processing: "processing", ready: "ready", error: "video error" };

export default async function AdminProjects() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { projects: { orderBy: { sortOrder: "asc" } } } });
  return (
    <>
      <div className="flex items-center justify-between mb-6 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold">Projects</h1>
        <CategoriesDialog cats={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.projects.length }))} />
      </div>
      <form action={createProject} className="flex gap-2 flex-wrap items-end bg-panel border border-line p-4 mb-6 max-w-2xl">
        <label className={`${kick} grid gap-1 flex-1 min-w-48`}>New project title<input name="title" required className={field} /></label>
        <div className="min-w-48"><Select name="categoryId" label="Category" v={{ categoryId: cats[0]?.id ?? "" }} options={cats.map((c): [string, string] => [c.id, c.name])} /></div>
        <button type="submit" className="btn pri">Create</button>
      </form>
      {cats.map((c) => (
        <section key={c.id} className="mb-6 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className={kick}>{c.name} · {c.projects.length}</h2>
            <OrderDialog categoryId={c.id} categoryName={c.name} slug={c.slug} items={c.projects.map((p) => ({ id: p.id, title: p.title, live: p.status === "published", color: CATEGORY_COLOR[c.slug] }))} />
          </div>
          {c.projects.length === 0 && <p className="font-mono text-xs text-dim">None yet.</p>}
          <ul className="grid gap-px bg-line border border-line">
            {c.projects.map((p) => { const live = p.status === "published"; return (
              <li key={p.id} className="flex items-center gap-2 bg-panel px-2 py-1">
                <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:bg-track px-2 py-2 rounded-xs">
                  <span className="font-sans text-sm flex-1 truncate">{p.title}{p.subtitle && <span className="text-dim"> · {p.subtitle}</span>}</span>
                  <span className={`font-mono text-[11px] uppercase ${p.videoStatus === "error" ? "text-cut-text" : "text-dim"}`}>{VIDEO[p.videoStatus]}</span>
                </Link>
                <form action={setStatus.bind(null, p.id, live ? "draft" : "published")}>
                  <button type="submit" aria-pressed={live} title={live ? "Unpublish" : "Publish"} className={`font-mono text-[11px] uppercase h-9 px-2 rounded-xs border ${live ? "border-paper text-paper" : "border-line text-dim hover:text-paper"}`}>{live ? "Live" : "Draft"}</button>
                </form>
              </li>
            ); })}
          </ul>
        </section>
      ))}
    </>
  );
}
