import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Monitor } from "@/components/monitor/monitor";
import { ClipInspector } from "@/components/pages/clip-inspector";
import { Credits } from "@/components/pages/credits";
import { getCategoryProjects, getProfile, getProject } from "@/lib/data";
import { clipFromProject, r2Url } from "@/lib/media";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, videoLd } from "@/lib/seo";

export const instant = false;

// the poster is the share image; the default brand card stands in when there is none
export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const p = await getProject((await params).slug);
  if (!p) return {};
  const poster = clipFromProject(p).poster;
  return { title: p.subtitle ? `${p.title} · ${p.subtitle}` : p.title, description: p.description, alternates: { canonical: `/projects/${p.category.slug}/${p.slug}` }, openGraph: poster ? { images: [{ url: poster, width: 1280, height: 720 }] } : undefined };
}

// Project detail: stills and full credits for one cut
export default async function Detail({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const [p, cat, profile] = await Promise.all([getProject(slug), getCategoryProjects(category), getProfile()]);
  if (!p || !cat || p.category.slug !== category) notFound();
  const i = cat.projects.findIndex((x) => x.id === p.id), next = cat.projects[i + 1];
  const color = cat.color;
  return (
    <>
      <div className="page wide-insp">
        <div className="main">
          <div className="head gut">
            <div className="kick"><span className="dot" style={{ "--c": color } as React.CSSProperties} /><Link href="/projects" className="lnk">Projects</Link> / <Link href={`/projects/${cat.slug}`} className="lnk">{cat.name}</Link> / {p.title}</div>
            <h1 className="title" tabIndex={-1} data-h1>{p.title}</h1>
          </div>
          <Monitor clips={[clipFromProject(p)]} mode="clips" />
          <div className="rows gut">
            {p.stills.length > 0 && (
              <>
                <div className="kick">Stills · {p.stills.length}</div>
                <div className="stills">{p.stills.map((s) => <span key={s.id} className="still"><Image src={r2Url(s.key)} alt={s.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" /></span>)}</div>
              </>
            )}
            <div className="actions">
              <Link href={`/projects/${cat.slug}`} className="btn sec">Back to {cat.name}</Link>
              {next && <Link href={`/projects/${cat.slug}/${next.slug}`} className="btn sec">Next clip: {next.title}</Link>}
            </div>
          </div>
        </div>
        <aside className="insp" aria-label="Inspector">
          <div className="ptab"><span className="on">Inspector</span><span className="r">Clip · full credits</span></div>
          <div className="insp-b"><ClipInspector p={p} one={cat.one} color={color} i={Math.max(0, i)} n={cat.projects.length} /></div>
        </aside>
      </div>
      <Credits profile={profile} />
      <JsonLd data={[videoLd(p), breadcrumbLd([["Projects", "/projects"], [cat.name, `/projects/${cat.slug}`], [p.title, `/projects/${cat.slug}/${p.slug}`]])]} />
    </>
  );
}
