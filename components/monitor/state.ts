import { useSyncExternalStore } from "react";

// The player's state, sent by the monitor as one window event and read anywhere with useMonitor()
// started: a clip has played on this page since it was shown; the hero button hides on it
export type MonitorState = { playing: boolean; started: boolean; muted: boolean; file: string | null; peaks: number[] | null; duration: number; index: number };

export const IDLE: MonitorState = { playing: false, started: false, muted: true, file: null, peaks: null, duration: 0, index: 0 };
let state = IDLE;

export const emitMonitor = (s: MonitorState) => window.dispatchEvent(new CustomEvent("baystate", { detail: s }));

const sub = (cb: () => void) => {
  const h = (e: Event) => { state = (e as CustomEvent<MonitorState>).detail; cb(); };
  window.addEventListener("baystate", h);
  return () => window.removeEventListener("baystate", h);
};

export const useMonitor = () => useSyncExternalStore(sub, () => state, () => IDLE);
