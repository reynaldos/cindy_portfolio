# Gameplan — Cuts By Cindy

Date: 2026-11-06
Related: [PRODUCT.md](PRODUCT.md) · [DESIGN.md](DESIGN.md) · [ARCHITECTURE.md](ARCHITECTURE.md)
Design reference: RAZOR mockup, https://claude.ai/artifact/KszdFijTJ3diJkgcs18zs4 (version 9)

Update the boxes after each task. Each task names the user story it serves, so commit messages can cite it.

---

## User stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | visitor | see Cindy's work and name the moment the site opens | I know whose portfolio this is and what she does |
| US-02 | visitor | play the reel with sound in one click | I can judge her work fast |
| US-03 | visitor | browse four categories and a list of clips with descriptions | I find the kind of work I hire for |
| US-04 | visitor | play any clip and read its credits | I see her role and who she worked with |
| US-05 | visitor | open a detail page with stills and full credits | I see a project in depth |
| US-06 | visitor | read the Recent Work story with its feedback rounds | I see how she works with a client on deadline |
| US-07 | visitor | read About: portrait, bio, tools, location | I know who she is |
| US-08 | visitor | send Cindy a message, or copy her email | I can hire her |
| US-09 | visitor | change pages with the razor cut, or a crossfade under reduced motion | the site feels like an edit bay without making me sick |
| US-10 | keyboard or screen-reader visitor | use every page and the dialog without a mouse | the site works for me too |
| US-11 | phone visitor | use the whole site with one thumb | I can review her work between meetings |
| US-12 | Cindy | log in to a private admin panel | only I can change the site |
| US-13 | Cindy | edit About, contact info, tools, and clients | my info stays current without a developer |
| US-14 | Cindy | create, edit, delete, publish, and reorder projects, with video upload | I can add new work myself |
| US-15 | Cindy | pick and order the Recent Work spots and edit their story | the featured work stays fresh |
| US-16 | Cindy | read and archive contact messages | I never miss an inquiry, even when email fails |

---

## Phase 0 — Product and design (done)
- [x] 0.1 PRODUCT.md (all stories)
- [x] 0.2 RAZOR mockup: critique (27/40 design-only) and audit (15/20), fixes D1–D9 and A1–A5, version 9
- [x] 0.3 DESIGN.md and `.impeccable/design.json`
- [x] 0.4 ARCHITECTURE.md and this gameplan

## Phase 1 — Foundations
- [x] 1.1 Design tokens from DESIGN.md into `app/globals.css` (`@theme`), dark only (all)
- [x] 1.2 Fonts: Clash Display and General Sans via `next/font/local`, JetBrains Mono via `next/font/google` (all)
- [x] 1.3 Prisma schema from ARCHITECTURE.md §3; migration on Neon still to run (US-12–16)
- [x] 1.4 Seed script `prisma/seed.ts`: Profile, RecentWork, four categories, Wave Wellness drafts (not staged; run with `pnpm exec prisma db seed`)
- [x] 1.5 `lib/db.ts` and `lib/data.ts` with cached reads and tags (US-03, US-04)

## Phase 2 — The bay frame
- [ ] 2.1 `(site)/layout.tsx`: app bar with CBC mark and menus, workspace tabs as links, status strip (US-01, US-10)
- [ ] 2.2 Bin rail: 48px, opens to 240px, remembers the choice (US-03)
- [ ] 2.3 Timeline band: ruler, context track, V1 Pages, A1; compact at rest, expands on hover/focus (US-03, US-06)
- [ ] 2.4 Phone: bottom bar, timeline drawer, 44px targets (US-11)
- [ ] 2.5 Razor cut with `<ViewTransition>`, crossfade under reduced motion, second click finishes the cut (US-09)
- [ ] 2.6 Keyboard handler: J/K/L, arrows, M, ?, Home, End; Space and Enter stay with focus (US-10)

## Phase 3 — Video
- [ ] 3.1 Cloudflare: Stream on, R2 bucket on a custom domain, webhook URL
- [ ] 3.2 `lib/stream.ts`: direct upload URL, delete, poster and film-strip thumbnail URLs (US-14)
- [ ] 3.3 Stream webhook with signature check and `revalidateTag` (US-14)
- [ ] 3.4 Program monitor: poster, burn-in, title-safe corners, Media Offline card (US-02, US-04)
- [ ] 3.5 Player island: hls.js on Play, transport, scrub, timecode (US-02, US-04)
- [ ] 3.6 Audio meters and A1 waveform from stored peaks; MUTED fallback (US-04)

## Phase 4 — Public pages
- [ ] 4.1 Home: hero, "Play reel", inspector (US-01, US-02)
- [ ] 4.2 Projects: four tracks; hover changes poster and inspector only (US-03)
- [ ] 4.3 Category pages: compact head, sticky monitor, clip rows with descriptions, scroll-select (US-03, US-04)
- [ ] 4.4 Project detail: stills, full credits, next clip (US-05)
- [ ] 4.5 Recent Work: copy, feedback pins with edge-safe notes, five spots, stamp (US-06)
- [ ] 4.6 About: portrait, bio, quote, tools (US-07)
- [ ] 4.7 End credits on every page: credit lines, marquee (hover, click, and focus pause), "Start a project" (US-08)
- [ ] 4.8 Media Offline 404 (US-03)

## Phase 5 — Contact
- [ ] 5.1 Contact dialog: native `<dialog>`, five states, kept draft, email + Copy (US-08, US-10)
- [ ] 5.2 Server action: zod, honeypot, Turnstile, rate limit, save, EmailJS (US-08, US-16)

## Phase 6 — Admin
- [ ] 6.1 Password login: `/admin/login` with Turnstile and rate limit, signed session cookie, `proxy.ts` check, `requireAdmin()`, logout, hash script (US-12)
- [ ] 6.2 Profile form: About, contact, tools, clients, portrait, resume (US-13)
- [ ] 6.3 Projects CRUD with Stream upload, browser peaks, poster, stills, credits, captions (US-14)
- [ ] 6.4 dnd-kit reorder and publish toggle (US-14)
- [ ] 6.5 Recent Work editor: copy, stamp, markers, five spots (US-15)
- [ ] 6.6 Inbox: list, mark read, archive, reply link (US-16)

## Phase 7 — Launch
- [ ] 7.1 Metadata, Open Graph image per project, `sitemap.ts`, `robots.ts` (US-01)
- [ ] 7.2 Accessibility pass against ARCHITECTURE.md §6 (US-10, US-11)
- [ ] 7.3 `/impeccable audit` on the real build; target 18/20 (all)
- [ ] 7.4 Performance check against the budget in ARCHITECTURE.md §5 (US-11)
- [ ] 7.5 Vercel env vars (incl. `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`), domain, Stream webhook, EmailJS template
- [ ] 7.6 Replace every placeholder: clips, credits, email, socials, resume, reply time (all)

---

## Blocked on Cindy
- Real videos, posters, portrait, stills, captions, resume PDF.
- Contact email, social links, reply time.
- Confirmation of draft copy (directors, spot names, feedback notes, full credits).
- Domain name and account ownership.
