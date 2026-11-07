import type { MetadataRoute } from "next";
import { SITE } from "@/lib/media";

// Search engines and answer engines are welcome; bulk scrapers and SEO-tool crawlers are not
const BLOCKED = ["Bytespider", "PetalBot", "CCBot", "AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "DataForSeoBot", "ImagesiftBot", "Scrapy", "python-requests"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot", "Applebot-Extended"], allow: "/", disallow: ["/admin", "/api"] },
      { userAgent: BLOCKED, disallow: "/" },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
