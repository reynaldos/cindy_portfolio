"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useClock } from "@/components/bay/clock";

type Props = { brand: string; name: string; city?: string | null };

const STEPS = ["Loading fonts…", "Linking media…", "Ready"];
const MIN = 2250;
const MAX = 2750;
const KEY = "cbc-splash";
// NEXT_PUBLIC_SPLASH_HOLD=1 keeps the card on screen on every load, for styling it
const HOLD = process.env.NEXT_PUBLIC_SPLASH_HOLD === "1";

// runs before paint, so a tab that already booted never flashes the card
const SKIP = HOLD ? "" : `try{if(sessionStorage.getItem("${KEY}"))document.documentElement.classList.add("no-splash")}catch{}`;

export function Splash({ brand, name, city }: Props) {
  const [step, setStep] = useState(0);
  // in: card fading up · run: bar crossing · out: card fading away
  const [phase, setPhase] = useState<"in" | "run" | "out" | "gone">("in");
  const [, , year] = useClock();

  // the layout never unmounts, so no cleanup: a second StrictMode run repeats the same idempotent steps
  useEffect(() => {
    // the stylesheet already hides a skipped splash
    if (document.documentElement.classList.contains("no-splash")) return;
    const t0 = performance.now();
    requestAnimationFrame(() => setPhase("run"));
    const fonts = document.fonts.ready.then(() => setStep(1));
    if (HOLD) return;
    const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : addEventListener("load", () => r(), { once: true })));
    // leave when ready: never sooner than MIN, never later than MAX
    Promise.race([Promise.all([fonts, loaded]), new Promise((r) => setTimeout(r, MAX))]).then(() => {
      setTimeout(() => {
        setStep(2);
        setPhase("out");
        try { sessionStorage.setItem(KEY, "1"); } catch {}
        setTimeout(() => setPhase("gone"), 600);
      }, Math.max(0, MIN - (performance.now() - t0)));
    });
  }, []);

  if (phase === "gone") return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
      <div className="splash" data-phase={phase} style={{ "--min": `${MIN}ms` } as React.CSSProperties} role="status" aria-label={`${brand} is loading`}>
        <div className="card">
          <div className="art" aria-hidden><i /><i /><i /></div>
          <div className="txt">
            <Image src="/cbc.svg" alt="" width={64} height={64} className="mark" priority />
            <div className="name">{brand}</div>
            <div className="ver">Video Editor Portfolio · {year}</div>
            <div className="st">{STEPS[step]}</div>
            <div className="cred">Cut by {name}{city ? ` · ${city}` : ""}</div>
          </div>
          <div className="bar"><i /></div>
        </div>
      </div>
    </>
  );
}
