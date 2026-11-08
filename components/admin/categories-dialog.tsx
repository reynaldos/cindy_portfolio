"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useId, useRef, useState } from "react";
import { field } from "@/components/admin/fields";
import { CATEGORY_COLOR } from "@/components/bay/const";
import { saveCategories } from "@/lib/actions/projects";

type Cat = { id: string; name: string; slug: string; count: number };

// "Edit categories": rename, and drag the rows up and down to set the order the site shows them in
export function CategoriesDialog({ cats }: { cats: Cat[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState(cats);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) setRows((r) => arrayMove(r, r.findIndex((x) => x.id === active.id), r.findIndex((x) => x.id === over.id)));
  }
  async function save() {
    setSaving(true);
    const res = await saveCategories(rows.map(({ id, name }) => ({ id, name })));
    setSaving(false);
    if ("error" in res) return setMsg(res.error);
    ref.current?.close();
    location.reload();
  }
  function open() { setRows(cats); setMsg(""); ref.current?.showModal(); }
  return (
    <>
      <button type="button" onClick={open} className="font-mono text-[11px] uppercase h-9 px-3 rounded-xs border border-line text-dim hover:text-paper hover:border-paper">Edit categories</button>
      <dialog ref={ref} className="sheet" style={{ width: "min(560px, calc(100% - 32px))" }} aria-labelledby="cats-title" onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}>
        <div className="sheet-t"><span id="cats-title">Bins: Categories</span><button type="button" onClick={() => ref.current?.close()} aria-label="Close">✕</button></div>
        <div className="sheet-b grid gap-4">
          <p className="font-sans text-xs text-dim">Rename a category, or drag the handle to change the order. Top is first on the site. With a keyboard: Tab to a handle, Space, arrows, Space.</p>
          <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <ul className="grid gap-px bg-line border border-line">
                {rows.map((r, i) => <Row key={r.id} row={r} i={i} count={rows.length} onName={(name) => setRows((all) => all.map((x) => (x.id === r.id ? { ...x, name } : x)))} />)}
              </ul>
            </SortableContext>
          </DndContext>
          <div className="flex items-center gap-4">
            <button type="button" onClick={save} disabled={saving} className="btn pri disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => ref.current?.close()} className="font-mono text-xs text-dim hover:text-paper">Cancel</button>
            {msg && <p className="font-mono text-xs text-cut-text" role="alert">{msg}</p>}
          </div>
        </div>
      </dialog>
    </>
  );
}

// row height plus the 1px gap, so a drag stops at the first and last slot
const STEP = 56 + 1;

function Row({ row, i, count, onName }: { row: Cat; i: number; count: number; onName: (name: string) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const t = transform && { ...transform, x: 0, y: Math.max(-i * STEP, Math.min((count - 1 - i) * STEP, transform.y)) };
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(t), transition }} className={`${isDragging ? "z-10 ring-1 ring-paper" : ""} relative flex items-center gap-2 bg-panel px-2 h-14`}>
      <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} aria-label={`Move ${row.name}`} className="h-9 w-9 grid place-items-center text-dim hover:text-paper cursor-grab active:cursor-grabbing touch-none rounded-xs focus-visible:outline-2 focus-visible:outline-cut"><GripVertical size={16} /></button>
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLOR[row.slug] }} aria-hidden="true" />
      <input value={row.name} onChange={(e) => onName(e.target.value)} aria-label="Category name" className={`${field} h-10 flex-1`} />
      <span className="font-mono text-[11px] text-dim shrink-0 w-24 truncate" title={`/projects/${row.slug}`}>/{row.slug}</span>
      <span className="font-mono text-[11px] uppercase text-dim shrink-0">{row.count} {row.count === 1 ? "clip" : "clips"}</span>
    </li>
  );
}
