"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { useId } from "react";

export type TrackItem = { id: string; title: string; live: boolean; color: string; poster?: string | null };

// card width plus the gap, so a drag can be clamped to the first and last slot
const STEP = 160 + 4;

// A video track: drag the clips left and right. Left is first.
export function Track({ name, items, onChange, onRemove }: { name: string; items: TrackItem[]; onChange: (items: TrackItem[]) => void; onRemove?: (id: string) => void }) {
  // a stable id: dnd-kit's own counter differs between the server and the browser
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) onChange(arrayMove(items, items.findIndex((x) => x.id === active.id), items.findIndex((x) => x.id === over.id)));
  }
  return (
    <div className="bg-ink border border-line p-3 overflow-x-auto overflow-y-hidden overscroll-x-contain">
      <div className="font-mono text-[10px] text-dim mb-2 flex justify-between"><span>V1 · {name}</span><span>{items.length} clips</span></div>
      <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={horizontalListSortingStrategy}>
          <ol className="flex gap-1 min-h-32">
            {items.length === 0 && <li className="font-mono text-xs text-dim self-center px-2">Empty track.</li>}
            {items.map((item, i) => <Clip key={item.id} item={item} i={i} count={items.length} onRemove={onRemove} />)}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function Clip({ item, i, count, onRemove }: { item: TrackItem; i: number; count: number; onRemove?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  // the clip only moves along the track, and never past either end of it
  const t = transform && { ...transform, y: 0, x: Math.max(-i * STEP, Math.min((count - 1 - i) * STEP, transform.x)) };
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(t), transition, "--c": item.color } as React.CSSProperties} className={`${isDragging ? "z-10 opacity-80 ring-1 ring-paper" : ""} relative shrink-0 w-40 bg-track border-t-4 border-(--c) rounded-xs select-none overflow-hidden`}>
      <div className="cursor-grab active:cursor-grabbing touch-none focus-visible:outline-2 focus-visible:outline-cut rounded-xs" {...attributes} {...listeners}>
        <span className="relative block w-full aspect-video bg-ink">{item.poster && <Image src={item.poster} alt="" fill sizes="160px" className="object-cover pointer-events-none" draggable={false} />}</span>
        <div className="px-2 py-1.5">
        <div className="font-mono text-[11px] text-dim">{String(i + 1).padStart(2, "0")} · {item.live ? "LIVE" : "DRAFT"}</div>
        <div className="font-sans text-sm leading-tight line-clamp-2 pr-4">{item.title}</div>
        </div>
      </div>
      {onRemove && <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.title}`} className="absolute top-1 right-1 h-6 w-6 grid place-items-center font-mono text-xs text-paper bg-ink/70 rounded-xs hover:bg-ink">✕</button>}
    </li>
  );
}
