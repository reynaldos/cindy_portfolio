import Link from "next/link";
import { db } from "@/lib/db";

export const instant = false;

// Overview: what needs attention, and where everything is
export default async function AdminHome() {
  const [inbox, drafts, published, ready] = await Promise.all([
    db.contactSubmission.count({ where: { status: "new" } }),
    db.project.count({ where: { status: "draft" } }),
    db.project.count({ where: { status: "published" } }),
    db.project.count({ where: { videoStatus: "ready" } }),
  ]);
  const cards = [
    ["/admin/inbox", "New messages", inbox],
    ["/admin/projects", "Published projects", published],
    ["/admin/projects", "Drafts", drafts],
    ["/admin/projects", "Videos ready", ready],
  ] as const;
  return (
    <>
      <h1 className="font-display text-4xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {cards.map(([href, label, n], i) => (
          <Link key={i} href={href} className="bg-panel border border-line p-4 hover:border-paper">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">{label}</div>
            <div className="font-display text-4xl font-semibold mt-1">{n}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
