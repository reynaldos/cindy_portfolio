"use client";

import { bay } from "@/components/bay/bus";
import { fitNote } from "@/components/bay/note";
import { tc } from "@/components/bay/const";
import { useMonitor } from "@/components/monitor/state";
import { ClipInspector } from "@/components/pages/clip-inspector";
import { clipFromProject } from "@/lib/media";
import type { Category, Project } from "@/lib/generated/prisma/client";

export type Marker = { label: string; note: string; at: number };
type Spot = Project & { category: Category };

// Recent Work: the job as a timeline. Feedback pins over the spot tiles; a tile selects its spot.
export function Spots({ spots, markers, stampValue, stampText }: { spots: Spot[]; markers: Marker[]; stampValue: string | null; stampText: string | null }) {
  const { index } = useMonitor();
  return (
    <div className="gut">
      <div className="proc">
        <div className="kick">The job, as a timeline</div>
        <div className="proc-lane">
          {markers.map((m) => (
            <button key={m.label} type="button" className="pin" style={{ left: `${m.at * 100}%` }} aria-expanded="false" aria-label={`Feedback round: ${m.label}. ${m.note}`}
              onClick={(e) => { const b = e.currentTarget, open = b.getAttribute("aria-expanded") === "true"; b.parentElement?.querySelectorAll(".pin").forEach((x) => x.setAttribute("aria-expanded", "false")); b.setAttribute("aria-expanded", String(!open)); fitNote(b); }}
              onPointerEnter={(e) => fitNote(e.currentTarget)} onFocus={(e) => fitNote(e.currentTarget)}>
              <i /><span>{m.label}</span><span className="note"><b>{m.label}</b><br />{m.note}</span>
            </button>
          ))}
          <div className="proc-track">
            {spots.length === 0 && <span className="small dimt" style={{ padding: 8 }}>Spots coming soon.</span>}
            {spots.map((s, i) => { const c = clipFromProject(s, { poster: 240 }); return (
              <button key={s.id} type="button" data-tgt className={i === index ? "sel" : ""} style={{ ...(c.poster ? { backgroundImage: `url(${c.poster})` } : {}), "--c": s.category.color } as React.CSSProperties} onClick={() => bay("select", i)}>
                <i>Spot {i + 1}/{spots.length}{s.subtitle ? ` · ${s.subtitle}` : ""}{s.durationSec && <><br /><span className="dimt">{tc(s.durationSec, s.fps ?? 24)}</span></>}</i>
              </button>
            ); })}
          </div>
        </div>
        {markers.length > 0 && <p className="legend"><i />Yellow pins = feedback rounds. Tap or hover one to read the note.</p>}
        {stampValue && <div className="stamp"><b>{stampValue}</b>{stampText && <span className="small">{stampText}</span>}</div>}
      </div>
    </div>
  );
}

export function SpotInspector({ spots }: { spots: Spot[] }) {
  const { index } = useMonitor();
  const p = spots[index];
  return (
    <aside className="insp" aria-label="Inspector">
      <div className="ptab"><span className="on">Inspector</span><span className="r">Clip</span></div>
      <div className="insp-b">
        {p ? <ClipInspector p={p} one={p.category.one} color={p.category.color} i={index} n={spots.length} nextTitle={spots[index + 1]?.title} /> : <p className="dimt">The five spots appear here when they are published.</p>}
      </div>
    </aside>
  );
}
