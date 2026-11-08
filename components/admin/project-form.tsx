"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { X } from "lucide-react";
import { enqueue, useJob } from "@/components/admin/queue";
import { Area, FileButton, Section, Select, Status, Text, Upload, field, label, putFile, type Values } from "@/components/admin/fields";
import { deleteProject, removeVideo, saveProject, type SaveResult } from "@/lib/actions/projects";
import { tc } from "@/components/bay/const";
import { r2Url, thumbUrl } from "@/lib/media";

type Still = { key: string; alt: string };
type Video = { uid: string | null; status: "none" | "processing" | "ready" | "error"; peaks: boolean; durationSec: number | null };
type Props = { id: string; values: Values; cats: { id: string; name: string; slug: string }[]; skills: string[]; bank: string[]; stills: Still[]; video: Video; publicUrl: string | null; uploads: boolean };

const IMG = "image/jpeg,image/png,image/webp";

export function ProjectForm({ id, values, cats, skills, bank, stills: initialStills, video, publicUrl, uploads }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveProject.bind(null, id), undefined);
  const [catId, setCatId] = useState(values.categoryId);
  const catSlug = cats.find((c) => c.id === catId)?.slug ?? "";
  return (
    <div className="grid gap-6 max-w-2xl">
      <VideoBox id={id} title={values.title} video={video} />
      <form action={action} className="grid gap-6">
        <Section title="Clip">
          <Text name="title" label="Title" v={values} required />
          <div className="grid sm:grid-cols-2 gap-3">
            <Text name="subtitle" label="Subtitle (optional)" v={values} />
            <Text name="client" label="Client (optional)" v={values} />
          </div>
          <Select name="categoryId" label="Category" v={values} options={cats.map((c): [string, string] => [c.id, c.name])} onChange={setCatId} />
          <label className={label}>
            URL slug (must be unique)
            <span className="flex items-center bg-track border border-line rounded-xs has-focus-visible:border-cut">
              <span className="pl-3 font-mono text-sm text-dim whitespace-nowrap">/projects/{catSlug}/</span>
              <input name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers, and dashes" className="h-12 bg-transparent px-1 text-paper text-sm font-mono focus:outline-none w-full min-w-0" />
            </span>
          </label>
          <Area name="description" label="Description (shown in the clip list)" v={values} rows={4} />
        </Section>
        <Section title="Credits">
          <div className="grid sm:grid-cols-2 gap-3">
            <Text name="year" label="Year" v={values} type="number" />
            <Text name="role" label="Cindy's role (e.g. Editor)" v={values} />
            <Text name="director" label="Director" v={values} />
            <Text name="productionCo" label="Production company" v={values} />
            <Text name="agency" label="Agency" v={values} />
            <Text name="deliverables" label="Delivery (e.g. 30s, 15s, 6s)" v={values} />
          </div>
          <Area name="credits" label="Full credits, one per line as Role: Name" v={values} rows={5} />
        </Section>
        <Section title="Skills">
          <Skills initial={skills} bank={bank} />
        </Section>
        <Section title="Poster">
          <PosterPicker values={values} video={video} uploads={uploads} />
        </Section>
        <Section title="Stills">
          <Stills initial={initialStills} enabled={uploads} />
        </Section>
        <Section title="Captions">
          <Upload name="captionsKey" kind="captions" label="Captions (optional)" hint="One .vtt file." accept=".vtt,text/vtt" initial={values.captionsKey} enabled={uploads} preview={(key) => <span className="font-mono text-xs">{key}</span>} />
        </Section>
        <Section title="Publish">
          <Select name="status" label="Status" v={values} options={[["draft", "Draft (hidden)"], ["published", "Published"]]} />
          {publicUrl && <Link href={publicUrl} className="font-mono text-xs underline">View on the site ↗</Link>}
        </Section>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn pri disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
          <Status state={state} />
        </div>
      </form>
      <form action={deleteProject.bind(null, id)} onSubmit={(e) => { if (!confirm("Delete this project, its video, and its files? This cannot be undone.")) e.preventDefault(); }} className="border-t border-line pt-4">
        <button type="submit" className="font-mono text-xs text-cut-text hover:underline">Delete project</button>
      </form>
    </div>
  );
}

