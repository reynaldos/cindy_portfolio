import { Monitor } from "@/components/monitor/monitor";
import { Credits } from "@/components/pages/credits";
import { SpotInspector, Spots, type Marker } from "@/components/pages/spots";
import { getProfile, getRecentWork } from "@/lib/data";
import { clipFromProject } from "@/lib/media";

export const metadata = { title: "Recent Work", description: "The latest job, from rough cut to delivery: five spots, the feedback rounds, and the timeline.", alternates: { canonical: "/recent-work" } };

export default async function RecentWork() {
  const [recent, profile] = await Promise.all([getRecentWork(), getProfile()]);
  const spots = recent?.spots ?? [];
  const markers = Array.isArray(recent?.markers) ? (recent.markers as Marker[]) : [];
  return (
    <>
      <div className="page">
        <div className="main">
          <div className="head gut">
            <div className="kick"><span className="dot" style={{ "--c": "var(--color-clip-com)" } as React.CSSProperties} />Recent Work{spots[0]?.productionCo && ` · ${spots[0].productionCo} × ${spots[0].client}`}</div>
            <h1 className="title" tabIndex={-1} data-h1>{recent?.title ?? "Recent Work"}</h1>
            {recent && <p className="lead">{recent.copy}</p>}
          </div>
          <Monitor clips={spots.map(clipFromProject)} mode="clips" />
          <Spots spots={spots} markers={markers} stampValue={recent?.stampValue ?? null} stampText={recent?.stampText ?? null} />
        </div>
        <SpotInspector spots={spots} />
      </div>
      <Credits profile={profile} />
    </>
  );
}
