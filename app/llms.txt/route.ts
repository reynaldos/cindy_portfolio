import { getCategories, getProfile } from "@/lib/data";
import { SITE } from "@/lib/media";

// A plain-text summary for answer engines, in the llms.txt convention
export async function GET() {
  const [p, cats] = await Promise.all([getProfile(), getCategories()]);
  if (!p) return new Response("", { status: 404 });
  const lines = [
    `# ${p.brand}`,
    "",
    `> ${p.name} is a video editor in ${p.location}. ${p.tagline}`,
    "",
    `Work: commercials, music videos, short films, and trailers. Tools: ${p.tools.join(", ")}.`,
    `Contact: ${p.contactEmail}${p.replyTime ? ` (replies ${p.replyTime})` : ""}. Site: ${SITE}`,
    "",
    "## Pages",
    `- [Reel and overview](${SITE}/)`,
    `- [About](${SITE}/about): bio, tools, location`,
    `- [Recent Work](${SITE}/recent-work): the latest job, from rough cut to delivery`,
    ...cats.map((c) => `- [${c.name}](${SITE}/projects/${c.slug}): ${c.projects.length} ${c.projects.length === 1 ? "clip" : "clips"}`),
    "",
    "## Projects",
    ...cats.flatMap((c) => c.projects.map((pr) => `- [${pr.title}${pr.subtitle ? ` · ${pr.subtitle}` : ""}](${SITE}/projects/${c.slug}/${pr.slug}): ${c.one}${pr.client ? ` for ${pr.client}` : ""}${pr.year ? `, ${pr.year}` : ""}. ${pr.description}`)),
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
