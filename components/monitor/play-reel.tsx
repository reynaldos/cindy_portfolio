"use client";

import { Play } from "lucide-react";
import { bay } from "@/components/bay/bus";
import { useMonitor } from "@/components/monitor/state";

// The hero button plays the reel from the start, with sound. Once the reel has started on this visit it is gone,
// paused or not; a fresh visit to the page brings it back.
export function PlayReel() {
  const { started } = useMonitor();
  if (started) return null;
  return <button type="button" className="btn pri" onClick={() => bay("watch")}><Play aria-hidden="true" />Play reel</button>;
}
