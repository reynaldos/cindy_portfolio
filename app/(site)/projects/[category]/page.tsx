import { notFound } from "next/navigation";
import { CATEGORY_COLOR } from "@/components/bay/const";
import { getCategoryProjects } from "@/lib/data";

// the four categories are fixed, so the build needs no database for them
export function generateStaticParams() {
  return Object.keys(CATEGORY_COLOR).map((category) => ({ category }));
}

// Placeholder until Phase 4 builds the category page
export default async function Category({ params }: PageProps<"/projects/[category]">) {
  const { category } = await params;
  const cat = await getCategoryProjects(category);
  if (!cat) notFound();
  return (
    <div className="gut py-4">
      <h1 className="font-display text-5xl font-semibold" tabIndex={-1} data-h1>{cat.name} ( {String(cat.projects.length).padStart(2, "0")} )</h1>
      <div style={{ height: "120vh" }} aria-hidden="true" />
    </div>
  );
}
