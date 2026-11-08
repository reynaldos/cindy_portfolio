export const FPS = 24;
export const SEQ = 60; // the sequence is sixty seconds long; the playhead follows page scroll

export const PAGES = [
  ["/", "Home"],
  ["/projects", "Projects"],
  ["/recent-work", "Recent Work"],
  ["/about", "About"],
] as const;

// the four category routes; their names and colours live in the database, these are the defaults
export const CATEGORY_DEFAULTS: Record<string, { name: string; color: string }> = {
  "short-films": { name: "Short Films", color: "#7bc67e" },
  commercials: { name: "Commercials", color: "#f28c38" },
  "music-videos": { name: "Music Videos", color: "#b48cf2" },
  trailers: { name: "Trailers", color: "#5aa9f2" },
};
export const CATEGORY_SLUGS = Object.keys(CATEGORY_DEFAULTS);

const pad = (n: number) => String(n).padStart(2, "0");

// seconds → HH:MM:SS:FF
export function tc(s: number, fps = FPS) {
  const fr = Math.max(0, Math.round(s * fps)), sec = Math.floor(fr / fps);
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}:${pad(fr % fps)}`;
}

// which workspace tab a path belongs to
export function pageOf(pathname: string) {
  return pathname.startsWith("/projects") ? "/projects" : pathname.startsWith("/recent-work") ? "/recent-work" : pathname.startsWith("/about") ? "/about" : pathname === "/" ? "/" : null;
}
