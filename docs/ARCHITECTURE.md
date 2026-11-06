# Architecture — Cuts By Cindy

Date: 2026-11-06
Related: [PRODUCT.md](PRODUCT.md) (product facts) · [DESIGN.md](DESIGN.md) (visual system) · [GAMEPLAN.md](GAMEPLAN.md) (build order and progress)
Design reference: the RAZOR mockup, https://claude.ai/artifact/KszdFijTJ3diJkgcs18zs4 (version 9). It is a visual mockup only. Copy its look and behavior, not its code.

Prices and quotas are from memory and approximate. Check them before sign-up.

---

## 1. Decisions at a glance

| Area | Decision | Why |
|---|---|---|
| Framework | Next.js 16 App Router, TypeScript, no `src/` | Already set up. Cache Components is on. |
| Styling | Tailwind v4 with the DESIGN.md tokens in `@theme`; shadcn/ui on Radix for admin forms | One token source for site and admin. |
| Video streaming | **Cloudflare Stream** (HLS) | Adaptive bitrate, free thumbnails at any time code, direct browser upload, a "ready" webhook. |
| Video player | Our own `<video>` + **hls.js** (native HLS on Safari) | The program monitor, transport, scrub, timecode, and audio meters are our UI. An iframe player cannot feed the meters. |
| Images and files | **Cloudflare R2** on a custom domain | Portrait, custom posters, stills, resume PDF. No egress fees. |
| Database | **Neon Postgres + Prisma** | Small data, low traffic. |
| Rendering | Cache Components: static shells, `'use cache'` reads with `cacheTag`, `updateTag` after admin saves | Pages come from the CDN; Cindy's edits show at once. |
| Page transition | React `<ViewTransition>` with CSS for the razor cut | Route changes are transitions in Next 16, so no page clone is needed. |
| Admin auth | **Auth0** (`@auth0/nextjs-auth0`) in `proxy.ts` + an email allowlist in every server action | One admin user. |
| Contact email | **EmailJS** REST API, called from a server action | The private key stays on the server; the message is saved first. |
| Spam | Honeypot + Cloudflare Turnstile + a per-IP rate limit | Free, no puzzle for real visitors. |
| Reorder | dnd-kit in the admin | Your preferred tool. |
| Validation | zod in every server action | Server actions are public endpoints. |

Rejected:
- **Google Drive URLs:** no adaptive streaming, view quotas, and blocked playback.
- **Raw MP4 from R2:** fine for 10 s spots, but a 15 min short film at one bitrate stalls on a phone.
- **Vimeo or the Stream iframe player:** we cannot draw our own monitor chrome or read audio levels from an iframe.

---

## 2. Video pipeline

### Cost estimate (approximate)
- Stream: about $5 per 1,000 minutes stored each month, about $1 per 1,000 minutes watched.
- Example: 40 videos × 3 min = 120 min stored → the smallest plan, about $5/month.

### What each clip needs, and where it comes from

| Asset | Source | Stored |
|---|---|---|
| HLS stream | Stream encodes the upload | Stream (`streamUid`) |
| Poster | Stream thumbnail at `posterTimeSec`, or a custom upload | URL is derived; custom poster key in R2 |
| Film strip (6 frames) for timeline clips | 6 Stream thumbnail URLs at even times, 60px tall | Nothing stored; URLs are derived |
| Waveform peaks (A1) | Computed in Cindy's browser from the file she picks, at upload | `peaks` JSON on the project (240 numbers) |
| Duration, fps, size | Stream webhook (duration, size); fps entered or read at upload | Project row |
| Stills (detail pages) | Cindy uploads | R2 keys in `ProjectStill` |

### Upload flow (admin)
1. Cindy picks a file in the project form.
2. The browser decodes the audio with `OfflineAudioContext` at 8 kHz mono and computes 240 peak values. Files over 500 MB skip this step; A1 then shows the "no audio preview" line.
3. A server action asks Stream for a **direct creator upload** URL (tus, so a dropped upload resumes).
4. The browser uploads straight to Stream. The file never touches Vercel (4.5 MB body limit).
5. The project saves `streamUid`, `peaks`, and `videoStatus = processing`.
6. Stream calls `POST /api/webhooks/stream` when encoding is done. The handler checks the signature, saves duration and size, sets `videoStatus = ready`, and calls `revalidateTag`.

