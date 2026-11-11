import { Monitor } from "@/components/monitor/monitor";
import { Credits } from "@/components/pages/credits";
import { ContactButton } from "@/components/pages/ui";
import { getProfile } from "@/lib/data";
import { r2Url } from "@/lib/media";

export const metadata = { title: "About", description: "Who Cindy Peralta is, what she cuts with, and where she works." };

// a two-letter code for each tool, like a track tag
const code = (t: string) => t.replace(/^Adobe\s+/, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default async function About() {
  const profile = await getProfile();
  if (!profile) return null;
  const first = profile.name.split(" ")[0];
  return (
    <>
      <div className="page">
        <div className="main">
          <Monitor still={{ src: profile.portraitKey ? r2Url(profile.portraitKey) : null, alt: profile.portraitKey ? `Portrait of ${profile.name}` : "Portrait coming soon", file: `${first.toUpperCase()}_PORTRAIT.tif`, fmt: "still" }} clips={[]} mode="reel" />
          <div className="rows gut prose">
            <h1 className="title" tabIndex={-1} data-h1>{profile.greeting ?? `Hi, I'm ${first}.`}</h1>
            {profile.bio.split(/\r?\n(?:[ \t]*\r?\n)+/).map((para, i) => <p key={i}>{para}</p>)}
            {profile.quote && <p className="quote">&ldquo;{profile.quote}&rdquo;</p>}
          </div>
        </div>
        <aside className="insp" aria-label="Inspector">
          <div className="ptab"><span className="on">Inspector</span><span className="r">Still</span></div>
          <div className="insp-b">
            <div className="kick">Clip info · {first.toUpperCase()}_PORTRAIT.tif</div>
            <h2 className="h2">{profile.name}</h2>
            <dl className="meta">
              <dt>Role</dt><dd>Video Editor</dd>
              <dt>LOC</dt><dd>{profile.location}</dd>
              {profile.studied && <><dt>Studied</dt><dd>{profile.studied}</dd></>}
            </dl>
            <div className="kick">Tools</div>
            <div className="tools">{profile.tools.map((t) => <div key={t} className="tool"><b>{code(t)}</b>{t}</div>)}</div>
            <div className="actions"><ContactButton>Start a project</ContactButton></div>
          </div>
        </aside>
      </div>
      <Credits profile={profile} />
    </>
  );
}
