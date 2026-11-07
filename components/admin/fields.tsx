"use client";

import { useState } from "react";
import { Select as Root, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadUrl, type UploadKind } from "@/lib/actions/upload";

// Plain form parts shared by every admin form
export type Values = Record<string, string>;

export const field = "h-12 bg-track border border-line rounded-xs px-3 text-paper text-sm font-mono focus:border-cut focus:outline-none w-full";
export const label = "grid gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-dim";
export const kick = "font-mono text-[11px] uppercase tracking-[0.08em] text-dim";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 bg-panel border border-line p-4">
      <legend className={`${kick} px-1`}>{title}</legend>
      {children}
    </fieldset>
  );
}

export function Text({ name, label: l, v, type = "text", required }: { name: string; label: string; v: Values; type?: string; required?: boolean }) {
  return <label className={label}>{l}<input name={name} type={type} defaultValue={v[name] ?? ""} required={required} className={field} /></label>;
}

export function Area({ name, label: l, v, rows }: { name: string; label: string; v: Values; rows: number }) {
  return <label className={label}>{l}<textarea name={name} rows={rows} defaultValue={v[name] ?? ""} className={`${field} h-auto py-2 leading-relaxed`} /></label>;
}

// Radix refuses an empty item value, so "" rides under a stand-in and goes back to "" in the hidden input
const NONE = "__none";
export const selectTrigger = `${field} rounded-xs justify-between hover:bg-track focus-visible:ring-0 focus-visible:border-cut data-[size=default]:h-12 [&_svg]:text-dim`;
export const selectContent = "rounded-xs bg-panel text-paper ring-line font-mono text-sm";
export const selectItem = "rounded-xs focus:bg-track focus:text-paper";
export function Select({ name, label: l, v, options, onChange }: { name: string; label: string; v: Values; options: [string, string][]; onChange?: (value: string) => void }) {
  const [value, setValue] = useState(v[name] || NONE);
  return (
    <label className={label}>
      {l}
      <input type="hidden" name={name} value={value === NONE ? "" : value} />
      <Root value={value} onValueChange={(val) => { setValue(val); onChange?.(val === NONE ? "" : val); }}>
        <SelectTrigger className={selectTrigger}><SelectValue /></SelectTrigger>
        <SelectContent position="popper" className={selectContent}>
          {options.map(([val, text]) => <SelectItem key={val} value={val || NONE} className={selectItem}>{text}</SelectItem>)}
        </SelectContent>
      </Root>
    </label>
  );
}

export function Status({ state }: { state: { error: string } | { ok: true } | undefined }) {
  if (!state) return null;
  return "error" in state ? <p className="font-mono text-xs text-cut-text" role="alert">{state.error}</p> : <p className="font-mono text-xs text-dim" role="status">Saved.</p>;
}

// Sends one file straight to R2 and hands back its key
export async function putFile(kind: UploadKind, file: File) {
  const res = await uploadUrl(kind, file.name, file.type, file.size);
  if ("error" in res) return res;
  const put = await fetch(res.url, { method: "PUT", body: file, headers: { "content-type": file.type } }).catch(() => null);
  return put?.ok ? { key: res.key } : { error: "Upload failed. Check the R2 keys and bucket CORS." };
}

export function FileButton({ children, accept, onPick, disabled, multiple }: { children: React.ReactNode; accept: string; onPick: (files: File[]) => void; disabled?: boolean; multiple?: boolean }) {
  return (
    <label className={`btn ${disabled ? "border-line text-dim cursor-not-allowed" : "border-line bg-track hover:border-paper"} has-focus-visible:border-cut`}>
      {children}
      <input type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={(e) => { onPick(Array.from(e.target.files ?? [])); e.target.value = ""; }} className="sr-only" />
    </label>
  );
}

// One file field: picks, uploads, and keeps the R2 key in a hidden input
export function Upload({ name, kind, label: l, hint, accept, initial, enabled, preview }: { name: string; kind: UploadKind; label: string; hint: string; accept: string; initial?: string; enabled: boolean; preview?: (key: string) => React.ReactNode }) {
  const [key, setKey] = useState(initial ?? "");
  const [msg, setMsg] = useState("");
  async function onPick([file]: File[]) {
    if (!file) return;
    setMsg("Uploading…");
    const res = await putFile(kind, file);
    if ("error" in res) return setMsg(res.error);
    setKey(res.key);
    setMsg("Uploaded. Save to keep it.");
  }
  return (
    <div className="grid gap-2">
      <span className={kick}>{l}</span>
      <p className="font-sans text-xs text-dim -mt-1">{hint}</p>
      {key && preview?.(key)}
      <input type="hidden" name={name} value={key} />
      <div className="flex items-center gap-3 flex-wrap">
        <FileButton accept={accept} onPick={onPick} disabled={!enabled}>{key ? "Replace file" : "Choose file"}</FileButton>
        {key && <button type="button" onClick={() => { setKey(""); setMsg("Removed. Save to keep it."); }} className="font-mono text-xs text-dim hover:text-paper underline">Remove</button>}
      </div>
      <p className="font-mono text-xs text-dim" aria-live="polite">{enabled ? msg : "Set the R2 keys in .env to upload."}</p>
    </div>
  );
}