### Playback flow (public)
1. Every page renders the **poster only**. No player JS, no video bytes (DESIGN.md "Poster first").
2. Hover or scroll-select changes the poster and the inspector only.
3. On Play (button, row click, L, or Space), a client component loads hls.js (Safari uses native HLS), attaches the stream, and plays. One `<video>` exists per page.
4. The audio meters read levels through Web Audio from that `<video>`. If the browser blocks it (CORS or Safari quirks), the meters show MUTED and the rest still works.
5. Captions: a `<track kind="captions">` when the project has a caption file.

### Signed URLs
Not needed at first. All portfolio work is public. Turn on signed URLs per video later if a client asks for a private cut.

---

## 3. Data model (Prisma)

```prisma
model Profile {               // one row, id = 1
  id            Int      @id @default(1)
  name          String               // Cindy Peralta
  brand         String               // Cuts By Cindy
  tagline       String
  bio           String   @db.Text
  quote         String?
  location      String               // Los Angeles, CA
  studied       String?
  tools         String[]             // ordered list
  clients       String[]             // end-credits marquee
  portraitKey   String?              // R2 key
  resumeKey     String?
  contactEmail  String
  replyTime     String?              // "within 2 business days"
  instagramUrl  String?
  vimeoUrl      String?
  linkedinUrl   String?
  reelProjectId String?              // the lander reel
  updatedAt     DateTime @updatedAt
}

model RecentWork {            // one row, id = 1
  id         Int      @id @default(1)
  title      String               // Recent Work heading
  copy       String   @db.Text    // Mainstay / Wave Wellness copy
  stampValue String?              // "10 DAYS"
  stampText  String?              // "Rough cut to delivery: 10 days."
  markers    Json                 // [{ label, note, at }] feedback pins, at = 0..1
  updatedAt  DateTime @updatedAt
}

model Category {              // seeded with the fixed four
  id        String    @id @default(cuid())
  slug      String    @unique          // short-films | commercials | music-videos | trailers
  name      String
  one       String                     // singular: "Commercial"
  blurb     String?
  sortOrder Int
  projects  Project[]
}

model Project {
  id            String         @id @default(cuid())
  slug          String         @unique
  title         String
  subtitle      String?                // spot name, e.g. "Morning Light"
  client        String?
  categoryId    String
  category      Category       @relation(fields: [categoryId], references: [id])
  year          Int?
  role          String?
  director      String?
  productionCo  String?
  agency        String?
  deliverables  String?
  description   String         @db.Text
  credits       Json?                  // [{ role, name }] full credits for detail pages
  streamUid     String?
  videoStatus   VideoStatus    @default(none)
  durationSec   Float?
  fps           Float?
  width         Int?
  height        Int?
  peaks         Json?                  // 240 numbers, 0..1
  captionsKey   String?                // R2 key of a .vtt file
  posterKey     String?
  posterTimeSec Float          @default(1)
  status        PubStatus      @default(draft)
  sortOrder     Int            @default(0)
  recentOrder   Int?                   // 1–5 when in Recent Work
  stills        ProjectStill[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([categoryId, status, sortOrder])
  @@unique([recentOrder])
}

model ProjectStill {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  key       String                    // R2 key
  alt       String
  sortOrder Int

  @@index([projectId, sortOrder])
}

model ContactSubmission {
  id          String      @id @default(cuid())
  name        String
  email       String
  projectType String?               // Short Film | Commercial | Music Video | Trailer | Other
  message     String      @db.Text
  ipHash      String
  emailSent   Boolean     @default(false)
  status      InboxStatus @default(new)
  createdAt   DateTime    @default(now())

  @@index([status, createdAt])
}

enum VideoStatus { none processing ready error }
enum PubStatus   { draft published }
enum InboxStatus { new read archived }
```

Notes:
- A project has a detail page when it has stills or full credits.
- No `User` table. Auth0 holds the identity; `ADMIN_EMAILS` is the allowlist.
- Schema changes and migrations are yours to run.

---

## 4. Routes and folders

