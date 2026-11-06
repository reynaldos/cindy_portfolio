# 04 — Architecture Gameplan for Cuts By Cindy

Date: 2026-11-06
Design direction: RAZOR prototype — https://claude.ai/artifact/KszdFijTJ3diJkgcs18zs4
Product facts: `PRODUCT.md`

Prices and quotas below are from memory and are approximate. Check them before you sign up.

---

## 1. Decisions at a glance

| Area | Decision | Why |
|---|---|---|
| Video streaming | **Cloudflare Stream** | Adaptive HLS, free thumbnails, direct browser upload, a webhook when encoding is done. Same Cloudflare account as R2. |
| Images and files | **Cloudflare R2** on a custom domain (for example `media.cutsbycindy.com`) | Portrait, custom posters, resume PDF. No egress fees. |
| Database | **Neon Postgres + Prisma** | Already your stack. Small data, low traffic. |
| Rendering | **Cache Components** (already on in `next.config.ts`): every public page is a prerendered static shell; data reads use `'use cache'` + `cacheTag` | Pages load from the CDN. Admin saves call `updateTag` so changes show at once. |
| Admin auth | **Auth0** (`@auth0/nextjs-auth0`) in `proxy.ts`, plus an email allowlist checked in every server action | One admin user. Auth0 free tier covers it. |
| Contact email | **EmailJS**, called from a **server action** (not the browser) | Keeps the private key off the client. Lets us save first, then send. |
| Store contact submissions | **Yes** | Email can fail or hit the free quota. Cindy gets an inbox in the admin panel. |
| Spam | Honeypot field + Cloudflare Turnstile + a per-IP rate limit | Free. No captcha puzzle for real visitors. |
| Reorder | **dnd-kit** in the admin project list | Already your preference. |
| Validation | **zod** in every server action | Server actions are public endpoints. |

Rejected:
- **Google Drive URLs:** no adaptive streaming, view quotas, and Google can block playback. Not for a reel.
- **Raw MP4 from R2:** works for 10-second spots, but a 15-minute short film at one bitrate stalls on a phone. Possible fallback if Stream costs become a problem.
- **Vimeo:** good player, but the plan that removes branding and allows embed control costs more per year than Stream will at this size.
- **Mux:** a strong option with similar quality. Stream wins only because R2 is already on Cloudflare.

---

## 2. Video plan

### Cost estimate (approximate)
- Stream: about $5 per 1,000 minutes stored each month, about $1 per 1,000 minutes watched.
- Example: 40 videos × 3 min average = 120 min stored → the smallest plan (1,000 min) at about $5/month. 5,000 minutes watched → about $5/month.

### Upload flow (admin)
1. Cindy picks a file in the project form.
2. A server action calls the Stream API for a **direct creator upload** URL (tus, so large files resume after a drop).
3. The browser uploads straight to Stream. The file never touches Vercel (Vercel has a 4.5 MB request body limit).
4. The project row saves `streamUid` with `videoStatus = processing`.
5. Stream calls `POST /api/webhooks/stream` when encoding is done. The handler checks the webhook signature, saves `durationSec`, sets `videoStatus = ready`, and calls `revalidateTag`.

