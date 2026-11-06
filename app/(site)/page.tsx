import { Play } from "lucide-react";
import { Monitor } from "@/components/monitor/monitor";
import { PlayReel } from "@/components/monitor/play-reel";
import { getProfile, getReel } from "@/lib/data";
import { clipFromProject } from "@/lib/media";

// Home. Phase 4 adds the inspector and end credits.
export default async function Home() {
  const [profile, reel] = await Promise.all([getProfile(), getReel()]);
  return (
    <div className="grid">
      <div className="main">
        <Monitor clips={reel ? [clipFromProject(reel)] : []} mode="reel">
          <div className="hero">
            <h1 tabIndex={-1} data-h1>{profile?.brand ?? "Cuts By Cindy"}</h1>
            <p>{profile?.tagline ?? "Video Editor."}</p>
            {reel?.streamUid && <PlayReel><Play aria-hidden="true" />Play reel</PlayReel>}
          </div>
        </Monitor>
        <div style={{ height: "60vh" }} aria-hidden="true" />
      </div>
    </div>
  );
}
