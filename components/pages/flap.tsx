"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// NOW CUTTING board: the letters flip once into place, like a split-flap display
export function Flap({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("rm")) return;
    let n = 0;
    const id = setInterval(() => {
      n++;
      setShown([...text].map((ch, i) => (ch === " " || n >= 4 + i ? ch : CHARS[Math.floor(Math.random() * 26)])).join(""));
      if (n >= 4 + text.length) clearInterval(id);
    }, 83);
    return () => clearInterval(id);
  }, [text]);
  return (
    <div className="board" role="img" aria-label={`Now cutting: ${text}`}>
      <span className="k">NOW CUTTING</span>
      <div className="cells" aria-hidden="true">{[...shown].map((ch, i) => (ch === " " ? <span key={i} className="sp" /> : <span key={i}>{ch}</span>))}</div>
    </div>
  );
}
