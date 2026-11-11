import { Monitor } from "@/components/monitor/monitor";
import { Credits } from "@/components/pages/credits";
import { TrackInspector, Tracks } from "@/components/pages/tracks";
import { getCategories, getProfile } from "@/lib/data";
import { clipFromProject, type Clip } from "@/lib/media";

export const metadata = { title: "Projects", description: "Commercials, music videos, short films, and trailers cut by Cindy Peralta.", alternates: { canonical: "/projects" } };

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

export default async function Projects() {
  const [categories, profile] = await Promise.all([getCategories(), getProfile()]);
  const total = categories.reduce((n, c) => n + c.projects.length, 0);
  // the monitor previews each track's first clip; an empty track shows its name as a placeholder
  const clips: Clip[] = categories.map((c) => c.projects[0] ? clipFromProject(c.projects[0]) : { id: c.slug, title: c.name, file: `${c.slug.toUpperCase().replace(/-/g, "_")}.mp4`, src: null, poster: null, durationSec: null, fps: null, width: null, height: null, peaks: null, captions: null });
  return (
    <>
      <div className="page">
        <div className="main">
          <div className="head gut"><div className="kick">Projects · {total} cuts</div><h1 className="title" tabIndex={-1} data-h1>{WORDS[categories.length] ?? categories.length} tracks. Pick one.</h1></div>
          <Monitor clips={clips} mode="reel" compact />
          <Tracks categories={categories} />
        </div>
        <TrackInspector categories={categories} />
      </div>
      <Credits profile={profile} />
    </>
  );
}
