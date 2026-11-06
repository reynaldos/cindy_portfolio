// Transport and select actions travel as one window event. The frame, menus, and keys send;
// the player (Phase 3) and pages listen. No context, no store.
export type BayAction =
  | "play"
  | "pause"
  | "toggle"
  | "back"
  | "prev"
  | "next"
  | "watch"
  | "mute"
  | "select"
  | "contact";

export function bay(action: BayAction, detail?: unknown) {
  window.dispatchEvent(new CustomEvent("bay", { detail: { action, detail } }));
}

export function onBay(fn: (action: BayAction, detail?: unknown) => void) {
  const h = (e: Event) => {
    const d = (e as CustomEvent<{ action: BayAction; detail?: unknown }>).detail;
    fn(d.action, d.detail);
  };
  window.addEventListener("bay", h);
  return () => window.removeEventListener("bay", h);
}
