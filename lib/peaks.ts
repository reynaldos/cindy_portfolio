"use client";

import { manifestUrl } from "@/lib/media";

export const BINS = 240;
const loaded = new WeakSet<AudioContext>();

// A small audio worklet: the loudest sample of every block, posted to the page.
// It runs on the audio thread, so a hidden or background tab does not slow it down.
const WORKLET = `class P extends AudioWorkletProcessor { process(inputs) { const ch = inputs[0]; let m = 0; for (const c of ch) for (let i = 0; i < c.length; i++) { const a = c[i] < 0 ? -c[i] : c[i]; if (a > m) m = a; } this.port.postMessage([m, ch[0] ? ch[0].length : 128]); return true; } } registerProcessor("peaks", P);`;

// Plays the finished stream silently at up to 16x and keeps the loudest sample per bin.
// The context must already be allowed (made after a click), or the browser keeps it suspended.
export async function scanPeaks(ctx: AudioContext, uid: string, durationSec: number, onProgress?: (t: number) => void): Promise<number[]> {
  const src = manifestUrl(uid);
  const v = document.createElement("video");
  v.crossOrigin = "anonymous";
  v.preload = "auto";
  v.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.append(v);
  let hls: { destroy(): void } | null = null;
  try {
    if (v.canPlayType("application/vnd.apple.mpegurl")) v.src = src;
    else {
      const Hls = (await import("hls.js")).default;
      const h = new Hls({ maxBufferLength: 120 });
      h.loadSource(src);
      h.attachMedia(v);
      hls = h;
    }
    await new Promise<void>((ok, bad) => { v.onloadedmetadata = () => ok(); v.onerror = () => bad(new Error("video failed to load")); });
    const rate = Math.min(16, Math.max(1, durationSec / 20));
    if (!loaded.has(ctx)) {
      await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" })));
      loaded.add(ctx);
    }
    const node = new AudioWorkletNode(ctx, "peaks");
    const mute = new GainNode(ctx, { gain: 0 });
    const source = ctx.createMediaElementSource(v);
    source.connect(node).connect(mute).connect(ctx.destination);

    const peaks = new Array<number>(BINS).fill(0);
    // bins follow the player's own clock: silent blocks while it buffers or has not started must not shift the wave
    node.port.onmessage = ({ data: [m] }: MessageEvent<[number, number]>) => {
      if (v.paused || v.seeking || v.readyState < 3) return;
      const t = v.currentTime;
      const i = Math.min(BINS - 1, Math.floor((t / durationSec) * BINS));
      if (m > peaks[i]) peaks[i] = m;
      onProgress?.(Math.min(1, t / durationSec));
    };
    v.playbackRate = rate;
    await v.play();
    await new Promise<void>((ok, bad) => { v.onended = () => ok(); v.onerror = () => bad(new Error("playback failed")); });
    source.disconnect();
    node.disconnect();
    const max = Math.max(...peaks) || 1;
    return peaks.map((p) => Math.round((p / max) * 100) / 100);
  } finally {
    hls?.destroy();
    v.remove();
  }
}
