"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import { CATEGORY_COLOR } from "@/components/bay/const";
import { setOrder } from "@/lib/actions/projects";

type Item = { id: string; title: string; live: boolean };

// A track in a dialog: drag the clips left and right, Save writes that order
export function OrderDialog({ categoryId, categoryName, slug, items }: { categoryId: string; categoryName: string; slug: string; items: Item[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [order, setOrderState] = useState(items);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const color = CATEGORY_COLOR[slug];

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) setOrderState((o) => arrayMove(o, o.findIndex((x) => x.id === active.id), o.findIndex((x) => x.id === over.id)));
  }
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
          <div className="bg-ink border border-line p-3 overflow-x-auto overflow-y-hidden overscroll-x-contain">
            <div className="font-mono text-[10px] text-dim mb-2 flex justify-between"><span>V1 · {categoryName}</span><span>{order.length} clips</span></div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={order.map((x) => x.id)} strategy={horizontalListSortingStrategy}>
                <ol className="flex gap-1 min-h-16">
                  {order.map((item, i) => <Clip key={item.id} item={item} i={i} count={order.length} color={color} />)}
                </ol>
              </SortableContext>
            </DndContext>
          </div>
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

// card width plus the gap, so a drag can be clamped to the first and last slot
const STEP = 160 + 4;

function Clip({ item, i, count, color }: { item: Item; i: number; count: number; color: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  // the clip only moves along the track, and never past either end of it
  const t = transform && { ...transform, y: 0, x: Math.max(-i * STEP, Math.min((count - 1 - i) * STEP, transform.x)) };
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(t), transition, "--c": color } as React.CSSProperties} className={`${isDragging ? "z-10 opacity-80 ring-1 ring-paper" : ""} shrink-0 w-40 h-16 bg-track border-l-4 border-(--c) rounded-xs px-2 py-1.5 cursor-grab active:cursor-grabbing select-none touch-none focus-visible:outline-2 focus-visible:outline-cut`} {...attributes} {...listeners}>
      <div className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")} · {item.live ? "LIVE" : "DRAFT"}</div>
      <div className="font-sans text-sm leading-tight line-clamp-2">{item.title}</div>
    </li>
  );
}
