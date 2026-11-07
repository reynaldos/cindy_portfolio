import Link from "next/link";
import { kick } from "@/components/admin/fields";
import { setInboxStatus } from "@/lib/actions/inbox";
import { db } from "@/lib/db";

export const instant = false;

const TABS = [["new", "New"], ["read", "Read"], ["archived", "Archived"]] as const;
type Tab = (typeof TABS)[number][0];
const MOVES = [["read", "Mark read"], ["archived", "Archive"], ["new", "Move to New"]] as const;
const when = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AdminInbox({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some(([t]) => t === raw) ? (raw as Tab) : "new";
  const [rows, counts] = await Promise.all([
    db.contactSubmission.findMany({ where: { status: tab }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.contactSubmission.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (t: Tab) => counts.find((c) => c.status === t)?._count ?? 0;
  return (
    <>
      <h1 className="font-display text-4xl font-semibold mb-6">Inbox</h1>
      <nav className="flex gap-1 mb-4" aria-label="Inbox folders">
        {TABS.map(([t, name]) => <Link key={t} href={`/admin/inbox?tab=${t}`} aria-current={t === tab ? "page" : undefined} className={`font-mono text-[11px] uppercase h-9 px-3 inline-flex items-center rounded-xs border ${t === tab ? "border-paper text-paper" : "border-line text-dim hover:text-paper"}`}>{name} · {count(t)}</Link>)}
      </nav>
      {rows.length === 0 && <p className="font-mono text-xs text-dim">Nothing here.</p>}
      <ul className="grid gap-2 max-w-2xl">
        {rows.map((m) => (
          <li key={m.id} className="bg-panel border border-line p-4 grid gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-sans text-sm font-semibold">{m.name}</span>
              <a href={`mailto:${m.email}`} className="font-mono text-xs underline">{m.email}</a>
              {m.projectType && <span className={kick}>{m.projectType}</span>}
              <span className="font-mono text-xs text-dim ml-auto">{when(m.createdAt)}{!m.emailSent && " · email not sent"}</span>
            </div>
            <p className="font-sans text-sm whitespace-pre-wrap leading-relaxed">{m.message}</p>
            <div className="flex gap-3 items-center">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.projectType ?? "your project"} — Cuts By Cindy`)}`} className="btn border-line bg-track hover:border-paper h-9 min-h-0 text-xs">Reply</a>
              {MOVES.filter(([to]) => to !== tab).map(([to, text]) => <form key={to} action={setInboxStatus.bind(null, m.id, to)}><button type="submit" className="font-mono text-xs text-dim hover:text-paper underline">{text}</button></form>)}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
