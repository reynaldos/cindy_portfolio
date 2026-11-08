export { cn } from "cn"

// a URL slug from a title or name
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// "Music Videos" → "Music Video", "Documentaries" → "Documentary"
// ponytail: plural rule for English nouns ending in s; add a stored singular if a category name ever breaks it
export const singular = (s: string) => s.replace(/ies$/i, "y").replace(/(?<!s)s$/i, "");