### Playback flow (public)
1. The page shows a **poster image only**. No player JS, no video bytes.
2. Poster source: a custom poster from R2 if one exists, else the Stream thumbnail at `posterTimeSec`.
3. On click, a small client component mounts the Stream player (iframe) with autoplay. Only one player plays at a time.
4. Hover previews (the prototype's scrub-on-hover): later phase. Start with posters; add short muted previews only if the performance budget holds.

### Signed URLs
Not needed at first. All portfolio work is public. If a client asks for a private cut, turn on "require signed URLs" for that one video later.

---

## 3. Data model (Prisma)

```prisma
model Profile {               // one row, id = 1
  id              Int      @id @default(1)
  name            String               // Cindy Peralta
  brand           String               // Cuts By Cindy
  tagline         String
  bio             String   @db.Text
  quote           String?
  location        String               // Los Angeles, CA
  tools           String[]             // ordered list
  portraitKey     String?              // R2 object key
  resumeKey       String?
  contactEmail    String
  instagramUrl    String?
  vimeoUrl        String?
  linkedinUrl     String?
  recentTitle     String               // Recent Cuts heading
  recentCopy      String   @db.Text    // Mainstay / Wave Wellness copy
  updatedAt       DateTime @updatedAt
}

model Category {              // seeded with the fixed four
  id        String    @id @default(cuid())
  slug      String    @unique          // short-films | commercials | music-videos | trailers
  name      String
  blurb     String?
  sortOrder Int
  projects  Project[]
}

model Project {
  id            String      @id @default(cuid())
  slug          String      @unique
  title         String
  client        String?
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id])
  year          Int?
  role          String?               // Editor, Color, ...
  director      String?
  productionCo  String?
  agency        String?
  deliverables  String?               // Broadcast + Social
  description   String      @db.Text
  streamUid     String?
  videoStatus   VideoStatus @default(none)
  durationSec   Int?
  aspectRatio   String      @default("16:9")
  posterKey     String?               // custom poster in R2, overrides Stream thumbnail
  posterTimeSec Int         @default(1)
  status        PubStatus   @default(draft)
  sortOrder     Int         @default(0)   // order inside its category
  recentOrder   Int?                  // 1–5 when in Recent Cuts, else null
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([categoryId, status, sortOrder])
  @@unique([recentOrder])
}

model ContactSubmission {
  id          String        @id @default(cuid())
  name        String
  email       String
  company     String?
  projectType String?
  message     String        @db.Text
  ipHash      String                  // for rate limiting, not the raw IP
  emailSent   Boolean       @default(false)
  status      InboxStatus   @default(new)
  createdAt   DateTime      @default(now())

  @@index([status, createdAt])
}

enum VideoStatus { none processing ready error }
enum PubStatus   { draft published }
enum InboxStatus { new read archived }
```

Notes:
- No `User` table. Auth0 holds the identity; `ADMIN_EMAILS` in env is the allowlist.
- Recent Cuts is not its own table. A project is in Recent Cuts when `recentOrder` is 1–5. The unique index stops two projects taking one slot.
- `sortOrder` is written by the dnd-kit reorder in one transaction.
- Schema changes and migrations are yours to run. I will not run them.

---

## 4. Routes and folders

```
app/
  (site)/
    layout.tsx                 edit-bay chrome: menu bar, workspace tabs, timeline, status strip
    page.tsx                   lander (hero monitor + reel)
    projects/page.tsx          four category tracks
    projects/[category]/page.tsx        scrollable clip list with descriptions
    projects/[category]/[slug]/page.tsx project detail
    recent/page.tsx            Recent Cuts: copy + five slots
    about/page.tsx             portrait, bio, tools, location
    contact/page.tsx           form (also opened as a dialog from the Contact button)
  admin/
    layout.tsx                 auth check, admin nav
    page.tsx                   inbox count, quick links
    profile/page.tsx           About + contact info form
    projects/page.tsx          list per category, dnd-kit reorder, publish toggle
    projects/new/page.tsx
    projects/[id]/page.tsx     edit form + video upload + poster upload
    recent/page.tsx            pick and order the five Recent Cuts
    inbox/page.tsx             contact submissions
  api/
    webhooks/stream/route.ts   Stream "video ready" webhook
  sitemap.ts
  robots.ts
lib/
  db.ts                        Prisma client
  data.ts                      cached public reads ('use cache' + cacheTag)
  actions/                     server actions (admin CRUD, contact)
  stream.ts                    Stream API calls
  r2.ts                        presigned upload URLs
  auth.ts                      Auth0 client + requireAdmin()
proxy.ts                       Auth0 middleware for /admin and /auth
prisma/schema.prisma
```

Next.js 16 notes:
- `middleware.ts` is now `proxy.ts`, and it runs on Node, not Edge.
- `params` is async (`await params`).
- Use `generateStaticParams` for category and project slugs so they prerender.

---

## 5. Rendering and performance

### Cache plan
| Read | Cache | Tags | Invalidated by |
|---|---|---|---|
| `getProfile()` | `'use cache'`, `cacheLife('max')` | `profile` | Profile save |
| `getCategories()` | same | `categories` | Category edit (seed only at first) |
| `getCategoryProjects(slug)` | same | `projects`, `category:<slug>` | Any project save in that category |
| `getProject(slug)` | same | `projects`, `project:<slug>` | That project's save |
| `getRecentCuts()` | same | `recent` | Recent Cuts save, or a save to one of those projects |

- Admin server actions call `updateTag(...)` so Cindy sees her change at once.
- The Stream webhook (a route handler) calls `revalidateTag(tag, 'max')`.
- Admin pages read without cache. They sit behind auth and read cookies, so wrap their data in `<Suspense>`.

### Performance budget (public pages)
| Metric | Target |
|---|---|
| LCP, mid phone on 4G | under 2.0 s |
| CLS | under 0.05 |
| First-load JS | under 130 KB gzip |
| Video bytes before a click | 0 |
| Poster images | AVIF/WebP through `next/image`, correct `sizes`, `priority` only on the lander hero |

How we hit it:
- The edit-bay chrome (menu bar, tabs, timeline) is server-rendered HTML and CSS. Only the parts that move (playhead, transport buttons, the razor reveal, audio meters) are client islands.
- Fonts: Bricolage Grotesque + JetBrains Mono through `next/font` (self-hosted, subset, `display: swap`). Drop the Google Fonts link from the prototype.
- The audio meter canvas and hover previews start only after the page is idle, and never under reduced motion.
- `partialPrefetching` is on, so nav links prefetch the static shell.

### Page transition (the razor reveal)
- Use React `<ViewTransition>` with the browser View Transitions API (see `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). The blade line and the two halves are CSS animations on the old and new snapshots.
- Reduced motion: a 200 ms crossfade.
- Browsers without View Transitions: plain navigation, no fake.

---

## 6. Admin panel

- **Login:** Auth0 Universal Login. `proxy.ts` sends anyone without a session on `/admin/*` to login.
- **Second check:** every admin server action calls `requireAdmin()`, which reads the session and checks the email against `ADMIN_EMAILS`. The proxy alone is not enough, because server actions can be called directly.
- **Forms:** shadcn/ui form parts, zod schemas shared between the form and the action.
- **Uploads:** video → Stream direct upload (section 2). Portrait, poster, resume → R2 presigned PUT URL from a server action; the browser uploads directly; the action saves the object key.
- **Delete project:** deletes the row, then the Stream video and the R2 poster. If the remote delete fails, log it and keep going.
- **Reorder:** dnd-kit sortable list; on drop, one server action writes all `sortOrder` values in a transaction.
- **Inbox:** list of submissions, mark read or archived, a "reply" mailto link.

---

## 7. Contact form

1. Visitor fills name, email, company (optional), project type (one of the four categories or "Other"), message.
2. A hidden honeypot field and a Turnstile widget are on the form.
3. Server action:
   1. zod-validate the fields.
   2. Reject if the honeypot has a value (return "sent" so bots learn nothing).
   3. Verify the Turnstile token with Cloudflare.
   4. Rate limit: refuse if the same `ipHash` sent 3 or more in the last 10 minutes.
   5. Save `ContactSubmission`.
   6. Send through the EmailJS REST API with the private key (turn on "allow non-browser API calls" in EmailJS settings).
   7. Set `emailSent = true` on success. On failure, keep the row; the inbox shows it.
4. The visitor sees a success state. The form never shows an EmailJS error to the visitor.

EmailJS free tier is about 200 emails a month (approximate). If Cindy outgrows it, swap step 6 for Resend; nothing else changes.

---

## 8. Environment variables

| Name | Used by |
|---|---|
| `DATABASE_URL` | Prisma (Neon pooled) |
| `DIRECT_URL` | Prisma migrations (Neon direct) |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL` | Auth0 SDK |
| `ADMIN_EMAILS` | `requireAdmin()` |
| `CF_ACCOUNT_ID`, `CF_STREAM_TOKEN`, `CF_STREAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_STREAM_CUSTOMER_CODE` | Stream |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL` | R2 |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY` | Contact action |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Contact form |

---

## 9. New dependencies

| Package | For |
|---|---|
| `prisma`, `@prisma/client` | Database |
| `@auth0/nextjs-auth0` | Admin login |
| `zod` | Validation |
| `@dnd-kit/core`, `@dnd-kit/sortable` | Reorder |
| `aws4fetch` | R2 presigned URLs (small; avoids the full AWS SDK) |
| `tus-js-client` | Resumable video upload to Stream |

No player library: the Stream iframe player is enough.

---

## 10. Build phases and progress

Update the boxes as each task is done.

### Phase 0 — Foundations
- [ ] 0.1 Write `DESIGN.md` from the RAZOR prototype (`/impeccable document` style: tokens, type, spacing, components).
- [ ] 0.2 Move design tokens into `app/globals.css` (Tailwind v4 `@theme`) and fonts into `next/font`.
- [ ] 0.3 Add Prisma schema (section 3). You run the migration on Neon.
- [ ] 0.4 Seed script for Profile, the four categories, and the Wave Wellness project rows (not staged).

### Phase 1 — Public shell and data layer
- [ ] 1.1 `lib/db.ts`, `lib/data.ts` with cached reads and tags.
- [ ] 1.2 `(site)/layout.tsx`: edit-bay chrome as server components; responsive phone bar.
- [ ] 1.3 Razor reveal transition with `<ViewTransition>` and the reduced-motion fallback.

### Phase 2 — Video pipeline
- [ ] 2.1 Cloudflare account: Stream on, R2 bucket on a custom domain.
- [ ] 2.2 `lib/stream.ts`: direct upload URL, delete, thumbnail URL helper.
- [ ] 2.3 Stream webhook route with signature check.
- [ ] 2.4 Poster + click-to-play player component.

### Phase 3 — Public pages
- [ ] 3.1 Lander.
- [ ] 3.2 Projects (four tracks) and category pages (scroll list + descriptions).
- [ ] 3.3 Project detail page.
- [ ] 3.4 Recent Cuts.
- [ ] 3.5 About.
- [ ] 3.6 Footer ("End Credits").

### Phase 4 — Contact
- [ ] 4.1 Contact form UI (page + dialog).
- [ ] 4.2 Server action: validate, honeypot, Turnstile, rate limit, save, EmailJS.

### Phase 5 — Admin
- [ ] 5.1 Auth0 in `proxy.ts`, `requireAdmin()`.
- [ ] 5.2 Profile form (About + contact info, portrait + resume upload).
- [ ] 5.3 Projects CRUD with video and poster upload.
- [ ] 5.4 dnd-kit reorder.
- [ ] 5.5 Recent Cuts picker.
- [ ] 5.6 Inbox.

### Phase 6 — Launch
- [ ] 6.1 Metadata, Open Graph image per project, `sitemap.ts`, `robots.ts`.
- [ ] 6.2 Accessibility pass (keyboard, focus, captions on video where Cindy has them).
- [ ] 6.3 Performance check against the budget (Lighthouse on a throttled phone profile).
- [ ] 6.4 Vercel env vars, domain, Auth0 callback URLs, Stream webhook URL.

---

## 11. Open questions

- Domain name (needed for R2 custom domain, Auth0 callbacks, and email).
- Cindy's real contact email and social links.
- Real video files, posters, and portrait.
- Does Cindy have captions for any of her videos?
- Who owns the Cloudflare, Auth0, Neon, and EmailJS accounts: you or Cindy?
