import { z } from "zod";

// the pins field of a form: a JSON list of { label, note, at }
export const MarkersField = z.string().transform((v) => JSON.parse(v || "[]")).pipe(z.array(z.object({ label: z.string().trim().min(1), note: z.string().trim().min(1), at: z.number().min(0).max(1) })));
