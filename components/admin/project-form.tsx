"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { Area, FileButton, Section, Select, Status, Text, Upload, field, kick, label, putFile, type Values } from "@/components/admin/fields";
import { deleteProject, removeVideo, savePeaks, saveProject, videoUpload, type SaveResult } from "@/lib/actions/projects";
import { r2Url, thumbUrl } from "@/lib/media";

type Still = { key: string; alt: string };
type Video = { uid: string | null; status: "none" | "processing" | "ready" | "error"; peaks: boolean; durationSec: number | null };
type Props = { id: string; values: Values; cats: { id: string; name: string; slug: string }[]; stills: Still[]; video: Video; publicUrl: string | null; uploads: boolean };

const IMG = "image/jpeg,image/png,image/webp";

export function ProjectForm({ id, values, cats, stills: initialStills, video, publicUrl, uploads }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveProject.bind(null, id), undefined);
  const [catId, setCatId] = useState(values.categoryId);
  const catSlug = cats.find((c) => c.id === catId)?.slug ?? "";
  return (
    <div className="grid gap-6 max-w-2xl">
      <VideoBox id={id} video={video} />
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
              <input name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers, and dashes" className="h-11 bg-transparent px-1 text-paper text-sm font-mono focus:outline-none w-full min-w-0" />
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
        <Section title="Poster">
          <label className={`${kick} grid gap-1 max-w-48`}>Poster frame (seconds into the video)<input name="posterTimeSec" type="number" min={0} step={0.1} defaultValue={values.posterTimeSec} className={field} /></label>
          {video.uid && !video.uid.startsWith("http") && video.status === "ready" && <Image src={thumbUrl(video.uid, Number(values.posterTimeSec) || 1)!} alt="" width={192} height={108} unoptimized className="w-48 aspect-video object-cover border border-line" />}
          <Upload name="posterKey" kind="poster" label="Custom poster (optional)" hint="Replaces the video frame. Landscape 16:9, 1920×1080. JPG, PNG, or WebP under 10 MB." accept={IMG} initial={values.posterKey} enabled={uploads} preview={(key) => <Image src={r2Url(key)} alt="" width={192} height={108} unoptimized className="w-48 aspect-video object-cover border border-line" />} />
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
            <input value={s.alt} onChange={(e) => setStills((all) => all.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))} placeholder="Describe the frame (alt text)" aria-label="Alt text" className={`${field} h-9`} />
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

const LABEL = { none: "No video yet", processing: "Processing on Cloudflare Stream — the site updates when it is ready", ready: "Ready", error: "Stream could not encode this file" };

// The video goes from the browser straight to Stream over tus, so a dropped connection resumes
function VideoBox({ id, video }: { id: string; video: Video }) {
  const [pct, setPct] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  async function onPick([file]: File[]) {
    if (!file) return;
    setMsg("Starting…");
    const res = await videoUpload(id, file.name, file.size);
    if ("error" in res) return setMsg(res.error);
    setPct(0);
    const peaks = peaksFrom(file);
    await new Promise<void>((resolve) => {
      new TusUpload(file, {
        uploadUrl: res.uploadUrl,
        chunkSize: 50 * 1024 * 1024,
        onProgress: (sent, total) => setPct(Math.round((sent / total) * 100)),
        onError: (e) => { setMsg(`Upload failed: ${e.message}`); resolve(); },
        onSuccess: () => { setMsg("Uploaded. Stream is encoding it now."); resolve(); },
      }).start();
    });
    const p = await peaks;
    if (p) await savePeaks(id, p);
    setPct(null);
    location.reload();
  }
  return (
    <Section title="Video">
      <p className="font-sans text-xs text-dim -mt-1">MP4 or MOV, H.264, any size. Landscape 16:9 plays best. {LABEL[video.status]}{video.status === "ready" && video.durationSec ? ` · ${Math.round(video.durationSec)}s` : ""}{video.uid && !video.peaks && video.status !== "none" ? " · no waveform (the file was too large to scan)" : ""}</p>
      {pct !== null && <progress value={pct} max={100} className="w-full h-2 accent-cut" aria-label="Upload progress" />}
      <div className="flex items-center gap-3 flex-wrap">
        <FileButton accept="video/mp4,video/quicktime" onPick={onPick} disabled={pct !== null}>{video.uid ? "Replace video" : "Choose video"}</FileButton>
        {video.uid && pct === null && <button type="button" onClick={async () => { if (confirm("Remove the video from this project?")) { await removeVideo(id); location.reload(); } }} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>}
        <p className="font-mono text-xs text-dim" aria-live="polite">{pct !== null ? `${pct}%` : msg}</p>
      </div>
    </Section>
  );
}

// 240 loudness bins from the file's audio, for the A1 waveform. Skipped above 300 MB: decoding needs the whole file in memory.
async function peaksFrom(file: File): Promise<number[] | null> {
  if (file.size > 300 * 1024 * 1024) return null;
  try {
    const ctx = new AudioContext();
    const buf = await ctx.decodeAudioData(await file.arrayBuffer());
    const data = buf.getChannelData(0), step = Math.floor(data.length / 240);
    const peaks = Array.from({ length: 240 }, (_, i) => { let m = 0; for (let k = i * step; k < (i + 1) * step; k += 16) m = Math.max(m, Math.abs(data[k])); return m; });
    const max = Math.max(...peaks) || 1;
    await ctx.close();
    return peaks.map((v) => Math.round((v / max) * 100) / 100);
  } catch {
    return null;
  }
}
