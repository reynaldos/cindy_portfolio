// a feedback pin: label, note, and where it sits (0..1 of the sequence or the clip)
export type Marker = { label: string; note: string; at: number };

export const markersOf = (v: unknown): Marker[] => (Array.isArray(v) ? (v as Marker[]) : []);