// Skills: chips on the project; type one and press Enter, or click one from the bank of skills used before. The form carries them one per line.
function Skills({ initial, bank }: { initial: string[]; bank: string[] }) {
  const [skills, setSkills] = useState(initial);
  const [draft, setDraft] = useState("");
  const add = (s: string) => { const v = s.trim(); if (v && !skills.includes(v)) setSkills([...skills, v]); setDraft(""); };
  const rest = bank.filter((b) => !skills.includes(b));
  return (
    <div className="grid gap-3">
      <input type="hidden" name="skills" value={skills.join("\n")} />
      <ul className="flex flex-wrap gap-2 empty:hidden">
        {skills.map((s) => <li key={s} className="flex items-center gap-1 bg-track border border-line rounded-xs pl-2 font-mono text-xs text-paper">{s}<button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="h-8 w-8 grid place-items-center text-dim hover:text-paper"><X size={12} /></button></li>)}
      </ul>
      <label className={label}>
        Add a skill (Enter to add)
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); } }} onBlur={() => add(draft)} className={field} placeholder="Adobe Premiere Pro" />
      </label>
      {rest.length > 0 && (
        <div className="grid gap-1">
          <span className={label}>Used before</span>
          <ul className="flex flex-wrap gap-2">{rest.map((s) => <li key={s}><button type="button" onClick={() => add(s)} className="h-8 px-2 border border-dashed border-line rounded-xs font-mono text-xs text-dim hover:text-paper hover:border-paper">+ {s}</button></li>)}</ul>
        </div>
      )}
    </div>
  );
}

