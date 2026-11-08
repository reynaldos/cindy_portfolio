"use client";

import { useEffect, useRef, useState } from "react";
import { onBay } from "@/components/bay/bus";
import { CopyEmail } from "@/components/pages/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendInquiry, type ContactResult } from "@/lib/actions/contact";

type Props = { email: string; replyTime: string | null; links: { name: string; url: string }[] };
type State = { kind: "idle" } | { kind: "error"; field?: string; error: string } | { kind: "sending" } | { kind: "success" } | { kind: "failure"; error: string };

const TYPES = ["Short Film", "Commercial", "Music Video", "Trailer", "Other"];
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Turnstile loads once, the first time the dialog opens, and only when a site key is set
function loadTurnstile() {
  if (!SITE_KEY || document.querySelector("script[data-turnstile]")) return;
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  s.async = true;
  s.dataset.turnstile = "1";
  document.head.appendChild(s);
}
const EMPTY = { name: "", email: "", projectType: "Commercial", message: "" };

// The contact form, in the bay's words: an Export dialog. Opens on the "contact" bus event.
// The draft stays while the dialog is closed and clears only after a successful send.
// Closing after an error or failure goes back to the form; a sent message keeps its success screen.
export function ContactDialog({ email, replyTime, links }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [openedAt, setOpenedAt] = useState(0);
  // the select menu portals into the dialog, otherwise it sits under the modal backdrop
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortal(dlg.current); return onBay((a) => { if (a === "contact") { setOpenedAt(Date.now()); loadTurnstile(); dlg.current?.showModal(); } }); }, []);

  // after each state change, focus the status message so it is announced
  useEffect(() => { if (state.kind !== "idle") status.current?.focus(); }, [state]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    // the render bar gets at least two seconds on screen, like a real export
    const [r]: [ContactResult, unknown] = await Promise.all([sendInquiry({ ...draft, website: String(form.get("website") ?? ""), openedAt: String(openedAt), turnstile: String(form.get("cf-turnstile-response") ?? "") }), new Promise((done) => setTimeout(done, 2000))]);
    if (r.ok) { setState({ kind: "success" }); setDraft(EMPTY); }
    else if (r.field) setState({ kind: "error", field: r.field, error: r.error });
    else setState({ kind: "failure", error: r.error });
  };
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const err = state.kind === "error" ? state : null;

  return (
    <dialog ref={dlg} className="sheet" aria-labelledby="contact-title" onClose={() => { if (state.kind === "error" || state.kind === "failure") setState({ kind: "idle" }); }}>
      <div className="sheet-t"><span id="contact-title">Export Settings — Send Cindy a message</span><button type="button" onClick={() => dlg.current?.close()}>Close</button></div>
      <div className="sheet-b">
        {state.kind === "sending" && <><p ref={status} tabIndex={-1} className="h3">Exporting your message…</p><div className="prog" role="progressbar" aria-label="Export progress"><i /></div><p className="fmt render" aria-hidden="true"><span>Encoding · H.264 · 1920×1080</span><span className="pct" /></p></>}
        {state.kind === "success" && <><p ref={status} tabIndex={-1} className="h3">Export complete.</p><p>{replyTime ? `Cindy will reply ${replyTime}.` : "Cindy will reply soon."}</p><button type="button" className="btn sec" onClick={() => setState({ kind: "idle" })}>Send another</button></>}
        {state.kind === "failure" && <><p ref={status} tabIndex={-1} className="h3 err">Export failed.</p><p>{state.error} Email Cindy directly:</p><button type="button" className="btn sec" onClick={() => setState({ kind: "idle" })}>Try again</button></>}
        {(state.kind === "idle" || state.kind === "error") && (
          <form onSubmit={submit} noValidate>
            {err && <p ref={status} tabIndex={-1} className="err" aria-live="polite">{err.error}</p>}
            <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" name="name" value={draft.name} onChange={set("name")} autoComplete="name" autoFocus aria-invalid={err?.field === "name" || undefined} /></div>
            <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" value={draft.email} onChange={set("email")} autoComplete="email" aria-invalid={err?.field === "email" || undefined} /></div>
            <div className="field"><label htmlFor="c-type">Project type</label><Select value={draft.projectType} onValueChange={(v) => setDraft((d) => ({ ...d, projectType: v }))}><SelectTrigger id="c-type"><SelectValue /></SelectTrigger><SelectContent position="popper" container={portal} className="rounded-xs bg-panel text-paper ring-line font-mono text-sm">{TYPES.map((t) => <SelectItem key={t} value={t} className="rounded-xs focus:bg-track focus:text-paper">{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" value={draft.message} onChange={set("message")} aria-invalid={err?.field === "message" || undefined} /></div>
            <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            {SITE_KEY && <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="dark" data-size="flexible" />}
            <div className="fmt">Format: Inquiry · Destination: Cindy&apos;s inbox</div>
            <button type="submit" className="btn pri">Export (send message)</button>
          </form>
        )}
        <div className="alt">
          <span><a href={`mailto:${email}`}>{email}</a> <CopyEmail email={email} /></span>
          {links.map((l) => <a key={l.name} href={l.url} target="_blank" rel="noopener">{l.name}</a>)}
        </div>
      </div>
    </dialog>
  );
}
