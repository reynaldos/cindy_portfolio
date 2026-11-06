# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Producers and production companies** (for example Mainstay Films) who hire a freelance editor for commercials and music videos.
- **Directors** who look for an editor for short films, music videos, or trailers.
- **Agencies and brands** that commission commercial spots.
- **Studios and post-production houses** (for example Kappa Studios) that hire staff or junior editors.

All four groups judge the same thing: can Cindy take raw footage to a finished cut that makes an audience feel something, on deadline. They usually arrive from a link someone sent them and decide in a few minutes.

## Product Purpose

Cuts By Cindy is the portfolio of Cindy Peralta, a video editor in Los Angeles. It shows her work by category and makes it easy to contact her.

Success has two equal parts:
1. Visitors watch the cuts. The site works as a reel that people send to each other.
2. Visitors send a booking or project inquiry through the contact form.

## Positioning

Cindy is drawn to stories about people, culture, identity, and the small moments that make us human. Her tagline: "Video Editor. Sharing stories of culture and connection." Her belief: "Great editing isn't just about what you cut, it's about what you make the audience feel."

## Operating Context

- Visitors watch video on desktop and on phones, often from a link in an email or a DM.
- Cindy manages her own content after launch. She must be able to edit the About data and contact info, and create, edit, delete, and reorder projects, from a small admin panel.
- Contact form email goes through EmailJS. Storing form submissions is wanted but not decided.

## Capabilities and Constraints

- **Pages:** lander, About, Projects (four categories), a page per category, project detail pages, Recent Cuts, contact form, footer.
- **Categories (fixed four):** Short Films, Commercials, Music Videos, Trailers. Each category page is a scrollable list of videos, each with a description.
- **Recent Cuts:** a featured section with copy and five video slots.
- **About:** portrait, bio, tools, location.
- **Page transition:** a nav click opens a reveal that parts to show the next page. This is Cindy's own request.
- **Stack:** Next.js App Router (no `src/`), TypeScript, Tailwind, shadcn/ui on Radix, Lucide icons, pnpm. Preferred services: Prisma with Neon Postgres, Vercel hosting, Cloudflare R2 storage, Auth0, dnd-kit, EmailJS.
- **Open decisions:** video hosting and streaming method; data model; rendering and caching plan; whether contact submissions are stored.

## Brand Commitments

- Name: **Cuts By Cindy**. Person: **Cindy Peralta**. Location: **Los Angeles, CA**.
- Tools, exactly: Adobe Premiere Pro, After Effects, Adobe Media Encoder, DaVinci Resolve. (The source notes said "Avid Media Encoder"; confirmed as Adobe Media Encoder.)
- Chosen design direction: the "RAZOR" prototype at https://claude.ai/artifact/KszdFijTJ3diJkgcs18zs4. The user made it binding. Its visual system belongs in DESIGN.md (not written yet), not here.

## Evidence on Hand

- Real copy: `inspo/00-client-notes.md` (tagline, About bio, Recent Cuts copy, tools, location).
- Real project: five commercial spots for Wave Wellness, a longevity and wellness company in North Carolina, made with Mainstay Films (a Rod Wave production company). Rough cut to final delivery in 10 days, several feedback rounds, finals for broadcast and social.
- Background: Cinema and Media Arts; post-production with Mainstay Films; internship with the Kappa Studios post team.
- Research: `inspo/01-editor-portfolios.md`, `inspo/02-inspo-sources.md`, `inspo/03-design-concepts.md`.
- **Not real, do not ship:** the prototype's Blender open-movie clips, director names (for example "Jordan Reyes"), spot names, years, the email `hello@cutsbycindy.com`, the Instagram and Vimeo handles, and the resume link. Real video files, posters, the portrait, contact email, and social links are not yet supplied.

## Product Principles

1. The work comes first. Every page gets a visitor to a playing video in as few steps as possible.
2. Fast on a phone. Video must not slow the first view of any page.
3. Cindy owns her content. Anything she will change goes through the admin panel, not code.
4. Real facts only. No invented clients, credits, or numbers.

## Accessibility & Inclusion

- All video must have a poster still and must not autoplay with sound.
- The reveal transition must change to a short crossfade when the visitor's system asks for reduced motion.
