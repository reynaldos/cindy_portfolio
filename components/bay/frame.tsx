"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ViewTransition, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { bay } from "@/components/bay/bus";
import { PAGES, SEQ, pageOf, tc } from "@/components/bay/const";
import { Timeline, type Marker, type Track } from "@/components/bay/timeline";
import { Brackets } from "@/components/bay/brackets";
import { ContactDialog } from "@/components/contact/contact-dialog";
import { useClock } from "@/components/bay/clock";
import { useMonitor } from "@/components/monitor/state";
import type { getCategories, getProfile, getRecentWork } from "@/lib/data";
import { clipFromProject, stripUrls } from "@/lib/media";

type Props = {
  profile: Awaited<ReturnType<typeof getProfile>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
  recent: Awaited<ReturnType<typeof getRecentWork>>;
  children: React.ReactNode;
};

type MenuItem = [label: string, act: string, key?: string, pressed?: boolean] | null;

const reduced = () => document.documentElement.classList.contains("rm") || matchMedia("(prefers-reduced-motion: reduce)").matches;

// one localStorage flag, shared through a storage event so the server snapshot stays false
const stored = { get: (k: string, def = false) => { try { const v = localStorage.getItem(k); return v === null ? def : v === "1"; } catch { return def; } }, set: (k: string, v: boolean) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch {} window.dispatchEvent(new Event("storage")); } };
const storageSub = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };
const useStored = (k: string, def = false) => useSyncExternalStore(storageSub, () => stored.get(k, def), () => def);


