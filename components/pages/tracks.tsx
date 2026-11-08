"use client";

import Link from "next/link";
import { bay } from "@/components/bay/bus";
import { useMonitor } from "@/components/monitor/state";
import { Shuffle } from "@/components/pages/shuffle";
import { clipFromProject } from "@/lib/media";
import type { Category, Project } from "@/lib/generated/prisma/client";

type Props = { categories: (Category & { projects: Project[] })[] };

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const total = (c: Props["categories"][number]) => fmtDur(c.projects.reduce((n, p) => n + (p.durationSec ?? 0), 0));

// Projects page: four track rows. Hover or focus previews the track (poster only); a click opens it.
export function Tracks({ categories }: Props) {
  return (
    <div className="rows gut">
      {categories.map((cat, i) => (
        <Link key={cat.slug} href={`/projects/${cat.slug}`} className="track-row" data-tgt style={{ "--c": cat.color } as React.CSSProperties} onPointerEnter={() => bay("select", i)} onFocus={() => bay("select", i)}>
          <span className="nm"><b>{cat.name}</b><span className="small dimt">V{categories.length + 1 - i} · {String(cat.projects.length).padStart(2, "0")} clips · {total(cat)}</span></span>
          <span className="ln">{cat.projects.map((p) => { const k = clipFromProject(p, 240); return <span key={p.id} style={k.poster ? { backgroundImage: `url(${k.poster})` } : undefined}><i>{p.subtitle ?? p.title}</i></span>; })}</span>
        </Link>
      ))}
    </div>
  );
}

export function TrackInspector({ categories }: Props) {
  const c = categories[useMonitor().index];
  return (
    <aside className="insp" aria-label="Inspector">
      <div className="ptab"><span className="on">Inspector</span><span className="r">Track</span></div>
      <div className="insp-b">
        {c && (
          <>
            <div className="kick"><span className="dot" style={{ "--c": c.color } as React.CSSProperties} />Track · {c.name}</div>
            <h2 className="h2"><Shuffle text={`${c.name} ( ${String(c.projects.length).padStart(2, "0")} )`} /></h2>
            {c.blurb && <p>{c.blurb}</p>}
            <dl className="meta"><dt>Clips</dt><dd>{c.projects.length ? c.projects.map((p) => p.subtitle ?? p.title).join(", ") : "Coming soon"}</dd><dt>Total</dt><dd>{total(c)}</dd></dl>
            <p className="small dimt">Color = category. {c.name} are always this color, on every page.</p>
            <div className="actions"><Link href={`/projects/${c.slug}`} className="btn pri">Open {c.name}</Link></div>
          </>
        )}
      </div>
    </aside>
  );
}
