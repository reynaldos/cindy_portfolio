import type { Category, Profile, Project } from "@/lib/generated/prisma/client";
import { clipFromProject, SITE } from "@/lib/media";

// Structured data for search engines and answer engines. Every page gets its own blocks.
const iso = (sec: number) => `PT${Math.floor(sec / 60)}M${Math.round(sec % 60)}S`;

type Cats = Pick<Category, "name" | "one">[];

// "commercials, music videos, short films, and trailers", from the live category names
export const workList = (cats: Cats) => (cats.length ? new Intl.ListFormat("en", { type: "conjunction" }).format(cats.map((c) => c.name.toLowerCase())) : "video");
export const workKeywords = (cats: Cats) => cats.map((c) => `${c.one.toLowerCase()} editor`);

export function personLd(p: Profile, cats: Cats) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#cindy`,
    name: p.name,
    jobTitle: "Video Editor",
    description: p.tagline,
    url: SITE,
    email: p.contactEmail,
    address: { "@type": "PostalAddress", addressLocality: p.location.split(",")[0].trim(), addressRegion: "CA", addressCountry: "US" },
    knowsAbout: ["Video editing", ...cats.map((c) => `${c.one} editing`), ...p.tools],
    ...(p.studied ? { alumniOf: p.studied } : {}),
    sameAs: [p.instagramUrl, p.youtubeUrl, p.linkedinUrl].filter(Boolean),
  };
}

export function serviceLd(p: Profile, cats: Cats) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE}/#service`,
    name: p.brand,
    description: `Freelance video editing in ${p.location}: ${workList(cats)}.`,
    url: SITE,
    email: p.contactEmail,
    areaServed: ["Los Angeles", "United States", "Remote"],
    serviceType: "Video editing",
    founder: { "@id": `${SITE}/#cindy` },
  };
}

export function siteLd(p: Profile) {
  return { "@context": "https://schema.org", "@type": "WebSite", name: p.brand, url: SITE, author: { "@id": `${SITE}/#cindy` } };
}

export function videoLd(p: Project & { category: Category }) {
  const c = clipFromProject(p);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: c.title,
    description: p.description,
    thumbnailUrl: c.poster ? [c.poster] : undefined,
    uploadDate: p.createdAt.toISOString(),
    duration: p.durationSec ? iso(p.durationSec) : undefined,
    contentUrl: c.src ?? undefined,
    url: `${SITE}/projects/${p.category.slug}/${p.slug}`,
    genre: p.category.one,
    editor: { "@id": `${SITE}/#cindy` },
    ...(p.director ? { director: { "@type": "Person", name: p.director } } : {}),
    ...(p.productionCo ? { productionCompany: { "@type": "Organization", name: p.productionCo } } : {}),
  };
}

export function breadcrumbLd(trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${path}` })),
  };
}
