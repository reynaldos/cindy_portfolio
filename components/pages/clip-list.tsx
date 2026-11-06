"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { bay } from "@/components/bay/bus";
import { CATEGORY_COLOR, tc } from "@/components/bay/const";
import { useMonitor } from "@/components/monitor/state";
import { ClipInspector } from "@/components/pages/clip-inspector";
import { clipFromProject } from "@/lib/media";
import type { Category, Project } from "@/lib/generated/prisma/client";

type Props = { category: Category; projects: (Project & { stills: { id: string }[] })[] };

// Category page: the rows under the sticky monitor. Scrolling selects the row at the monitor's edge;
// a click selects and plays. The selected index lives in the monitor state, so the inspector follows.
export function ClipRows({ category, projects }: Props) {
  const { index } = useMonitor();
  const list = useRef<HTMLDivElement>(null);
  const lock = useRef(0);

  const scrollTo = (i: number) => {
    const row = list.current?.querySelector<HTMLElement>(`[data-i="${i}"]`), stage = list.current?.closest<HTMLElement>(".stage");
    const mon = document.querySelector<HTMLElement>(".mon-wrap.sticky");
    if (!row || !stage) return;
    lock.current = Date.now();
    stage.scrollTo({ top: row.offsetTop - (mon?.offsetHeight ?? 0) - 8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  // scroll-select: the row nearest the monitor's bottom edge becomes current, with no autoplay
  useEffect(() => {
    const stage = list.current?.closest<HTMLElement>(".stage");
    if (!stage) return;
    let t = 0;
    const onScroll = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        if (Date.now() - lock.current < 700) return;
        const mon = document.querySelector(".mon-wrap.sticky")?.getBoundingClientRect();
        const ref = mon ? mon.bottom + 40 : stage.getBoundingClientRect().top + stage.clientHeight * 0.35;
        let best = -1, bd = 1e9;
        list.current?.querySelectorAll<HTMLElement>("[data-i]").forEach((r) => { const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - ref); if (d < bd) { bd = d; best = +r.dataset.i!; } });
        if (best >= 0) bay("select", best);
      }, 140);
    };
    stage.addEventListener("scroll", onScroll, { passive: true });
    return () => { stage.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, []);

  // arrows and the timeline change the clip; bring its row into view
  useEffect(() => { if (Date.now() - lock.current > 700) scrollTo(index); }, [index]);

  const pick = (i: number) => { bay("select", i); scrollTo(i); bay("play"); };
  return (
    <div className="rows gut" ref={list}>
      {projects.length === 0 && <p className="dimt">Cuts coming soon.</p>}
      {projects.map((pr, i) => {
        const c = clipFromProject(pr);
        return (
          <article key={pr.id} className={`row ${i === index ? "sel" : ""}`} style={{ "--c": CATEGORY_COLOR[category.slug] } as React.CSSProperties} data-i={i} onClick={() => pick(i)}>
            <span className="thumb">{c.poster && <Image src={c.poster} alt="" fill sizes="160px" />}<span className="no">{String(i + 1).padStart(2, "0")}</span></span>
            <span className="tx">
              <button type="button" className="t" onClick={(e) => { e.stopPropagation(); pick(i); }}>{c.title}</button>
              <span className="s">{[pr.client, pr.productionCo, pr.year].filter(Boolean).join(" · ")}</span>
              <span className="d">{pr.description}</span>
            </span>
            {pr.durationSec && <span className="rt">{tc(pr.durationSec, pr.fps ?? 24)}</span>}
          </article>
        );
      })}
      <div style={{ height: "40vh" }} aria-hidden="true" />
    </div>
  );
}

export function ClipInspectorLive({ category, projects }: Props) {
  const { index } = useMonitor();
  const p = projects[index];
  return (
    <aside className="insp" aria-label="Inspector">
      <div className="ptab"><span className="on">Inspector</span><span className="r">Clip</span></div>
      <div className="insp-b">
        {p ? <ClipInspector p={p} one={category.one} color={CATEGORY_COLOR[category.slug]} i={index} n={projects.length} nextTitle={projects[index + 1]?.title} detailHref={p.stills.length || p.credits ? `/projects/${category.slug}/${p.slug}` : undefined} /> : <p className="dimt">No cuts in this track yet.</p>}
      </div>
    </aside>
  );
}
