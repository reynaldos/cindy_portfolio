import Link from "next/link";

type Cat = { slug: string; name: string; color: string; projects: { id: string }[] };

// the four category chips; the current one fills with its color
export function CatChips({ categories, active }: { categories: Cat[]; active?: string }) {
  return (
    <div className="chips" role="group" aria-label="Categories">
      {categories.map((c) => (
        <Link key={c.slug} href={`/projects/${c.slug}`} className="chip" style={{ "--c": c.color } as React.CSSProperties} aria-current={c.slug === active ? "page" : undefined}>
          <span className="dot" style={{ "--c": c.color } as React.CSSProperties} />{c.name} ( {String(c.projects.length).padStart(2, "0")} )
        </Link>
      ))}
    </div>
  );
}
