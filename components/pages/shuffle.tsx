"use client";

import { useEffect, useState } from "react";
import { FPS } from "@/components/bay/const";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// A title that lands letter by letter over six frames whenever its text changes, like a slate being re-typed.
// The scramble is kept with the text it belongs to, so a new text renders plain until its own frames start.
export function Shuffle({ text }: { text: string }) {
  const [anim, setAnim] = useState({ text, shown: text });
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let f = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      f++;
      const keep = Math.floor((f / 6) * text.length);
      setAnim({ text, shown: f < 6 ? [...text].map((ch, i) => (i < keep || ch === " " ? ch : CHARS[Math.floor(Math.random() * CHARS.length)])).join("") : text });
      if (f < 6) timer = setTimeout(tick, 1000 / FPS);
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [text]);
  return <span aria-label={text}>{anim.text === text ? anim.shown : text}</span>;
}
