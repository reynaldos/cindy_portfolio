"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type Hls from "hls.js";
import { onBay } from "@/components/bay/bus";
import { tc } from "@/components/bay/const";
import { emitMonitor, IDLE } from "@/components/monitor/state";
import type { Clip } from "@/lib/media";

type Props = {
  clips: Clip[];
  index?: number;
  mode: "reel" | "clips";
  sticky?: boolean;
  compact?: boolean;
  still?: { src: string | null; alt: string; file: string; fmt?: string };
  children?: React.ReactNode;
};

export function Monitor({ clips, index = 0, mode, sticky, compact, still, children }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const hls = useRef<Hls | null>(null);
  const audio = useRef<{ ctx: AudioContext; an: AnalyserNode[] } | null>(null);
  const [idx, setIdx] = useState(index);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const clip = clips[idx] ?? null;
  const fps = clip?.fps ?? 24;

  useEffect(() => {
    emitMonitor({ playing, started, muted, file: clip?.file ?? null, peaks: clip?.peaks ?? null, duration: dur || clip?.durationSec || 0, index: idx });
  }, [playing, started, muted, clip, dur, idx]);

  // the stream attaches on the first play, never before
  const attach = useCallback(async (v: HTMLVideoElement, src: string) => {
    if (v.dataset.src === src) return;
    v.dataset.src = src;
    hls.current?.destroy();
    hls.current = null;
    if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = src; return; }
    const HlsCtor = (await import("hls.js")).default;
    if (!HlsCtor.isSupported()) { v.src = src; return; }
    const h = new HlsCtor();
    h.on(HlsCtor.Events.ERROR, (_, d) => { if (d.fatal) setStatus("error"); });
    h.loadSource(src);
    h.attachMedia(v);
    hls.current = h;
  }, []);

  // builds the meter graph once, then just resumes the context
  const ensureAudio = () => {
    const v = video.current;
    audio.current?.ctx.resume();
    if (audio.current || !v || !/^https?:/.test(location.protocol)) return;
    try {
      const ctx = new AudioContext(), src = ctx.createMediaElementSource(v), split = ctx.createChannelSplitter(2);
      src.connect(split);
      src.connect(ctx.destination);
      const an = [0, 1].map((i) => { const a = ctx.createAnalyser(); a.fftSize = 1024; split.connect(a, i); return a; });
      audio.current = { ctx, an };
    } catch { audio.current = null; }
  };

  const play = useCallback(async (o: { sound?: boolean; restart?: boolean } = {}) => {
    const v = video.current, c = clips[idx];
    if (!v || !c?.src) return;
    setStatus("loading");
    await attach(v, c.src);
    if (o.sound) { v.muted = false; setMuted(false); }
    if (o.restart) v.currentTime = 0;
    if (!v.muted) ensureAudio();
    v.play().catch(() => setStatus("error"));
  }, [attach, clips, idx]);

  // transport and keys arrive on the bay bus
  useEffect(() => onBay((a, d) => {
    const v = video.current;
    if (a === "play") play();
    else if (a === "pause") v?.pause();
    else if (a === "toggle") { if (v && !v.paused) v.pause(); else play(); }
    else if (a === "watch") play({ sound: true, restart: true });
    else if (a === "back" && v) v.currentTime = Math.max(0, v.currentTime - 5);
    else if (a === "mute" && v) { v.muted = !v.muted; setMuted(v.muted); if (!v.muted) ensureAudio(); }
    else if (mode === "clips" && (a === "prev" || a === "next")) setIdx((i) => Math.max(0, Math.min(clips.length - 1, i + (a === "next" ? 1 : -1))));
    else if (a === "select" && typeof d === "number") setIdx(Math.max(0, Math.min(clips.length - 1, d)));
  }), [play, mode, clips.length]);

  // a clip change keeps the play state; a paused monitor just swaps the poster
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    setStatus("idle");
    setT(0);
    setDur(clips[idx]?.durationSec ?? 0);
    if (!v.paused && clips[idx]?.src) play();
    else { hls.current?.destroy(); hls.current = null; v.removeAttribute("src"); delete v.dataset.src; v.load(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // audio meters: drawn into the frame's canvas only while sound plays; one idle frame on resize
  useEffect(() => {
    const live = playing && !muted;
    const ro = new ResizeObserver(() => drawMeters(audio.current, live ? undefined : -90));
    const canvas = document.getElementById("meter");
    if (canvas) ro.observe(canvas);
    if (!live) { drawMeters(audio.current, -90); return () => ro.disconnect(); }
    let raf = 0;
    const loop = () => { drawMeters(audio.current); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [playing, muted]);

  // Leaving the page stops the clip: a detached <video> wired into an AudioContext would keep playing on its own.
  // Coming back (the router keeps the page alive) re-syncs the state with the element, which is paused by then.
  useEffect(() => {
    const v = video.current;
    const sync = setTimeout(() => { setPlaying(!!v && !v.paused); setStarted(false); }, 0);
    return () => {
      clearTimeout(sync);
      v?.pause();
      hls.current?.destroy();
      void audio.current?.ctx.close();
      audio.current = null;
      emitMonitor({ ...IDLE });
    };
  }, []);

  // timeupdate can arrive while the old page unmounts, so read the element from the event, not the ref
  const onTime = (v: HTMLVideoElement) => {
    setT(v.currentTime);
    const d = v.duration || dur;
    document.getElementById("wavePos")?.setAttribute("x", d ? ((v.currentTime / d) * 360).toFixed(1) : "0");
  };

  // a still frame: About's portrait. No player, no transport.
  if (still) return (
    <div className="mon-wrap gut"><div className="mon-box">
      <div className="ptab"><span className="on">Program: {still.file}</span><span className="r">{still.fmt ?? ""}</span></div>
      <div className="monitor" data-tgt>
        {still.src ? <Image className="poster" src={still.src} alt={still.alt} fill sizes="(min-width: 1024px) 60vw, 100vw" priority /> : <div className="ph"><span className="lbl">{still.alt}</span></div>}
        <i className="sm a" /><i className="sm b" /><i className="sm c" /><i className="sm d" />
        <div className="burn"><span>{still.file}</span><span><span className="mt">SRC </span>00:00:00:01</span></div>
      </div>
    </div></div>
  );

  const cur = tc(t, fps), tot = tc(dur, fps);
  const fmt = clip?.width ? `${clip.width} × ${clip.height} · ${Math.round((clip.fps ?? 24) * 100) / 100} fps` : "";
  const canPlay = !!clip?.src;

  return (
    <div className={`mon-wrap gut ${sticky ? "sticky" : ""} ${compact ? "fit" : ""}`}>
      <div className="mon-box">
        <div className="ptab"><span className="on">Program: {clip?.file ?? "—"}</span><span className="r">{fmt}</span></div>
        <div className="monitor" data-status={status} data-tgt>
          {clip?.poster ? <Image className="poster" src={clip.poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" priority={mode === "reel"} /> : !canPlay && <div className="ph"><span className="lbl">Video coming soon</span></div>}
          <video ref={video} playsInline preload="none" muted crossOrigin="anonymous" aria-label="Program monitor" poster={clip?.poster ?? undefined}
            onPlay={() => { setPlaying(true); setStarted(true); setStatus("idle"); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onTimeUpdate={(e) => onTime(e.currentTarget)} onError={() => setStatus("error")} onVolumeChange={(e) => setMuted(e.currentTarget.muted)}>
            {clip?.captions && <track kind="captions" src={clip.captions} srcLang="en" label="English" default />}
          </video>
          <div className="offline"><b>MEDIA OFFLINE</b><span>{clip?.file ?? "clip"} did not load</span></div>
          {children}
          <i className="sm a" /><i className="sm b" /><i className="sm c" /><i className="sm d" />
          <div className="burn"><span>{clip?.file ?? ""}</span><span><span className="mt">SRC </span>{cur}</span></div>
        </div>
        <div className={`renderbar ${status === "loading" ? "go" : ""}`}><i /></div>
        <div className="scrubwrap"><input type="range" className="scrub" min={0} max={1000} value={dur ? Math.round((t / dur) * 1000) : 0} aria-label="Clip position" disabled={!canPlay} onChange={(e) => { const v = video.current!; if (v.duration) v.currentTime = (+e.target.value / 1000) * v.duration; }} /></div>
        <div className="transport">
          {mode === "clips" && <button type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Previous clip"><SkipBack aria-hidden="true" /><span className="lbl">Prev</span><kbd>←</kbd></button>}
          <button type="button" onClick={() => (playing ? video.current?.pause() : play())} disabled={!canPlay}>
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}<span className="lbl">{playing ? "Pause" : mode === "reel" ? "Play reel" : "Play"}</span><kbd>L</kbd>
          </button>
          {mode === "clips" && <button type="button" onClick={() => setIdx((i) => Math.min(clips.length - 1, i + 1))} disabled={idx >= clips.length - 1} aria-label="Next clip"><span className="lbl">Next</span><SkipForward aria-hidden="true" /><kbd>→</kbd></button>}
          <span className="sep" />
          <button type="button" aria-pressed={muted} title="Mute / unmute" onClick={() => { const v = video.current!; v.muted = !v.muted; setMuted(v.muted); if (!v.muted) ensureAudio(); }}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}<span className="lbl">{muted ? "Unmute" : "Mute"}</span><kbd>M</kbd>
          </button>
          <button type="button" title="Fullscreen" onClick={() => video.current?.closest(".monitor")?.requestFullscreen?.().catch(() => {})}><Maximize aria-hidden="true" /><span className="lbl">Full</span></button>
          <span className="tc">{cur}<span className="tot"> / {tot}</span></span>
        </div>
      </div>
    </div>
  );
}

// The meter canvas lives in the frame. Linear 0…−60 dB, falling peak tick, gradient built once per size.
const peak = [0, 0], buf = new Float32Array(1024);
let grad: { key: string; g: CanvasGradient } | null = null;
function level(a: AnalyserNode) { a.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-6); }
function drawMeters(audio: { an: AnalyserNode[] } | null, force?: number) {
  const c = document.getElementById("meter") as HTMLCanvasElement | null;
  if (!c || !c.offsetParent) return;
  const W = c.clientWidth, H = c.clientHeight;
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; grad = null; }
  const x = c.getContext("2d")!, css = getComputedStyle(c);
  // bars, gap, and the dB scale (about 76px) sit centred in the meters column
  const top = 10, h = H - 26, bw = 16, gap = 6, x0 = Math.max(4, Math.round((W - 76) / 2)), sx = x0 + 2 * bw + gap;
  const toY = (db: number) => top + h * Math.min(1, Math.max(0, -db / 60));
  x.clearRect(0, 0, W, H);
  x.font = "11px JetBrains Mono, monospace"; x.fillStyle = css.getPropertyValue("--color-dim"); x.textAlign = "left";
  for (const db of [0, -6, -12, -18, -24, -36, -48]) { const y = toY(db); x.fillRect(sx + 3, y, 3, 1); x.fillText(String(db), sx + 10, y + 4); }
  if (!grad || grad.key !== `${H}`) { const g = x.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, css.getPropertyValue("--color-cut")); g.addColorStop(0.12, css.getPropertyValue("--color-marker")); g.addColorStop(0.3, css.getPropertyValue("--color-audio")); g.addColorStop(1, css.getPropertyValue("--color-audio")); grad = { key: `${H}`, g }; }
  [0, 1].forEach((i) => {
    const bx = x0 + i * (bw + gap), db = force ?? (audio ? level(audio.an[i]) : -90);
    x.fillStyle = css.getPropertyValue("--color-track"); x.fillRect(bx, top, bw, h);
    peak[i] = Math.max(db, peak[i] - 0.4);
    x.fillStyle = grad!.g; x.fillRect(bx, toY(db), bw, top + h - toY(db));
    if (peak[i] > -60) { x.fillStyle = css.getPropertyValue("--color-paper"); x.fillRect(bx, toY(peak[i]), bw, 1); }
  });
  x.fillStyle = css.getPropertyValue("--color-dim"); x.textAlign = "center"; x.fillText("L", x0 + bw / 2, H - 4); x.fillText("R", x0 + bw + gap + bw / 2, H - 4);
}
