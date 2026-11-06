"use client";

import { bay } from "@/components/bay/bus";

// one big button on the hero: plays the reel from the start, with sound
export function PlayReel({ children }: { children: React.ReactNode }) {
  return <button type="button" className="btn pri" style={{ marginTop: 16 }} onClick={() => bay("watch")}>{children}</button>;
}
