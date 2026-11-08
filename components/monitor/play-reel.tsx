"use client";

import { Pause, Play } from "lucide-react";
import { bay } from "@/components/bay/bus";
import { useMonitor } from "@/components/monitor/state";

// The hero button: "Play reel" at rest; while the reel plays it folds into a square pause button
export function PlayReel() {
  const { playing } = useMonitor();
  if (playing) return <button type="button" className="btn pri sq" aria-label="Pause reel" title="Pause (L)" onClick={() => bay("pause")}><Pause aria-hidden="true" /></button>;
  return <button type="button" className="btn pri" onClick={() => bay("watch")}><Play aria-hidden="true" />Play reel</button>;
}
