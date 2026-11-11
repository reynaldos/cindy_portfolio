"use client";

import { useActionState, useState } from "react";
import { Area, Section, Status, Text, kick, selectContent, selectItem, selectTrigger, type Values } from "@/components/admin/fields";
import { Pins } from "@/components/admin/pins";
import { Track, type TrackItem } from "@/components/admin/track";
import { Select as Root, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEQ } from "@/components/bay/const";
import type { Marker } from "@/lib/markers";
import { saveRecentWork, type SaveResult } from "@/lib/actions/recent";

type Pick = TrackItem & { group: string; recentOrder: number | null };
type Props = { values: Values; markers: Marker[]; projects: Pick[] };

export function RecentForm({ values, markers: initialMarkers, projects }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveRecentWork, undefined);
  const [markers, setMarkers] = useState(initialMarkers);
  const [spots, setSpots] = useState<TrackItem[]>(projects.filter((p) => p.recentOrder !== null).sort((a, b) => a.recentOrder! - b.recentOrder!));
  const free = projects.filter((p) => !spots.some((s) => s.id === p.id));
  const groups = [...new Set(free.map((p) => p.group))];
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
        <Pins markers={markers} onChange={setMarkers} total={SEQ} hint="Yellow pins on the timeline. Position is where on the 60-second sequence the pin sits." />
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
