import { useSyncExternalStore } from "react";

// the Los Angeles clock, read every 15 s; the server renders the placeholder
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...o, timeZone: "America/Los_Angeles" }).format(new Date());
const sub = (cb: () => void) => { const id = setInterval(cb, 15000); return () => clearInterval(id); };

export const useClock = () => useSyncExternalStore(sub, () => `${fmt({ weekday: "short", month: "short", day: "numeric" }).replace(",", "")}|${fmt({ hour: "numeric", minute: "2-digit" })}`, () => "|--:--").split("|") as [string, string];
