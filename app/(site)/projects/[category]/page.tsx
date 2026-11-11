import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Monitor } from "@/components/monitor/monitor";
import { CatChips } from "@/components/pages/chips";
import { ClipInspectorLive, ClipRows } from "@/components/pages/clip-list";
import { Credits } from "@/components/pages/credits";
import { getCategories, getCategoryProjects, getCategorySlug, getProfile } from "@/lib/data";
import { clipFromProject } from "@/lib/media";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, videoLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const cat = await getCategoryProjects((await params).category);
  return cat ? { title: cat.name, description: cat.blurb ?? `${cat.name} cut by Cindy Peralta.`, alternates: { canonical: `/projects/${cat.slug}` } } : {};
}

// the razor cut reveals a finished page, so navigation waits for the data instead of flashing a shell
export const instant = false;

export default async function Category({ params }: PageProps<"/projects/[category]">) {
  const { category } = await params;
  const [cat, categories, profile] = await Promise.all([getCategoryProjects(category), getCategories(), getProfile()]);
  if (!cat) {
    const now = await getCategorySlug(category);
    if (now) permanentRedirect(`/projects/${now}`);
    notFound();
  }
  return (
    <>
      <div className="page">
        <div className="main">
          <div className="head gut cat-head">
            <div className="kick"><span className="dot" style={{ "--c": cat.color } as React.CSSProperties} /><Link href="/projects" className="lnk">Projects</Link> / {cat.name}</div>
            <div className="cat-row"><h1 className="title" tabIndex={-1} data-h1>{cat.name} ( {String(cat.projects.length).padStart(2, "0")} )</h1><CatChips categories={categories} active={cat.slug} /></div>
          </div>
          <Monitor clips={cat.projects.map((p) => clipFromProject(p))} mode="clips" sticky pins />
          <ClipRows category={cat} projects={cat.projects} />
        </div>
        <ClipInspectorLive category={cat} projects={cat.projects} />
      </div>
      <Credits profile={profile} />
      <JsonLd data={[breadcrumbLd([["Projects", "/projects"], [cat.name, `/projects/${cat.slug}`]]), ...cat.projects.map((p) => videoLd({ ...p, category: cat }))]} />
    </>
  );
}
