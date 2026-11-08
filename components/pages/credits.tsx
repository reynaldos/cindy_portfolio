import { Fragment } from "react";
import { Play } from "lucide-react";
import { ContactButton, CopyEmail, LaClock, Marquee } from "@/components/pages/ui";
import { r2Url } from "@/lib/media";
import type { Profile } from "@/lib/generated/prisma/client";

// End credits close every page
export function Credits({ profile }: { profile: Profile | null }) {
  if (!profile) return null;
  return (
    <footer className="credits gut" aria-label="End credits">
      <dl className="lines">
        <dt>Edited by</dt><dd>{profile.name}</dd>
        <dt>Contact</dt><dd><a href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a> <CopyEmail email={profile.contactEmail} /></dd>
        {([["Instagram", profile.instagramUrl], ["YouTube", profile.youtubeUrl], ["LinkedIn", profile.linkedinUrl]] as const).map(([name, url]) => url && <Fragment key={name}><dt>{name}</dt><dd><a href={url} target="_blank" rel="noopener">{url.replace(/^https?:\/\/(www\.)?/, "")}</a></dd></Fragment>)}
        {profile.resumeKey && <><dt>Resume</dt><dd><a href={r2Url(profile.resumeKey)} target="_blank" rel="noopener">Resume (PDF)</a></dd></>}
        <dt>Based in</dt><dd>{profile.location} · <LaClock /></dd>
      </dl>
      {profile.clients.length > 0 && <Marquee items={profile.clients} />}
      <p className="wrap">THAT&apos;S A WRAP.</p>
      <div className="cta"><ContactButton><Play aria-hidden="true" />Start a project</ContactButton></div>
    </footer>
  );
}
