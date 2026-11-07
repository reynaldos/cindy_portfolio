"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProfile, uploadUrl, type SaveResult } from "@/lib/actions/profile";
import { r2Url } from "@/lib/media";

type Values = Record<string, string>;
type Props = { values: Values; projects: { id: string; title: string }[]; uploads: boolean };

const field = "h-11 bg-track border border-line rounded-xs px-3 text-paper text-sm font-mono focus:border-cut focus:outline-none w-full";
const label = "grid gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-dim";

export function ProfileForm({ values, projects, uploads }: Props) {
  const [state, action, pending] = useActionState<SaveResult, FormData>(saveProfile, undefined);
  return (
    <form action={action} className="grid gap-6 max-w-2xl">
      <Section title="About">
        <Text name="name" label="Name" v={values} />
        <Text name="brand" label="Brand" v={values} />
        <Text name="tagline" label="Tagline" v={values} />
        <Area name="bio" label="Bio (blank line between paragraphs)" v={values} rows={8} />
        <Text name="quote" label="Quote (optional)" v={values} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Text name="location" label="Location" v={values} />
          <Text name="studied" label="Studied (optional)" v={values} />
        </div>
        <Area name="tools" label="Tools, one per line" v={values} rows={4} />
        <Area name="clients" label="Clients, one per line (end-credits marquee)" v={values} rows={4} />
      </Section>
      <Section title="Files">
        <Upload kind="portrait" label="Portrait" hint="Landscape 16:9, 1920×1080 or larger. JPG, PNG, or WebP under 10 MB. It fills the monitor on the About page, so keep the face near the middle." accept="image/jpeg,image/png,image/webp" initial={values.portraitKey} enabled={uploads} />
        <Upload kind="resume" label="Resume (PDF)" hint="One PDF under 10 MB." accept="application/pdf" initial={values.resumeKey} enabled={uploads} />
      </Section>
      <Section title="Contact">
        <div className="grid sm:grid-cols-2 gap-3">
          <Text name="contactEmail" label="Email" v={values} type="email" />
          <Text name="replyTime" label="Reply time (optional, e.g. 1–2 days)" v={values} />
        </div>
        <Text name="instagramUrl" label="Instagram URL" v={values} type="url" />
        <Text name="vimeoUrl" label="Vimeo URL" v={values} type="url" />
        <Text name="linkedinUrl" label="LinkedIn URL" v={values} type="url" />
      </Section>
      <Section title="Reel">
        <label className={label}>
          Project played on the home page
          <select name="reelProjectId" defaultValue={values.reelProjectId} className={field}>
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </label>
      </Section>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn pri disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
        {state && ("error" in state ? <p className="font-mono text-xs text-cut-text" role="alert">{state.error}</p> : <p className="font-mono text-xs text-dim" role="status">Saved.</p>)}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 bg-panel border border-line p-4">
      <legend className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim px-1">{title}</legend>
      {children}
    </fieldset>
  );
}

function Text({ name, label: l, v, type = "text" }: { name: string; label: string; v: Values; type?: string }) {
  return <label className={label}>{l}<input name={name} type={type} defaultValue={v[name] ?? ""} className={field} /></label>;
}

function Area({ name, label: l, v, rows }: { name: string; label: string; v: Values; rows: number }) {
  return <label className={label}>{l}<textarea name={name} rows={rows} defaultValue={v[name] ?? ""} className={`${field} h-auto py-2 leading-relaxed`} /></label>;
}

// Uploads go straight to R2; the form only carries the key
function Upload({ kind, label: l, hint, accept, initial, enabled }: { kind: "portrait" | "resume"; label: string; hint: string; accept: string; initial?: string; enabled: boolean }) {
  const [key, setKey] = useState(initial ?? "");
  const [msg, setMsg] = useState("");
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading…");
    const res = await uploadUrl(kind, file.name, file.type, file.size);
    if ("error" in res) return setMsg(res.error);
    const put = await fetch(res.url, { method: "PUT", body: file, headers: { "content-type": file.type } }).catch(() => null);
    if (!put?.ok) return setMsg("Upload failed. Check the R2 keys and bucket CORS.");
    setKey(res.key);
    setMsg("Uploaded. Save to keep it.");
  }
  return (
    <div className="grid gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">{l}</span>
      <p className="font-sans text-xs text-dim -mt-1">{hint}</p>
      {key && (kind === "portrait" ? <Image src={r2Url(key)} alt="" width={192} height={108} unoptimized className="w-48 aspect-video object-cover border border-line" /> : <a href={r2Url(key)} target="_blank" rel="noopener" className="font-mono text-xs underline">{key}</a>)}
      <input type="hidden" name={`${kind}Key`} value={key} />
      <div className="flex items-center gap-3 flex-wrap">
        <label className={`btn ${enabled ? "border-line bg-track hover:border-paper" : "border-line text-dim cursor-not-allowed"} has-focus-visible:border-cut`}>
          {key ? "Replace file" : "Choose file"}
          <input type="file" accept={accept} onChange={onChange} disabled={!enabled} className="sr-only" />
        </label>
        {key && <button type="button" onClick={() => { setKey(""); setMsg("Removed. Save to keep it."); }} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>}
      </div>
      <p className="font-mono text-xs text-dim" aria-live="polite">{enabled ? msg : "Set the R2 keys in .env to upload."}</p>
    </div>
  );
}
