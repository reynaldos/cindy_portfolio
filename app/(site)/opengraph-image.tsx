import { ImageResponse } from "next/og";

export const alt = "Cuts By Cindy — Video Editor, Los Angeles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// the share card: a program monitor with the title-safe corners and a timecode burn-in.
// The renderer takes only TTF/OTF/WOFF, so the brand woff2 stays out and its built-in sans stands in.
export default function Image() {
  const corner = (x: "left" | "right", y: "top" | "bottom") => <div style={{ position: "absolute", [x]: 48, [y]: 48, width: 28, height: 28, [`border${y === "top" ? "Top" : "Bottom"}`]: "2px solid #8a8a93", [`border${x === "left" ? "Left" : "Right"}`]: "2px solid #8a8a93" }} />;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0e0e10", color: "#f4f1ea", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 110px", position: "relative" }}>
        {corner("left", "top")}{corner("right", "top")}{corner("left", "bottom")}{corner("right", "bottom")}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#8a8a93", letterSpacing: 2 }}>
          <svg width="28" height="28" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#ff3b2f" /><path d="M38 0 L50 0 L26 64 L14 64 Z" fill="#1c1c1f" /><path d="M20 12 a7 7 0 1 0 0 14 M50 38 a7 7 0 1 0 0 14" fill="none" stroke="#1c1c1f" strokeWidth="3.2" strokeLinecap="round" /></svg>REC · PROGRAM: CUTS_BY_CINDY_REEL.mp4
        </div>
        <div style={{ fontSize: 124, fontWeight: 700, lineHeight: 1, marginTop: 24, letterSpacing: -4 }}>Cuts By Cindy</div>
        <div style={{ fontSize: 40, marginTop: 20, color: "#c9c5bc" }}>Video Editor · Los Angeles</div>
        <div style={{ position: "absolute", left: 110, right: 110, bottom: 60, display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8a8a93", letterSpacing: 2 }}>
          <span>COMMERCIALS · MUSIC VIDEOS · SHORT FILMS · TRAILERS</span><span>00:00:24:00</span>
        </div>
      </div>
    ),
    size,
  );
}