// Stills: upload many, caption each, reorder with the arrows. The form carries them as one JSON field.
function Stills({ initial, enabled }: { initial: Still[]; enabled: boolean }) {
  const [stills, setStills] = useState(initial);
  const [msg, setMsg] = useState("");
  async function onPick(files: File[]) {
    setMsg(`Uploading ${files.length}…`);
    for (const file of files) {
      const res = await putFile("still", file);
      if ("error" in res) return setMsg(res.error);
      setStills((s) => [...s, { key: res.key, alt: "" }]);
    }
    setMsg("Uploaded. Save to keep them.");
  }
  const move = (i: number, d: number) => setStills((s) => { const n = [...s]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); return n; });
  return (
    <>
      <p className="font-sans text-xs text-dim -mt-1">Landscape 16:9 frames from the cut. JPG, PNG, or WebP under 10 MB each. Shown on the detail page in this order.</p>
      <input type="hidden" name="stills" value={JSON.stringify(stills)} />
      <ul className="grid gap-2">
        {stills.map((s, i) => (
          <li key={s.key} className="flex items-center gap-3">
            <Image src={r2Url(s.key)} alt="" width={96} height={54} unoptimized className="w-24 aspect-video object-cover border border-line shrink-0" />
            <input value={s.alt} onChange={(e) => setStills((all) => all.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} placeholder="Describe the frame (alt text)" aria-label="Alt text" className={`${field} h-10`} />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="font-mono text-xs text-dim hover:text-paper disabled:opacity-30">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === stills.length - 1} aria-label="Move down" className="font-mono text-xs text-dim hover:text-paper disabled:opacity-30">↓</button>
            <button type="button" onClick={() => setStills((all) => all.filter((_, k) => k !== i))} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <FileButton accept={IMG} multiple onPick={onPick} disabled={!enabled}>Add stills</FileButton>
        <p className="font-mono text-xs text-dim" aria-live="polite">{enabled ? msg : "Set the R2 keys in .env to upload."}</p>
      </div>
    </>
  );
}

// Poster: a frame from the video (the default) or an uploaded image. Saving on the video tab drops a saved image.
function PosterPicker({ values, video, uploads }: { values: Values; video: Video; uploads: boolean }) {
  const [mode, setMode] = useState<"video" | "upload">("video");
  return (
    <>
      <div className="flex gap-px bg-line border border-line w-fit" role="group" aria-label="Poster source">
        {([["video", "Frame from the video"], ["upload", "Upload an image"]] as const).map(([m, text]) => <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`font-mono text-[11px] uppercase h-9 px-3 ${mode === m ? "bg-track text-paper" : "bg-panel text-dim hover:text-paper"}`}>{text}</button>)}
      </div>
      {mode === "video" ? (
        <>
          <input type="hidden" name="posterKey" value="" />
          {values.posterKey && <p className="font-mono text-xs text-dim">An uploaded poster is saved. Saving on this tab removes it and uses the frame instead.</p>}
          <PosterScrub initial={Math.round((Number(values.posterTimeSec) || 1) / STEP) * STEP} video={video} />
        </>
      ) : (
        <>
          <input type="hidden" name="posterTimeSec" value={values.posterTimeSec || "1"} />
          <Upload name="posterKey" kind="poster" label="Poster image" hint="Landscape 16:9, 1920×1080. JPG, PNG, or WebP under 10 MB." accept={IMG} initial={values.posterKey} enabled={uploads} preview={(key) => <Image src={r2Url(key)} alt="" width={384} height={216} unoptimized className="w-full max-w-96 aspect-video object-cover border border-line" />} />
        </>
      )}
    </>
  );
}

// Scrub with Stream's thumbnails: small JPEGs from the edge, no video pipeline. The ones around the slider are
// fetched ahead (from the first hover or focus on the slider), so a drag shows frames at once. Only the time is saved; Stream renders the full poster from it.
const STEP = 0.5, AHEAD = 12, H = 270;
function PosterScrub({ initial, video }: { initial: number; video: Video }) {
  const [t, setT] = useState(initial);
  const seen = useRef(new Set<string>());
  const ready = !!video.uid && !video.uid.startsWith("http") && video.status === "ready" && !!video.durationSec;
  const max = ready ? Math.floor(video.durationSec! / STEP) * STEP : 0;
  const url = (sec: number) => thumbUrl(video.uid!, Math.round(sec * 10) / 10, H)!;
  const prefetch = (sec: number) => {
    for (let k = -AHEAD; k <= AHEAD; k++) {
      const u = Math.min(max, Math.max(0, sec + k * STEP));
      const src = url(u);
      if (seen.current.has(src)) continue;
      seen.current.add(src);
      new window.Image().src = src;
    }
  };
  const onSlide = (val: number) => { setT(val); prefetch(val); };
  return (
    <div className="grid gap-2 max-w-2xl">
      <input type="hidden" name="posterTimeSec" value={t} />
      {ready ? (
        <>
          <Image src={url(t)} alt="" width={480} height={H} unoptimized priority className="w-full aspect-video bg-ink border border-line object-contain" />
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={max} step={STEP} value={t} onChange={(e) => onSlide(Number(e.target.value))} onPointerEnter={() => prefetch(t)} onFocus={() => prefetch(t)} aria-label="Poster frame time" className="flex-1 accent-cut" />
            <span className="font-mono text-xs text-dim w-20 text-right">{tc(t)}</span>
            {t !== initial && <button type="button" onClick={() => onSlide(initial)} className="font-mono text-xs text-dim hover:text-paper underline">Reset</button>}
          </div>
        </>
      ) : (
        <p className="font-sans text-xs text-dim">Scrub to a frame once the video is ready.</p>
      )}
    </div>
  );
}

// One flow on screen: Uploading → Encoding → Scanning audio → Ready. The shell's render queue does the work;
// this box only hands it the file and shows where the job is.
function VideoBox({ id, title, video }: { id: string; title: string; video: Video }) {
  const job = useJob(id);
  const router = useRouter();
  const stage = job && job.stage !== "done"
    ? { queued: "Queued · waiting for the pipe", uploading: `Uploading · ${Math.round(job.pct * 100)}%`, encoding: "Encoding on Cloudflare Stream…", scanning: `Scanning audio for the waveform · ${Math.round(job.pct * 100)}%`, error: `Failed · ${job.error}` }[job.stage]
    : video.status === "processing" ? "Encoding on Cloudflare Stream… (open any admin page and it keeps going)" : video.status === "ready" && !video.peaks ? "Scanning audio for the waveform…" : video.status === "ready" ? `Ready · ${Math.round(video.durationSec ?? 0)}s` : video.status === "error" ? "Stream could not encode this file" : "No video yet";
  const live = (job && job.stage !== "done" && job.stage !== "error") || video.status === "processing" || (video.status === "ready" && !video.peaks);
  const busy = job?.stage === "queued" || job?.stage === "uploading";
  return (
    <Section title="Video">
      <p className="font-sans text-xs text-dim -mt-1">MP4 or MOV, H.264, any size. Landscape 16:9 plays best. You can keep editing other projects while it uploads; just keep the tab open.</p>
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className={`h-2 w-2 rounded-full ${video.status === "error" || job?.stage === "error" ? "bg-cut" : live ? "bg-paper animate-pulse" : video.status === "ready" ? "bg-paper" : "bg-line"}`} aria-hidden="true" />
        <span aria-live="polite">{stage}</span>
      </div>
      {busy && <progress value={job.pct} max={1} className="w-full h-2 accent-cut" aria-label="Upload progress" />}
      <div className="flex items-center gap-3 flex-wrap">
        <FileButton accept="video/mp4,video/quicktime" onPick={([file]) => file && enqueue(id, title, file)} disabled={busy}>{video.uid ? "Replace video" : "Choose video"}</FileButton>
        {video.uid && !busy && <button type="button" onClick={async () => { if (confirm("Remove the video from this project?")) { await removeVideo(id); router.refresh(); } }} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>}
      </div>
    </Section>
  );
}
