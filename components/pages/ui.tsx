"use client";

import { useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import { bay } from "@/components/bay/bus";
import { useClock } from "@/components/bay/clock";

// small client pieces the server pages drop in

export function ContactButton({ className = "btn pri", children }: { className?: string; children: React.ReactNode }) {
  return <button type="button" className={className} onClick={() => bay("contact")}>{children}</button>;
}

export function WatchButton() {
  return <button type="button" className="btn pri" onClick={() => bay("watch")}><Play aria-hidden="true" />Watch full cut</button>;
}

// an icon next to the email; the email itself is a mailto link
export function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false);
  const copy = () => navigator.clipboard?.writeText(email).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); });
  return <button type="button" className="iconbtn" aria-label={done ? "Copied" : "Copy email"} title="Copy email" onClick={copy}>{done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}</button>;
}

export function LaClock() {
  const [, time] = useClock();
  return <span>LOS ANGELES {time}</span>;
}

// the client list scrolls; hover, focus inside the credits, or a click pauses it
export function Marquee({ items }: { items: string[] }) {
  const [paused, setPaused] = useState(false);
  const text = items.map((c) => c.toUpperCase()).join(" · ") + " · ";
  return (
    <div className="mq" title="Click to pause or resume" onClick={() => setPaused((v) => !v)}>
      <div className={`marquee ${paused ? "paused" : ""}`} aria-hidden="true"><div>{text}{text}</div></div>
      <ul className="sr">{items.map((c) => <li key={c}>{c}</li>)}</ul>
    </div>
  );
}
