"use client";

import { useRef, useState } from "react";
import { Track, type TrackItem } from "@/components/admin/track";
import { setOrder } from "@/lib/actions/projects";

// "Set order" for one category: the track in a dialog, Save writes that order
export function OrderDialog({ categoryId, categoryName, slug, items }: { categoryId: string; categoryName: string; slug: string; items: TrackItem[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [order, setOrderState] = useState(items);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await setOrder(categoryId, order.map((x) => x.id));
    setSaving(false);
    if ("error" in res) return setMsg(res.error);
    ref.current?.close();
    location.reload();
  }
  function open() {
    setOrderState(items);
    setMsg("");
    ref.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={open} disabled={items.length < 2} className="font-mono text-[11px] uppercase h-9 px-3 rounded-xs border border-line text-dim hover:text-paper hover:border-paper disabled:opacity-30">Set order</button>
      <dialog ref={ref} className="sheet" style={{ width: "min(960px, calc(100% - 32px))" }} aria-labelledby={`order-${slug}`}>
        <div className="sheet-t"><span id={`order-${slug}`}>Sequence: {categoryName}</span><button type="button" onClick={() => ref.current?.close()} aria-label="Close">✕</button></div>
        <div className="sheet-b grid gap-4">
          <p className="font-sans text-xs text-dim">Drag the clips along the track. Left is first. With a keyboard: Tab to a clip, Space to pick it up, arrows to move, Space to drop.</p>
          <Track name={categoryName} items={order} onChange={setOrderState} />
          <div className="flex items-center gap-4">
            <button type="button" onClick={save} disabled={saving} className="btn pri disabled:opacity-60">{saving ? "Saving…" : "Save order"}</button>
            <button type="button" onClick={() => ref.current?.close()} className="font-mono text-xs text-dim hover:text-paper">Cancel</button>
            {msg && <p className="font-mono text-xs text-cut-text" role="alert">{msg}</p>}
          </div>
        </div>
      </dialog>
    </>
  );
}
