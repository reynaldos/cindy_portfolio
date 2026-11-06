"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { bay } from "@/components/bay/bus";
import { PAGES, SEQ, tc } from "@/components/bay/const";

export type Clip = { label: string; href?: string; color?: string; index?: number; current?: boolean };
export type Track = { name: string; clips: Clip[] };
export type Marker = { label: string; note: string; at: number };

type Props = {
  seq: string;
  cap: string;
  tracks: Track[];
  markers: Marker[];
  page: string | null;
  a1: string;
  p: number;
  onSeek: (p: number) => void;
};

const GAP = 0.6;
// clips share the lane width with a 0.6% gap, like the mockup
const spread = (n: number, i: number) => {
  const w = (100 - GAP * (n + 1)) / n;
  return { left: `${GAP + i * (w + GAP)}%`, width: `${w}%` };
};

const ticks = Array.from({ length: SEQ + 1 }, (_, s) => s);

export function Timeline({ seq, cap, tracks, markers, page, a1, p, onSeek }: Props) {
  const ruler = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);

  const seekAt = (clientX: number) => {
    const b = ruler.current!.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (clientX - b.left) / b.width)));
  };

  // close every open note on an outside click or Esc
  useEffect(() => {
    const close = () => ruler.current?.querySelectorAll<HTMLElement>(".marker[aria-expanded=true]").forEach((m) => m.setAttribute("aria-expanded", "false"));
    const onClick = (e: MouseEvent) => { if (!(e.target as Element).closest(".marker")) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  // a note near an edge moves sideways to stay 8px inside the app frame
  const fitNote = (m: HTMLElement) => {
    const n = m.querySelector<HTMLElement>(".note"), app = m.closest<HTMLElement>(".app");
    if (!n || !app) return;
    n.style.setProperty("--nx", "0px");
    const r = n.getBoundingClientRect(), a = app.getBoundingClientRect();
    if (!r.width) return;
    const dx = r.left < a.left + 8 ? a.left + 8 - r.left : r.right > a.right - 8 ? a.right - 8 - r.right : 0;
    n.style.setProperty("--nx", `${dx}px`);
  };

  const n = tracks.length;
  return (
    <section className="tl" aria-label="Timeline">
      <div className="tlhead">
        <span className="lab">Sequence</span>
        <span className="seq">{seq}</span>
        <span className="rng">00:00:00:00 – {tc(SEQ)} · 24 fps</span>
        <span className="cap">{cap}</span>
      </div>
      <div className="tlg">
        <div className="th tcbig">{tc(p * SEQ)}</div>
        <div
          ref={ruler}
          className="lane ruler"
          aria-label="Timeline ruler. Click or drag to seek."
          onPointerDown={(e) => { if ((e.target as Element).closest(".marker")) return; scrubbing.current = true; e.currentTarget.setPointerCapture(e.pointerId); seekAt(e.clientX); e.preventDefault(); }}
          onPointerMove={(e) => { if (scrubbing.current) seekAt(e.clientX); }}
          onPointerUp={() => { scrubbing.current = false; }}
          onPointerCancel={() => { scrubbing.current = false; }}
        >
          {ticks.map((s) => (
            <span key={s} className={`tick ${s % 5 === 0 ? "maj" : ""}`} style={{ left: `${(s / SEQ) * 100}%` }}>
              {s % 5 === 0 && s < SEQ && <span className={`rl ${s % 10 ? "odd" : ""} ${s % 20 ? "q" : ""}`}>{tc(s)}</span>}
            </span>
          ))}
          {markers.map((m) => (
            <button
              key={m.label}
              type="button"
              className={`marker ${m.at > 0.5 ? "rt" : ""}`}
              style={{ left: `${m.at * 100}%` }}
              aria-expanded="false"
              aria-label={`Feedback round: ${m.label}. ${m.note}`}
              onClick={(e) => { const b = e.currentTarget, open = b.getAttribute("aria-expanded") === "true"; b.setAttribute("aria-expanded", String(!open)); fitNote(b); }}
              onPointerEnter={(e) => fitNote(e.currentTarget)}
              onFocus={(e) => fitNote(e.currentTarget)}
            >
              <span className="note"><b>{m.label}</b><br />{m.note}</span>
            </button>
          ))}
        </div>

        {tracks.map((t, i) => {
          const x = i < n - 1 ? " ctx-x" : "";
          return [
            <div key={`h${t.name}`} className={`th${x}`} title={t.name}><span className="tn">V{n + 1 - i}</span>{t.name}</div>,
            <div key={`l${t.name}`} className={`lane${x}`}>
              {markers.map((m) => <i key={m.label} className="mguide" style={{ left: `${m.at * 100}%` }} />)}
              {t.clips.map((c, j) => {
                const style = { ...spread(t.clips.length, j), "--c": c.color } as React.CSSProperties;
                const cls = `clip film ${c.current ? "sel" : ""}`;
                if (c.href) return <Link key={j} href={c.href} className={cls} style={style} title={c.label}><span>{c.label}</span></Link>;
                if (c.index !== undefined) return <button key={j} type="button" className={cls} style={style} title={c.label} onClick={() => bay("select", c.index)}><span>{c.label}</span></button>;
                return <span key={j} className="clip static navc" style={style}>{c.label}</span>;
              })}
            </div>,
          ];
        })}

        <div className="th" title="Pages"><span className="tn">V1</span>Pages</div>
        <div className="lane">
          {markers.map((m) => <i key={m.label} className="mguide" style={{ left: `${m.at * 100}%` }} />)}
          {PAGES.map(([href, name], i) => (
            <Link key={href} href={href} className="clip navc" style={spread(PAGES.length, i)} aria-current={page === href ? "page" : undefined}>{name}</Link>
          ))}
        </div>

        <div className="th a1h"><span className="tn a">A1</span>Audio</div>
        <div className="lane a1">
          <svg viewBox="0 0 360 32" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="16" x2="360" y2="16" stroke="var(--color-audio)" strokeWidth="1" strokeDasharray="2 3" opacity=".5" /></svg>
          <span className="tag">{a1}</span>
        </div>

        <div className="playhead" style={{ "--p": p } as React.CSSProperties}><i /></div>
      </div>
    </section>
  );
}
