import { Fragment } from "react";
import Link from "next/link";
import { tc } from "@/components/bay/const";
import { WatchButton } from "@/components/pages/ui";
import type { Project } from "@/lib/generated/prisma/client";

type Props = { p: Project; one: string; color: string; i: number; n: number; nextTitle?: string; detailHref?: string };

// credits for the selected clip; the same block serves category, Recent Work, and detail pages
export function ClipInspector({ p, one, color, i, n, nextTitle, detailHref }: Props) {
  const credits = Array.isArray(p.credits) ? (p.credits as { role: string; name: string }[]) : [];
  return (
    <>
      <div className="kick"><span className="dot" style={{ "--c": color } as React.CSSProperties} />{one} · {i + 1} / {n}</div>
      <h2 className="h2">{p.title}{p.subtitle ? ` · ${p.subtitle}` : ""}</h2>
      <dl className="meta">
        {p.client && <><dt>Client</dt><dd>{p.client}</dd></>}
        {p.director && <><dt>Director</dt><dd>{p.director}</dd></>}
        {p.productionCo && <><dt>Production Co.</dt><dd>{p.productionCo}</dd></>}
        {p.agency && <><dt>Agency</dt><dd>{p.agency}</dd></>}
        {p.year && <><dt>Year</dt><dd>{p.year}</dd></>}
        {p.role && <><dt>Role</dt><dd>{p.role}</dd></>}
        {p.durationSec && <><dt>Runtime</dt><dd>{tc(p.durationSec, p.fps ?? 24)}</dd></>}
        {p.deliverables && <><dt>Delivery</dt><dd>{p.deliverables}</dd></>}
        {p.width && <><dt>Source</dt><dd className="small">{p.width} × {p.height}{p.fps ? ` · ${Math.round(p.fps * 100) / 100} fps` : ""}</dd></>}
      </dl>
      <p>{p.description}</p>
      {credits.length > 0 && (
        <>
          <div className="kick" style={{ marginTop: 16 }}>Full credits</div>
          <dl className="meta" style={{ marginTop: 8 }}>{credits.map((c, k) => <Fragment key={k}><dt>{c.role}</dt><dd>{c.name}</dd></Fragment>)}</dl>
        </>
      )}
      <div className="actions">
        {p.streamUid ? <WatchButton /> : <span className="small dimt">Video coming soon</span>}
        {detailHref && <Link href={detailHref} className="btn sec">Details</Link>}
      </div>
      <p className="hint keyhint">Scroll, or ← / → to move · L to play · M to unmute{nextTitle && <><br />Next: {nextTitle}</>}</p>
    </>
  );
}
