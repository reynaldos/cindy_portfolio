"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Upload as TusUpload } from "tus-js-client";
import { dismiss, getJobs, patch, track, useJobs, type Job } from "@/components/admin/queue";
import { pendingVideos, savePeaks, videoState, videoUpload } from "@/lib/actions/projects";
import { scanPeaks } from "@/lib/peaks";

const STAGE = { queued: "Queued", uploading: "Uploading", encoding: "Encoding", scanning: "Scanning audio", done: "Done", error: "Failed" };

// The export queue in the admin shell. One upload at a time (one pipe), then Stream encodes, then the audio scan.
// Jobs keep going while Cindy moves between admin pages; only a reload or a closed tab stops an upload.
export function RenderQueue() {
  const jobs = useJobs();
  const router = useRouter();
  const uploading = useRef(false);
  const scanning = useRef(false);
  const ctx = useRef<AudioContext | null>(null);

  // uploads, in the order they were queued
  useEffect(() => {
    const next = jobs.find((j) => j.stage === "queued");
    if (uploading.current || !next?.file) return;
    uploading.current = true;
    (async () => {
      const res = await videoUpload(next.projectId, next.file!.name, next.file!.size);
      if ("error" in res) { patch(next.projectId, { stage: "error", error: res.error }); return; }
      patch(next.projectId, { stage: "uploading" });
      router.refresh();
      await new Promise<void>((resolve) => {
        new TusUpload(next.file!, {
          uploadUrl: res.uploadUrl,
          chunkSize: 50 * 1024 * 1024,
          onProgress: (sent, total) => patch(next.projectId, { pct: sent / total }),
          onError: (e) => { patch(next.projectId, { stage: "error", error: e.message }); resolve(); },
          onSuccess: () => { patch(next.projectId, { stage: "encoding", pct: 0, file: null }); resolve(); },
        }).start();
      });
    })().finally(() => { uploading.current = false; router.refresh(); });
  }, [jobs, router]);

  // encodes: ask Stream every 15 seconds for every job in that stage
  useEffect(() => {
    if (!jobs.some((j) => j.stage === "encoding")) return;
    const t = setInterval(async () => {
      for (const j of getJobs().filter((x) => x.stage === "encoding")) {
        const s = await videoState(j.projectId);
        if (s === "ready") patch(j.projectId, { stage: "scanning", pct: 0 });
        else if (s === "error") patch(j.projectId, { stage: "error", error: "Stream could not encode this file" });
      }
      router.refresh();
    }, 15000);
    return () => clearInterval(t);
  }, [jobs, router]);

  // encodes started elsewhere (an import, another tab, a reload) join the queue so the poll above covers them
  useEffect(() => {
    const pull = async () => { for (const e of (await pendingVideos()).encoding) track(e.id, e.title, "encoding"); };
    pull();
    const t = setInterval(pull, 30000);
    return () => clearInterval(t);
  }, []);

  // the audio scan: any ready video with no waveform, queued or not. Needs a click first (the browser's rule for sound).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    async function run() {
      if (scanning.current || !ctx.current) return;
      scanning.current = true;
      try {
        for (const job of (await pendingVideos()).scanning) {
          track(job.id, job.title);
          patch(job.id, { stage: "scanning", pct: 0 });
          const peaks = await scanPeaks(ctx.current, job.uid, job.durationSec, (t) => patch(job.id, { pct: t }));
          await savePeaks(job.id, peaks);
          patch(job.id, { stage: "done", pct: 1 });
          router.refresh();
        }
      } catch (e) {
        for (const j of getJobs().filter((x) => x.stage === "scanning")) patch(j.projectId, { stage: "error", error: e instanceof Error ? e.message : "scan failed" });
      } finally {
        scanning.current = false;
        timer = setTimeout(run, 20000);
      }
    }
    const arm = () => { ctx.current ??= new AudioContext(); void ctx.current.resume(); run(); };
    window.addEventListener("pointerdown", arm, { once: true });
    return () => { window.removeEventListener("pointerdown", arm); clearTimeout(timer); };
  }, [router]);

  // leaving the page mid-upload would lose it
  useEffect(() => {
    if (!jobs.some((j) => j.stage === "uploading" || j.stage === "queued")) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [jobs]);

  if (jobs.length === 0) return null;
  return (
    <section className="border border-line bg-ink mt-4 font-mono w-full min-w-0" aria-label="Render queue" aria-live="polite">
      <div className="flex justify-between px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-dim border-b border-line"><span>Render queue</span><span>{jobs.filter((j) => j.stage !== "done" && j.stage !== "error").length} active</span></div>
      <ul>
        {jobs.map((j) => <Row key={j.projectId} job={j} />)}
      </ul>
    </section>
  );
}

function Row({ job }: { job: Job }) {
  const pct = Math.round(job.pct * 100);
  const live = job.stage === "uploading" || job.stage === "encoding" || job.stage === "scanning";
  return (
    <li className="px-3 py-2 border-b border-line last:border-b-0 flex flex-col gap-1 min-w-0 overflow-hidden">
      <div className="flex justify-between gap-2 text-[11px] min-w-0">
        <span className="truncate min-w-0 text-paper" title={job.title}>{job.title}</span>
        <span className={`shrink-0 ${job.stage === "error" ? "text-cut-text" : "text-dim"}`}>{live ? `${pct}%` : STAGE[job.stage]}</span>
      </div>
      {/* Stream gives no percent while it encodes, so that stage shows a full, pulsing bar */}
      <div className="h-1.5 bg-track overflow-hidden" role="progressbar" aria-valuenow={job.stage === "encoding" ? undefined : pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${STAGE[job.stage]} ${job.title}`}>
        <i className={`block h-full ${job.stage === "error" ? "bg-cut" : job.stage === "encoding" ? "bg-dim animate-pulse" : "bg-paper"} ${job.stage === "queued" ? "opacity-30" : ""}`} style={{ width: `${job.stage === "queued" || job.stage === "encoding" ? 100 : pct}%`, transition: "width .4s linear" }} />
      </div>
      <div className="flex justify-between gap-2 text-[10px] text-dim min-w-0">
        <span className="truncate min-w-0">{job.stage === "error" ? job.error : job.stage === "uploading" ? "→ Cloudflare Stream" : job.stage === "encoding" ? "Stream is encoding · H.264 · adaptive" : job.stage === "scanning" ? "Reading audio for the A1 waveform" : job.stage === "queued" ? "Waiting for the pipe" : "Ready on the site"}</span>
        {(job.stage === "done" || job.stage === "error") && <button type="button" onClick={() => dismiss(job.projectId)} aria-label={`Clear ${job.title}`} className="shrink-0 hover:text-paper px-1">✕</button>}
      </div>
    </li>
  );
}