| Route | Screen |
|---|---|
| `/` | Home: reel in the monitor, hero, "Play reel" |
| `/projects` | Four category tracks |
| `/projects/[category]` | Category: sticky monitor, chips, clip rows with descriptions |
| `/projects/[category]/[slug]` | Project detail: stills and full credits |
| `/recent-work` | Recent Work: copy, feedback pins, 5 spots, stamp |
| `/about` | Portrait, bio, quote, tools |
| `not-found.tsx` | Media Offline |
| Contact | A dialog (`<dialog>` + `showModal()`) opened from CONTACT, File menu, and "Start a project" |
| `/admin/*` | Admin panel (section 7) |

```
app/
  (site)/
    layout.tsx                 edit-bay frame: app bar, workspace tabs, bin rail, timeline band, status strip
    page.tsx                   home
    projects/page.tsx
    projects/[category]/page.tsx
    projects/[category]/[slug]/page.tsx
    recent-work/page.tsx
    about/page.tsx
    not-found.tsx              Media Offline
  admin/
    layout.tsx                 requireAdmin(), admin nav
    page.tsx                   inbox count, quick links
    profile/page.tsx           About, contact info, tools, clients
    recent-work/page.tsx       copy, stamp, markers, pick five spots
    projects/page.tsx          list per category, dnd-kit reorder, publish toggle
    projects/new/page.tsx
    projects/[id]/page.tsx     form, video upload, poster, stills, credits
    inbox/page.tsx
  api/webhooks/stream/route.ts
  sitemap.ts
  robots.ts
components/
  bay/                         app bar, tabs, bin rail, inspector, timeline, status strip, credits
  monitor/                     poster, player (client), transport, scrub, meters (client)
  ui/                          shadcn/ui
lib/
  db.ts                        Prisma client
  data.ts                      cached public reads
  actions/                     server actions
  stream.ts                    Stream API + thumbnail URL helpers
  r2.ts                        presigned upload URLs
  auth.ts                      Auth0 client + requireAdmin()
  peaks.ts                     browser waveform peaks (admin)
proxy.ts                       Auth0 for /admin and /auth
prisma/schema.prisma
```

Next.js 16 notes:
- `middleware.ts` is now `proxy.ts`, and it runs on Node.
- `params` is async (`await params`).
- Use `generateStaticParams` for category and project slugs.

---

## 5. Rendering, caching, and performance

### Cache plan

| Read | Tags | Invalidated by |
|---|---|---|
| `getProfile()` | `profile` | Profile save |
| `getRecentWork()` | `recent` | Recent Work save, or a save to one of its five projects |
| `getCategories()` | `categories` | Category edit |
| `getCategoryProjects(slug)` | `projects`, `category:<slug>` | Any project save in that category |
| `getProject(slug)` | `projects`, `project:<slug>` | That project's save |

- Every read uses `'use cache'` with `cacheLife('max')`.
- Admin server actions call `updateTag(...)`. The Stream webhook calls `revalidateTag(tag, 'max')`.
- Admin pages read without cache, inside `<Suspense>`.

### Performance budget (public pages)

| Metric | Target |
|---|---|
| LCP, mid phone on 4G | under 2.0 s |
| CLS | under 0.05 |
| First-load JS | under 130 KB gzip (hls.js loads only on Play) |
| Video bytes before Play | 0 |
| Meter work while paused | 0 draws per second |

How we hit it:
- The bay frame is server HTML and CSS. Client islands: the player, transport, scrub, meters, timeline playhead, bin toggle, dialog, and keyboard handler.
- Posters, film strips, and stills use `next/image` (lazy below the fold, `priority` only on the home poster).
- Fonts: Clash Display and General Sans through `next/font/local`, JetBrains Mono through `next/font/google`, all subset with `display: swap`.
- The meter loop runs only while sound plays.

---

## 6. Build rules from the mockup audit

The mockup scored 15/20 in the technical audit. These rules carry its lessons into the build. They are not mockup changes.

**Navigation and semantics**
- Tabs, bin items, V1 Pages clips, and breadcrumbs are `<Link>` with `aria-current="page"`. Buttons are only for actions.
- The contact dialog is a native `<dialog>` opened with `showModal()`, so the page behind it is inert.
- Each clip row is an `<article>`. Only the title is the link or button, so the accessible name stays short.
- The end-credits client list has a visually hidden text list; the moving marquee stays `aria-hidden`.
- The NOW CUTTING board has one text label; its letter cells are `aria-hidden`.
- The ruler is either a real `role="slider"` with arrow keys or decorative.