export function BayFrame({ profile, categories, recent, children }: Props) {
  const pathname = usePathname();
  const page = pageOf(pathname);
  const app = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const binOpen = useStored("cbc-bin-open");
  const binIcons = useStored("cbc-bin-icons");
  const about = useRef<HTMLDialogElement>(null);
  const [tlPin, setTlPin] = useState(false);
  const [tlOpen, setTlOpen] = useState(false);
  const [rm, setRm] = useState(false);
  const inspOn = useStored("cbc-insp", true);
  const [menu, setMenu] = useState<number | null>(null);
  const [p, setP] = useState(0);
  const [cutting, setCutting] = useState(false);
  const [note, setNote] = useState("");
  const [date, time] = useClock();
  const mon = useMonitor();

  const brand = profile?.brand ?? "Cuts By Cindy";
  const email = profile?.contactEmail ?? "";
  const catSlug = pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const cat = categories.find((c) => c.slug === catSlug);
  const projName = cat?.name ?? PAGES.find(([h]) => h === page)?.[1] ?? "Media Offline";

  // playhead follows the stage scroll; --sh lets pages size sticky parts to the stage
  useEffect(() => {
    const st = stage.current!;
    const onScroll = () => { const max = st.scrollHeight - st.clientHeight; setP(max > 0 ? st.scrollTop / max : 0); };
    const ro = new ResizeObserver(() => app.current?.style.setProperty("--sh", `${st.clientHeight}px`));
    ro.observe(st);
    st.addEventListener("scroll", onScroll, { passive: true });
    return () => { ro.disconnect(); st.removeEventListener("scroll", onScroll); };
  }, []);

  // after a page change: scroll to top and focus the title (the live region announces it)
  useEffect(() => {
    stage.current?.scrollTo(0, 0);
    document.querySelector<HTMLElement>("[data-h1]")?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => { document.documentElement.classList.toggle("rm", rm); }, [rm]);

  // single keys never steal Space or Enter from a focused control, and stay out of text fields
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") { setMenu(null); return; }
      const onCtrl = ae && ae !== document.body && ae.matches("button, a, input, select, textarea, summary, [role=button], [role=slider]");
      const inField = ae?.matches("input, select, textarea, [contenteditable]");
      if (e.metaKey || e.ctrlKey || e.altKey || inField || (onCtrl && (e.key === " " || e.key === "Enter"))) return;
      const st = stage.current!;
      if (e.key === "?") { sheet.current?.showModal(); return; }
      if (e.key === "Home") { e.preventDefault(); st.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }); return; }
      if (e.key === "End") { e.preventDefault(); st.scrollTo({ top: st.scrollHeight, behavior: reduced() ? "auto" : "smooth" }); return; }
      const k = e.key.toLowerCase();
      if (k === "m") bay("mute");
      else if (k === "j") { e.preventDefault(); bay("back"); }
      else if (k === "k") bay("pause");
      else if (k === "l") bay("toggle");
      else if (k === " ") { e.preventDefault(); bay("toggle"); }
      else if (k === "arrowleft") { e.preventDefault(); bay("prev"); }
      else if (k === "arrowright") { e.preventDefault(); bay("next"); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // a link click sets the blade position for the razor cut; a second click finishes the running cut
  const onNavClick = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest("a[href]");
    if (!a || !app.current) return;
    (document as Document & { activeViewTransition?: { skipTransition(): void } }).activeViewTransition?.skipTransition();
    const w = stage.current!.getBoundingClientRect(), r = a.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - w.left) / w.width) * 100;
    document.documentElement.style.setProperty("--cut-x", `${Math.max(30, Math.min(70, isFinite(x) ? x : 50))}%`);
    setMenu(null);
    setNote("");
    if (reduced()) return;
    setCutting(false);
    requestAnimationFrame(() => setCutting(true));
    setTimeout(() => setCutting(false), 708);
  };

  const seek = (q: number) => { const st = stage.current!; st.scrollTo({ top: q * (st.scrollHeight - st.clientHeight), behavior: "auto" }); };
  const toggleBin = () => stored.set("cbc-bin-open", !binOpen);
  const copyEmail = () => navigator.clipboard?.writeText(email).then(() => setNote("Email copied"), () => setNote(`Email: ${email}`));

  const menus: [string, MenuItem[]][] = [
    ["File", [["New inquiry…", "contact", "⌘N"], null, ["Copy email address", "copy"], ...(profile?.instagramUrl ? [["Instagram", `link:${profile.instagramUrl}`] as MenuItem] : []), ...(profile?.vimeoUrl ? [["Vimeo", `link:${profile.vimeoUrl}`] as MenuItem] : []), null, ["Close menu", "close", "esc"]]],
    ["Clip", [["Play / Pause", "toggle", "L"], ["Pause", "pause", "K"], ["Back 5 seconds", "back", "J"], ["Play / Pause", "toggle", "Space"], null, ["Previous clip", "prev", "←"], ["Next clip", "next", "→"], ["Watch full cut (sound)", "watch"], ["Mute / Unmute", "mute", "M"], null, ["Go to start", "home", "Home"], ["Go to end credits", "end", "End"]]],
    ["Window", [["Project bin", "bin", "", binOpen], ["Inspector", "insp", "", inspOn], ["Timeline (keep open)", "tlpin", "", tlPin], null, ["Reduce motion", "rm", "", rm]]],
    ["Help", [["Keyboard shortcuts", "keys", "?"], ["About Cindy", "link:/about"], null, ["Admin", "link:/admin"], ["Who made this", "made"]]],
  ];

  // an open menu closes on a click, a tap, or a focus move anywhere outside the menu bar
  useEffect(() => {
    if (menu === null) return;
    const outside = (e: Event) => { if (!(e.target as Element).closest?.(".menus")) setMenu(null); };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", outside, true);
    return () => { document.removeEventListener("pointerdown", outside, true); document.removeEventListener("focusin", outside, true); };
  }, [menu]);

  const act = (a: string) => {
    setMenu(null);
    const st = stage.current!;
    if (a === "copy") copyEmail();
    else if (a === "bin") toggleBin();
    else if (a === "insp") stored.set("cbc-insp", !inspOn);
    else if (a === "tlpin") setTlPin((v) => !v);
    else if (a === "rm") setRm((v) => !v);
    else if (a === "keys") sheet.current?.showModal();
    else if (a === "made") about.current?.showModal();
    else if (a === "home") st.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    else if (a === "end") st.scrollTo({ top: st.scrollHeight, behavior: reduced() ? "auto" : "smooth" });
    else if (a !== "close") bay(a as Parameters<typeof bay>[0]);
  };

  // what the context tracks show depends on the page
  const tracks: Track[] = (() => {
    if (pathname === "/") return [{ name: "Reel", clips: [{ label: "Showreel", index: 0, color: "var(--color-line)" }] }];
    const strip = (pr: { streamUid: string | null; durationSec: number | null }) => (pr.streamUid && pr.durationSec ? stripUrls(pr.streamUid, pr.durationSec) : undefined);
    if (pathname === "/projects") return categories.map((c) => ({ name: c.name, clips: c.projects.map((pr) => ({ label: pr.subtitle ?? pr.title, href: `/projects/${c.slug}`, color: c.color, strip: strip(pr) })) }));
    if (cat) return [{ name: cat.name, clips: cat.projects.map((pr, i) => ({ label: pr.subtitle ?? pr.title, index: i, current: i === mon.index, color: cat.color, strip: strip(pr) })) }];
    if (pathname === "/recent-work" && recent) return [{ name: recent.title, clips: recent.spots.map((pr, i) => ({ label: pr.subtitle ?? pr.title, index: i, current: i === mon.index, color: pr.category.color, strip: strip(pr) })) }];
    if (pathname === "/about") return [{ name: "Tools", clips: (profile?.tools ?? []).map((t) => ({ label: t })) }];
    return [{ name: "Offline", clips: [{ label: "MEDIA OFFLINE" }] }];
  })();
  const markers: Marker[] = pathname === "/recent-work" && Array.isArray(recent?.markers) ? (recent.markers as Marker[]) : [];
  const seq = cat ? cat.name.toUpperCase().replace(/ /g, "_") : { "/": "CBC_REEL", "/projects": "PROJECTS", "/recent-work": "RECENT_WORK", "/about": "ABOUT" }[pathname] ?? "OFFLINE";
  const cap = cat || pathname === "/recent-work" ? "V2 clips select · V1 clips open pages · ← → clips · L play/pause" : pathname === "/projects" ? "Click a clip to open its category" : "V1 clips open pages · click the ruler to seek";
  const hasClips = !!cat || pathname === "/recent-work";

  return (
    <div
      ref={app}
      className="app"
      data-bin-open={binOpen || undefined}
      data-hide-insp={!inspOn || undefined}
      data-tl-pin={tlPin || undefined}
      data-tl-open={tlOpen || undefined}
      data-cutting={cutting || undefined}
      data-playing={mon.playing || undefined}
      onClickCapture={onNavClick}
    >
      <header className="bars">
      <div className="mbar">
        <Image className="mark" src="/cbc.svg" alt="" width={16} height={16} />
        <Link href="/" className="appname" title="Home">{brand}</Link>
        <div className="menus">
          {menus.map(([name, items], i) => (
            <div key={name}>
              <button type="button" aria-expanded={menu === i} aria-controls={`dd${i}`} onClick={() => setMenu(menu === i ? null : i)} onPointerEnter={() => { if (menu !== null) setMenu(i); }}>{name}</button>
              <div className={`dd ${i === menus.length - 1 ? "r" : ""}`} id={`dd${i}`} data-open={menu === i || undefined}>
                {items.map((it, j) => {
                  if (!it) return <hr key={j} />;
                  const [label, a, key, pressed] = it;
                  if (a.startsWith("link:")) { const href = a.slice(5); return href.startsWith("/") ? <Link key={j} href={href} onClick={() => setMenu(null)}>{label}</Link> : <a key={j} href={href} target="_blank" rel="noopener">{label}<span className="k" aria-hidden="true">↗</span></a>; }
                  return <button key={j} type="button" aria-pressed={pressed} onClick={() => act(a)}>{label}{key && <span className="k" aria-hidden="true">{key}</span>}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="right">
          <i className="rec" title="Playing" />
          <button type="button" className="vol" title="Mute / unmute (M)" onClick={() => bay("mute")}><Volume2 aria-hidden="true" /><span className="sr">Mute</span></button>
          <span><span className="date">{date}</span> {time}</span>
        </div>
      </div>

      <div className="wsbar">
        <nav className="ws" aria-label="Workspaces">
          {PAGES.map(([href, name]) => <Link key={href} href={href} aria-current={page === href ? "page" : undefined}>{name}</Link>)}
        </nav>
        <span className="proj">CUTS_BY_CINDY.prproj · {projName}</span>
        <button type="button" className="contact" onClick={() => bay("contact")}>Contact</button>
      </div>

      </header>
      <div className="work">
        <aside className="bin" aria-label="Project bin">
          <div className="ptab">
            <span className="on" title={`Project: ${brand}`}>Project</span>
            <span className="vt"><button type="button" aria-pressed={!binIcons} onClick={() => stored.set("cbc-bin-icons", false)}>List</button><button type="button" aria-pressed={binIcons} onClick={() => stored.set("cbc-bin-icons", true)}>Icons</button></span>
            <button type="button" className="binx" aria-expanded={binOpen} aria-label="Project bin" title="Show or hide the project bin" onClick={toggleBin}>
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
          <div className="bin-list">
            {binOpen && binIcons ? (
              <div className="bin-grid">
                {categories.flatMap((c) => c.projects.map((pr) => { const k = clipFromProject(pr); return (
                  <Link key={pr.id} href={`/projects/${c.slug}/${pr.slug}`} aria-current={pathname === `/projects/${c.slug}/${pr.slug}` ? "page" : undefined} style={{ "--c": c.color } as React.CSSProperties} title={k.title}>
                    <span className="pic">{k.poster && <Image src={k.poster} alt="" fill sizes="120px" />}</span>
                    <span className="n">{pr.subtitle ?? pr.title}</span><span className="d">{pr.durationSec ? tc(pr.durationSec, pr.fps ?? 24) : "—"} · {c.one}</span>
                  </Link>
                ); }))}
              </div>
            ) : (
              <>
                <Link className="bi" href="/" aria-current={pathname === "/" ? "page" : undefined} title="Reel"><i className="ic clip" />Reel</Link>
                <Link className="bi" href="/projects" aria-current={pathname === "/projects" ? "page" : undefined} title="Projects"><i className="ic bin" />Projects<span className="bc">( {String(categories.reduce((n, c) => n + c.projects.length, 0)).padStart(2, "0")} )</span></Link>
                {categories.map((c) => (
                  <Link key={c.slug} className="bi sub" href={`/projects/${c.slug}`} aria-current={catSlug === c.slug ? "page" : undefined} title={c.name}><i className="dot" style={{ "--c": c.color } as React.CSSProperties} />{c.name}<span className="bc">( {String(c.projects.length).padStart(2, "0")} )</span></Link>
                ))}
                <Link className="bi" href="/recent-work" aria-current={pathname === "/recent-work" ? "page" : undefined} title="Recent Work"><i className="ic bin" />Recent Work<span className="bc">( {String(recent?.spots.length ?? 0).padStart(2, "0")} )</span></Link>
                <Link className="bi" href="/about" aria-current={pathname === "/about" ? "page" : undefined} title="About"><i className="ic still" />About<span className="bc">.tif</span></Link>
                <button type="button" className="bi" title="End credits" onClick={() => act("end")}><i className="ic clip" />End credits<span className="bc">end</span></button>
              </>
            )}
          </div>
          <div className="bin-foot">{categories.length} bins · 24 fps</div>
        </aside>
        <div className="stage-wrap">
          <ViewTransition name="stage" update="razor" default="none">
            <main ref={stage} className="stage">{children}</main>
          </ViewTransition>
          <div className="blade" aria-hidden="true" />
        </div>
      </div>

      <div className="tlband">
        <div className="tlwrap">
          <Timeline seq={seq} cap={cap} tracks={tracks} markers={markers} page={page} a1={pathname === "/about" ? "still frame · no audio" : mon.file ? (mon.peaks ? mon.file : `${mon.file} · no audio preview`) : ""} peaks={mon.peaks} p={p} onSeek={seek} />
          <aside className="meters" aria-label="Audio meters"><div className="ptab"><span className="on">Audio Meters</span></div><canvas id="meter" /></aside>
        </div>
      </div>

      <section className="tlp" aria-label="Transport">
        <button type="button" className="tb" disabled={!hasClips} aria-label="Previous clip" onClick={() => bay("prev")}><SkipBack aria-hidden="true" /></button>
        <button type="button" className="tb" aria-label="Play or pause" onClick={() => bay("toggle")}>{mon.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
        <button type="button" className="tb" disabled={!hasClips} aria-label="Next clip" onClick={() => bay("next")}><SkipForward aria-hidden="true" /></button>
        <span className="tc"><span>{tc(p * SEQ)}</span><span className="nm">{mon.file ?? projName}</span></span>
        <button type="button" className="hdl" aria-expanded={tlOpen} aria-label={`${tlOpen ? "Close" : "Open"} timeline`} onClick={() => setTlOpen((v) => !v)}><i />Tracks</button>
      </section>

      <footer className="status" aria-label="Sequence status">
        <span>{seq}</span><span>1920 × 1080 · 24 fps</span><span className="mid">60 s sequence</span>
        <span className="mid ok">{mon.playing ? `Playing ${mon.file} · ${mon.muted ? "muted preview" : "sound on"}` : "J back 5 s · K pause · L play/pause · ← → clips"}</span>
        <span className="r">LOS ANGELES {time}</span>
      </footer>

      <dialog ref={sheet} className="sheet" aria-labelledby="keys-title">
        <div className="sheet-t"><span id="keys-title">Keyboard Shortcuts</span><button type="button" onClick={() => sheet.current?.close()}>Close</button></div>
        <div className="sheet-b">
          <dl className="keys">
            <dt>L</dt><dd>Play</dd><dt>K</dt><dd>Pause</dd><dt>J</dt><dd>Back 5 seconds</dd><dt>Space</dt><dd>Play or pause</dd>
            <dt>← / →</dt><dd>Previous or next clip</dd><dt>M</dt><dd>Mute or unmute</dd><dt>Home</dt><dd>Top of page</dd><dt>End</dt><dd>End credits</dd><dt>?</dt><dd>This list</dd><dt>Esc</dt><dd>Close</dd>
          </dl>
          <p className="text-dim text-xs mt-4 font-sans">When a button or link has focus, Space or Enter presses it. Keys do nothing while you type in a field.</p>
        </div>
      </dialog>
      <dialog ref={about} className="about-dev" aria-labelledby="made-title" onClick={(e) => { if (e.target === e.currentTarget) about.current?.close(); }}>
        <div className="bar"><button type="button" onClick={() => about.current?.close()} aria-label="Close" /></div>
        <div className="body">
          <div className="logo"><Image src="/cbc.svg" alt="" width={88} height={88} /></div>
          <h2 id="made-title">Cuts By Cindy</h2>
          <div className="sub">Video editor portfolio · 2026</div>
          <dl><dt>Designed by</dt><dd>Rey Sanchez</dd><dt>Developed by</dt><dd>Rey Sanchez</dd></dl>
          <a className="site" href="https://reysanchez.dev" target="_blank" rel="noopener">reysanchez.dev ↗</a>
          <div className="fine">Based in Atlanta.</div>
        </div>
      </dialog>
      <Brackets />
      <ContactDialog email={email} replyTime={profile?.replyTime ?? null} links={[["Instagram", profile?.instagramUrl], ["Vimeo", profile?.vimeoUrl], ["LinkedIn", profile?.linkedinUrl]].flatMap(([name, url]) => (url ? [{ name: name!, url }] : []))} />
      <div className="sr" aria-live="polite">{note || `Now showing: ${projName}`}</div>
    </div>
  );
}
