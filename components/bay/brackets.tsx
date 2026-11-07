"use client";

import { useEffect, useRef } from "react";

// The target cursor: four yellow corners that slide onto whatever [data-tgt] the pointer is over.
// Mouse only: it hides on touch, on phones, under reduced motion, and while the stage scrolls.
export function Brackets() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const hide = () => { el.style.display = "none"; };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element).closest<HTMLElement>("[data-tgt]");
      if (!t || e.pointerType === "touch" || window.innerWidth < 768 || matchMedia("(prefers-reduced-motion: reduce)").matches) return hide();
      const r = t.getBoundingClientRect();
      Object.assign(el.style, { display: "block", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    };
    const out = (e: PointerEvent) => { if (!(e.relatedTarget as Element | null)?.closest?.("[data-tgt]")) hide(); };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => { document.removeEventListener("pointerover", over); document.removeEventListener("pointerout", out); document.removeEventListener("scroll", hide, { capture: true }); };
  }, []);
  return <div ref={ref} className="brackets" aria-hidden="true"><i /><i /><i /><i /></div>;
}
