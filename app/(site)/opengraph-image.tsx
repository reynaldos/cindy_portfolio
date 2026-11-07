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
          <div style={{ width: 14, height: 14, background: "#ff3b2f", borderRadius: 7 }} />REC · PROGRAM: CUTS_BY_CINDY_REEL.mp4
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
