"use client";

import { useActionState, useState } from "react";
import { Area, Section, Status, Text, field, kick, selectContent, selectItem, selectTrigger, type Values } from "@/components/admin/fields";
import { Track, type TrackItem } from "@/components/admin/track";
import { Select as Root, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEQ, tc } from "@/components/bay/const";
import type { Marker } from "@/components/pages/spots";
import { saveRecentWork, type SaveResult } from "@/lib/actions/recent";

type Pick = TrackItem & { group: string; recentOrder: number | null };
type Props = { values: Values; markers: Marker[]; projects: Pick[] };

export function RecentForm({ values, markers: initialMarkers, projects }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveRecentWork, undefined);
  const [markers, setMarkers] = useState(initialMarkers);
  const [spots, setSpots] = useState<TrackItem[]>(projects.filter((p) => p.recentOrder !== null).sort((a, b) => a.recentOrder! - b.recentOrder!));
  const free = projects.filter((p) => !spots.some((s) => s.id === p.id));
  const groups = [...new Set(free.map((p) => p.group))];
  const edit = (i: number, patch: Partial<Marker>) => setMarkers((all) => all.map((m, k) => (k === i ? { ...m, ...patch } : m)));
  return (
    <form action={action} className="grid gap-6 max-w-2xl">
      <Section title="Story">
        <Text name="title" label="Title" v={values} required />
        <Area name="copy" label="Copy (the job in a few sentences)" v={values} rows={5} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Text name="stampValue" label="Stamp (e.g. 10 DAYS)" v={values} />
          <Text name="stampText" label="Stamp caption" v={values} />
        </div>
      </Section>
      <Section title="Feedback rounds">
        <p className="font-sans text-xs text-dim -mt-1">Yellow pins on the timeline. Position is where on the 60-second sequence the pin sits.</p>
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
                <span className="font-mono text-xs text-dim w-24 text-right">{tc(m.at * SEQ)}</span>
                <button type="button" onClick={() => setMarkers((all) => all.filter((_, k) => k !== i))} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => setMarkers((all) => [...all, { label: `R${all.length + 1}`, note: "", at: Math.min(0.95, (all.length + 1) / 6) }])} className="btn border-line bg-track hover:border-paper justify-self-start">Add pin</button>
      </Section>
      <Section title="Spots">
        <p className="font-sans text-xs text-dim -mt-1">Up to five. Drag to order; left is first. Only published spots show on the site.</p>
        <input type="hidden" name="spots" value={JSON.stringify(spots.map((s) => s.id))} />
        <Track name="Recent Work" items={spots} onChange={setSpots} onRemove={(id) => setSpots((all) => all.filter((s) => s.id !== id))} />
        <div className="grid gap-1 max-w-sm">
          <span className={kick}>Add a spot</span>
          <Root value="" onValueChange={(id) => { const p = free.find((x) => x.id === id); if (p) setSpots((all) => [...all, p]); }} disabled={spots.length >= 5 || free.length === 0}>
            <SelectTrigger className={selectTrigger} aria-label="Add a spot"><SelectValue placeholder={spots.length >= 5 ? "Five spots set" : "Pick a project…"} /></SelectTrigger>
            <SelectContent position="popper" className={selectContent}>
              {groups.map((g) => (
                <SelectGroup key={g}>
                  <SelectLabel className="text-dim">{g}</SelectLabel>
                  {free.filter((p) => p.group === g).map((p) => <SelectItem key={p.id} value={p.id} className={selectItem}>{p.title}{!p.live && <span className="text-dim"> · draft</span>}</SelectItem>)}
                </SelectGroup>
              ))}
            </SelectContent>
          </Root>
        </div>
      </Section>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn pri disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
        <Status state={state} />
      </div>
    </form>
  );
}
