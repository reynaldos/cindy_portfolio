// A marker or pin note near an edge moves sideways to stay 8px inside the app frame
export function fitNote(host: HTMLElement) {
  const n = host.querySelector<HTMLElement>(".note"), app = host.closest<HTMLElement>(".app");
  if (!n || !app) return;
  n.style.setProperty("--nx", "0px");
  const r = n.getBoundingClientRect(), a = app.getBoundingClientRect();
  if (!r.width) return;
  n.style.setProperty("--nx", `${r.left < a.left + 8 ? a.left + 8 - r.left : r.right > a.right - 8 ? a.right - 8 - r.right : 0}px`);
}
