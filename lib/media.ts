import type { Project } from "@/lib/generated/prisma/client";
import { markersOf, type Marker } from "@/lib/markers";

// URL helpers for Stream and R2. Safe on the client; they read only NEXT_PUBLIC values.
const STREAM = `https://customer-${process.env.NEXT_PUBLIC_STREAM_CUSTOMER_CODE}.cloudflarestream.com`;

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const r2Url = (key: string) => `${process.env.NEXT_PUBLIC_MEDIA_URL}/${key}`;

// a streamUid that is already a URL plays as-is, so any HLS link works as a stand-in
export const manifestUrl = (uid: string) => (/^https?:/.test(uid) ? uid : `${STREAM}/${uid}/manifest/video.m3u8`);

export const thumbUrl = (uid: string, t: number, height = 720) => (/^https?:/.test(uid) ? null : `${STREAM}/${uid}/thumbnails/thumbnail.jpg?time=${t}s&height=${height}`);

// six frames for a timeline film strip
export const stripUrls = (uid: string, durationSec: number) => Array.from({ length: 6 }, (_, i) => thumbUrl(uid, Math.max(0, ((i + 0.5) / 6) * durationSec), 60)).filter((u): u is string => !!u);

export type Clip = {
  id: string;
  title: string;
  file: string;
  src: string | null;
  poster: string | null;
  durationSec: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  peaks: number[] | null;
  captions: string | null;
  markers: Marker[];
};

// poster: 720 for the monitor, 240 for tiles; an options object, so Array.map can never pass an index in
export function clipFromProject(p: Project, { poster = 720 } = {}): Clip {
  const uid = p.streamUid && p.videoStatus !== "error" ? p.streamUid : null;
  return {
    id: p.id,
    title: p.subtitle ? `${p.title} · ${p.subtitle}` : p.title,
    file: `${p.slug.toUpperCase().replace(/-/g, "_")}.mp4`,
    src: uid ? manifestUrl(uid) : null,
    poster: p.posterKey ? r2Url(p.posterKey) : uid ? thumbUrl(uid, p.posterTimeSec, poster) : null,
    durationSec: p.durationSec,
    fps: p.fps,
    width: p.width,
    height: p.height,
    peaks: Array.isArray(p.peaks) ? (p.peaks as number[]) : null,
    markers: markersOf(p.markers),
    captions: p.captionsKey ? r2Url(p.captionsKey) : null,
  };
}
