import Link from "next/link";
import { CatChips } from "@/components/pages/chips";
import { getCategories } from "@/lib/data";

// Media Offline: the 404 in the bay's own words
export default async function NotFound() {
  const categories = await getCategories();
  return (
    <div className="page">
      <div className="main">
        <div className="mon-wrap gut"><div className="mon-box">
          <div className="ptab"><span className="on">Program: UNKNOWN_CLIP.mov</span></div>
          <div className="monitor" data-status="error"><div className="offline"><b>MEDIA OFFLINE</b><span>This clip was moved or deleted.</span></div><div className="burn"><span>UNKNOWN_CLIP.mov</span><span><span className="mt">SRC </span>--:--:--:--</span></div></div>
        </div></div>
        <div className="rows gut">
          <h1 className="title" tabIndex={-1} data-h1>Page not found</h1>
          <div className="actions"><Link href="/" className="btn pri">Relink to home</Link></div>
          <p className="small dimt">Go to the home page, or open a category:</p>
          <CatChips categories={categories} />
        </div>
      </div>
      <aside className="insp" aria-label="Inspector">
        <div className="ptab"><span className="on">Inspector</span><span className="r">Error</span></div>
        <div className="insp-b"><div className="kick">Error</div><h2 className="h2">Media offline</h2><p>The link you followed points to a clip that is not here anymore.</p></div>
      </aside>
    </div>
  );
}
