"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { field } from "@/components/admin/fields";
import { saveCategories } from "@/lib/actions/projects";
import { slugify } from "@/lib/utils";

type Cat = { id: string; name: string; color: string; count: number };

// the shared field is full width; in a row the inputs share the line instead
const input = field.replace(" w-full", "");

// "Edit categories": rename, pick a colour, add or delete, and drag the rows up and down to set the order the site shows them in
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
    const res = await saveCategories(rows.map(({ id, name, color }) => ({ id, name, color })));
    setSaving(false);
    if ("error" in res) return setMsg(res.error);
    ref.current?.close();
    location.reload();
  }
  function open() { setRows(cats); setMsg(""); ref.current?.showModal(); }
  const add = () => setRows((r) => [...r, { id: `new-${Date.now()}`, name: "", color: "#f28c38", count: 0 }]);
  return (
    <>
      <button type="button" onClick={open} className="font-mono text-[11px] uppercase h-9 px-3 rounded-xs border border-line text-dim hover:text-paper hover:border-paper">Edit categories</button>
      <dialog ref={ref} className="sheet" style={{ width: "min(640px, calc(100% - 32px))" }} aria-labelledby="cats-title" onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}>
        <div className="sheet-t"><span id="cats-title">Bins: Categories</span><button type="button" onClick={() => ref.current?.close()} aria-label="Close">✕</button></div>
        <div className="sheet-b grid gap-4">
          <p className="font-sans text-xs text-dim">Rename a category and its URL follows; old links still work. Click the dot to change the colour, drag the handle to change the order. Top is first on the site. A category can be deleted once it has no clips.</p>
          <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <ul className="grid gap-px bg-line border border-line">
                {rows.map((r, i) => <Row key={r.id} row={r} i={i} count={rows.length} onChange={(patch) => setRows((all) => all.map((x) => (x.id === r.id ? { ...x, ...patch } : x)))} onDelete={() => setRows((all) => all.filter((x) => x.id !== r.id))} />)}
              </ul>
            </SortableContext>
          </DndContext>
          <div className="flex items-center gap-4">
            <button type="button" onClick={save} disabled={saving} className="btn pri disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={() => ref.current?.close()} className="font-mono text-xs text-dim hover:text-paper">Cancel</button>
            {msg && <p className="font-mono text-xs text-cut-text" role="alert">{msg}</p>}
            <button type="button" onClick={add} className="ml-auto font-mono text-xs text-dim hover:text-paper underline">Add category</button>
          </div>
        </div>
      </dialog>
    </>
  );
}

// row height plus the 1px gap, so a drag stops at the first and last slot
const STEP = 56 + 1;

function Row({ row, i, count, onChange, onDelete }: { row: Cat; i: number; count: number; onChange: (patch: Partial<Cat>) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const t = transform && { ...transform, x: 0, y: Math.max(-i * STEP, Math.min((count - 1 - i) * STEP, transform.y)) };
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(t), transition }} className={`${isDragging ? "z-10 ring-1 ring-paper" : ""} relative flex items-center gap-2 bg-panel px-2 h-14`}>
      <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} aria-label={`Move ${row.name}`} className="h-9 w-9 grid place-items-center text-dim hover:text-paper cursor-grab active:cursor-grabbing touch-none rounded-xs focus-visible:outline-2 focus-visible:outline-cut"><GripVertical size={16} /></button>
      <label className="relative h-9 w-9 grid place-items-center shrink-0 cursor-pointer rounded-xs hover:bg-track has-focus-visible:outline-2 has-focus-visible:outline-cut" title="Colour">
        <span className="h-3.5 w-3.5 rounded-full" style={{ background: row.color }} aria-hidden="true" />
        <input type="color" value={row.color} onChange={(e) => onChange({ color: e.target.value })} aria-label={`${row.name} colour`} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
      <input value={row.name} onChange={(e) => onChange({ name: e.target.value })} aria-label="Category name" placeholder="Name" autoFocus={!row.name} className={`${input} h-10 flex-1 min-w-0`} />
      <span className="font-mono text-[11px] text-dim shrink-0 w-28 truncate" title={`/projects/${slugify(row.name)}`}>/{slugify(row.name)}</span>
      <span className="font-mono text-[11px] uppercase text-dim shrink-0 w-14 text-right">{row.count} {row.count === 1 ? "clip" : "clips"}</span>
      <button type="button" onClick={onDelete} disabled={row.count > 0} title={row.count > 0 ? "Move or delete its clips first" : "Delete"} aria-label={`Delete ${row.name || "category"}`} className="h-9 w-9 grid place-items-center text-dim hover:text-cut-text disabled:opacity-30 disabled:hover:text-dim rounded-xs focus-visible:outline-2 focus-visible:outline-cut"><Trash2 size={14} /></button>
    </li>
  );
}
