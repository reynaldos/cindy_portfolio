import Link from "next/link";
import { Play } from "lucide-react";
import { Monitor } from "@/components/monitor/monitor";
import { PlayReel } from "@/components/monitor/play-reel";
import { Credits } from "@/components/pages/credits";
import { Flap } from "@/components/pages/flap";
import { ContactButton } from "@/components/pages/ui";
import { getCategories, getProfile, getRecentWork, getReel } from "@/lib/data";
import { clipFromProject } from "@/lib/media";

export default async function Home() {
  const [profile, reel, categories, recent] = await Promise.all([getProfile(), getReel(), getCategories(), getRecentWork()]);
  const total = categories.reduce((n, c) => n + c.projects.length, 0);
  const latest = recent?.spots[0];
  return (
    <>
      <div className="page">
        <div className="main">
          <Monitor clips={reel ? [clipFromProject(reel)] : []} mode="reel">
            <div className="hero">
              <h1 tabIndex={-1} data-h1>{profile?.brand ?? "Cuts By Cindy"}</h1>
              <p>{profile?.tagline ?? "Video Editor."}</p>
              {reel?.streamUid && <PlayReel><Play aria-hidden="true" />Play reel</PlayReel>}
            </div>
            {latest?.client && <Flap text={latest.client} />}
          </Monitor>
        </div>
        <aside className="insp" aria-label="Inspector">
          <div className="ptab"><span className="on">Inspector</span><span className="r">Sequence</span></div>
          <div className="insp-b">
            <div className="kick">Sequence · CBC_REEL</div>
            <h2 className="h2">Hi, I&apos;m {profile?.name.split(" ")[0] ?? "Cindy"}.</h2>
            <dl className="meta">
              <dt>Role</dt><dd>Video Editor</dd>
              <dt>Based</dt><dd>{profile?.location}</dd>
              {latest && <><dt>Latest</dt><dd>{[latest.productionCo, latest.client].filter(Boolean).join(" × ")}</dd></>}
              <dt>Work</dt><dd>{total} cuts in {categories.length} categories</dd>
              <dt>Tools</dt><dd>{profile?.tools.join(", ")}</dd>
            </dl>
            <div className="actions"><Link href="/projects" className="btn pri">See the work</Link><ContactButton className="btn sec">Contact</ContactButton></div>
          </div>
        </aside>
      </div>
      <Credits profile={profile} />
    </>
  );
}
