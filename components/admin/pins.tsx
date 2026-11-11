"use client";

import { field } from "@/components/admin/fields";
import { tc } from "@/components/bay/const";
import type { Marker } from "@/lib/markers";

type Props = { markers: Marker[]; onChange: (m: Marker[]) => void; total: number; hint: string };

// Feedback pins: label, note, and a position slider. total is the length the slider maps to, in seconds.
export function Pins({ markers, onChange, total, hint }: Props) {
  const edit = (i: number, patch: Partial<Marker>) => onChange(markers.map((m, k) => (k === i ? { ...m, ...patch } : m)));
  return (
    <>
      <p className="font-sans text-xs text-dim -mt-1">{hint}</p>
      <input type="hidden" name="markers" value={JSON.stringify(markers)} />
      <ol className="grid gap-3">
        {markers.map((m, i) => (
          <li key={i} className="grid gap-2 border border-line p-3">
            <div className="grid sm:grid-cols-[1fr_2fr] gap-2">
              <input value={m.label} onChange={(e) => edit(i, { label: e.target.value })} placeholder="Label (e.g. R1)" aria-label="Pin label" className={`${field} h-10`} />
              <input value={m.note} onChange={(e) => edit(i, { note: e.target.value })} placeholder="Note (what the client asked for)" aria-label="Pin note" className={`${field} h-10`} />
            </div>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={1} step={0.01} value={m.at} onChange={(e) => edit(i, { at: Number(e.target.value) })} aria-label="Pin position" className="flex-1 accent-cut" />
              <span className="font-mono text-xs text-dim w-24 text-right">{total ? tc(m.at * total) : `${Math.round(m.at * 100)}%`}</span>
              <button type="button" onClick={() => onChange(markers.filter((_, k) => k !== i))} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onChange([...markers, { label: `R${markers.length + 1}`, note: "", at: Math.min(0.95, (markers.length + 1) / 6) }])} className="btn border-line bg-track hover:border-paper justify-self-start">Add pin</button>
    </>
  );
}