**Motion**
- The razor cut uses `<ViewTransition>`: the frame (app bar, tabs, bin, timeline) keeps a `viewTransitionName` and does not animate, and the stage runs the cut with `::view-transition-old/new` clip-paths. The clicked point is set as a CSS variable before navigation.
- A second click during the cut finishes it and goes to the new target. Navigation is never dropped.
- The playhead moves with `transform: translateX()`. Other animated parts use transform or opacity only.

**Keys**
- Space and Enter press the focused control. J (back 5 s), K (pause), L (play), arrows (clips), M (mute), and ? work everywhere except in text fields.

**Tokens**
- Every color is a token from DESIGN.md, including the app bar, page black, and audio well. Canvas and SVG drawing read tokens with `getComputedStyle`.

---

## 7. Admin panel

- **Login:** Auth0 Universal Login. `proxy.ts` sends anyone without a session on `/admin/*` to login.
- **Second check:** every admin server action calls `requireAdmin()`.
- **Look:** DESIGN.md "Admin Panel": tokens, Body and UI type, shadcn/ui forms, no editor costume.
- **Screens:** Profile (About, contact, tools, clients), Recent Work (copy, stamp, markers, five spots), Projects (list, reorder, publish, create, edit, delete), Inbox.
- **Uploads:** video → Stream direct upload (section 2). Portrait, poster, stills, captions, resume → R2 presigned PUT URL.
- **Delete project:** deletes the row, then the Stream video and the R2 files. A failed remote delete is logged.
- **Reorder:** one server action writes all `sortOrder` values in a transaction.

---

## 8. Contact form

1. Fields: Name, Email, Project type, Message. A hidden honeypot field and a Turnstile widget.
2. The draft stays when the dialog closes (client state), and clears after success.
3. Server action:
   1. zod-validate.
   2. Honeypot filled → return "sent" and do nothing.
   3. Verify the Turnstile token.
   4. Rate limit: refuse 3 or more from the same `ipHash` in 10 minutes.
   5. Save `ContactSubmission`.
   6. Send through the EmailJS REST API with the private key ("allow non-browser calls" on).
   7. Set `emailSent = true`. On failure keep the row; the inbox shows it.
4. The dialog shows the five states from DESIGN.md. Focus moves to each new status message.

EmailJS free tier is about 200 emails a month (approximate). If Cindy outgrows it, swap step 6 for Resend.

---

## 9. Environment variables

| Name | Used by |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Prisma (Neon pooled / direct) |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` | Auth0 |
| `ADMIN_EMAILS` | `requireAdmin()` |
| `CF_ACCOUNT_ID`, `CF_STREAM_TOKEN`, `CF_STREAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_STREAM_CUSTOMER_CODE` | Stream |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL` | R2 |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY` | Contact |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Contact |

---

## 10. New dependencies

| Package | For |
|---|---|
| `prisma`, `@prisma/client` | Database |
| `@auth0/nextjs-auth0` | Admin login |
| `zod` | Validation |
| `hls.js` | HLS playback outside Safari |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Reorder |
| `aws4fetch` | R2 presigned URLs |
| `tus-js-client` | Resumable upload to Stream |

---

## 11. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Razor cut with `<ViewTransition>` behaves differently across browsers | 200 ms crossfade (the reduced-motion path); browsers without View Transitions navigate plainly |
| Web Audio meters blocked on Stream HLS (CORS, Safari) | Meters show MUTED; playback is not affected |
| Browser peak decode fails on a large file | A1 shows the "no audio preview" line |
| Scroll-to-select on category pages feels jumpy | Select on click and arrow keys only |
| Phone drawer fights browser toolbars | Drawer off; bottom bar only |

## 12. Open questions

- Domain name (R2 custom domain, Auth0 callbacks, email).
- Cindy's real contact email, social links, and reply time.
- Real video files, posters, portrait, stills, and captions.
- Confirmation of all draft copy in the mockup (directors, spot names, feedback notes, credits).
- Who owns the Cloudflare, Auth0, Neon, and EmailJS accounts.
