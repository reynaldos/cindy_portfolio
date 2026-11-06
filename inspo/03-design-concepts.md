# 03 — Design Concepts for Cuts By Cindy

Date: 2026-11-04
Status: CONCEPTS ONLY. Waiting for Commander approval. No code.

## Inputs and gaps

- 00-client-notes.md: NOT READ. The file is outside this run's read grant.
- 01-editor-portfolios.md: NOT READ, for the same reason. I could not poll for it either (no shell in this run).
- Cindy's requirements were taken directly from her annotated mockup: /Users/reysanchez/Documents/dev/cindy_portfolio/inspo/design-2.png. If 00-client-notes.md adds more, re-check each concept against it.
- Sources: 02-inspo-sources.md (same folder as this file).

## Cindy's requirements (from design-2.png) — every concept honors all of these

1. Opening reveal. "Similar to the photography website, I'd like this to have an effect of the leaves opening up to whatever page they click at the top." Nav at top: Projects, Recent Work, About.
2. Hero copy: "Cuts By Cindy" / "Video Editor" / "Sharing stories of culture and connection".
3. Projects: four categories: Short Films, Commercials, Music Videos, Trailers. Click one, open a page that looks similar, with all videos in that category. Visitors scroll through the videos and see a description for each ("similar to the chat gpt photo design").
4. Recent Cuts: "Commercial work with Mainstay Films, a Rod Wave Production Company." Five Wave Wellness spots, rough cut to final delivery in 10 days, several feedback rounds, final versions for broadcast and social. Five video tiles.
5. About: "Hi I'm Cindy Peralta." Her bio text, portrait, tools (Premiere Pro, After Effects, Media Encoder, DaVinci Resolve), Los Angeles, CA.
6. Her taste: green leaves, cream paper, small playful stickers.

Content question for the Commander: the mockup says "Avid Media Encoder". The product is Adobe Media Encoder. Please confirm with Cindy.

Shared performance rules (apply to all three concepts, so each concept only lists what differs):
- Full films live on a video host (Mux, Cloudflare Stream or Vimeo Pro) and stream as HLS. No large MP4 in the repo.
- Every clip has: a poster still (AVIF/WebP, about 60 KB), a 4 to 6 second muted preview loop (H.264 MP4 plus WebM, under 1 MB), and the full film on demand.
- Previews use preload="none" and start only when on screen. Only one preview plays at a time.
- The full player loads only on click.
- prefers-reduced-motion: the opening reveal becomes a 200 ms crossfade. Previews show posters only.
- Fonts: two families maximum per concept, subset, self-hosted.

---

## Concept 1 — "THE GREENROOM"

One line: the leaves are a cut. Real monstera leaves part along a straight edit line, and every page is the next shot.

### Mood and why it fits Cindy
Warm, calm, a little nostalgic, but shot, not painted. Her green and cream stay, but they come from real photographs and real film grain, not AI watercolor. It reads as "a quiet edit suite with a plant in it", which is where an editor actually lives. It keeps her vibe and removes the slop.

### Palette
| Token | Hex | Use |
|---|---|---|
| Frond | #1F3D2B | Primary dark, leaf layer, headers |
| Deep Frond | #0F2419 | Lander background, shadows |
| Cream Stock | #F2EAD8 | Page background |
| Sage | #A8B79A | Rules, tags, hover |
| Maroon Slate | #6B1E2A | Accent, active nav, links |
| Safelight | #E3A44B | Timecode, small highlights only |
| Ink | #1B1A17 | Body text on cream |

### Type
- Display: Gambarino (Fontshare). Soft, cut-paper serif with real character. Replaces the generic Fraunces look.
- Text and UI: General Sans (Fontshare).
- Timecode only: a tabular-number style of General Sans. No third family.

### Layout and grid
12-column grid, 24 px gutters, generous cream margins. Pages are vertical "reels": one idea per screen height. Cream paper texture is a real scanned paper at 4% opacity, plus fine grain.

### The opening reveal (Cindy's leaves)
- Layer: 6 to 8 real photographed monstera leaves (shot by Cindy or a photographer on black, cut out), stacked in two banks, left and right.
- On click of a nav item, the leaves close in over 250 ms. A thin Maroon Slate line draws down the center: the cut point.
- The banks part along that line with a slight fold (from the Page Curl idea) and parallax depth. The new page is already loaded underneath.
- Total 900 ms. The destination name sets in Gambarino in the gap as the leaves part, then fades.
- Each leaf carries 2% of the next page's key frame as a tint, so the leaves "belong" to the shot.

### Signature interactions and React Bits
- Leaves reveal: custom (no React Bits component does this). Built with layered images and transforms.
- Noise (https://reactbits.dev/animations/noise): 35mm grain on the whole page, very low.
- Split Text (https://reactbits.dev/text-animations/split-text): hero lines enter word by word.
- Fade Content (https://reactbits.dev/animations/fade-content): sections fade in "through grain".
- Sticker Peel (https://reactbits.dev/animations/sticker-peel): 3 to 4 stickers Cindy designs herself (her logo, a scissors, a clapper, her signature). They are peelable. No borrowed Ghibli characters.
- Scroll Stack (https://reactbits.dev/components/scroll-stack): Recent Cuts.

### Pages
- Lander: full-bleed leaves over a muted 6 second loop from her reel. "Cuts By Cindy" in Gambarino, "Video Editor", "Sharing stories of culture and connection". Nav top right: Projects, Recent Work, About. One scroll hint: "scroll to roll".
- Projects: four tall cards on Deep Frond, each a leaf-shaped mask (soft monstera silhouette) over that category's preview loop. Hover: the leaf mask opens slightly and the loop plays.
- Category page (x4): same frame as Projects, so it "looks similar". A single column scroll list. Each entry: big player (16:9 or native ratio), and on the right a cream card: title, client, year, her role "(Edit, Color, Sound)", runtime, 2 to 4 sentence description. Model: Emi Takahashi's TITLE / year / CATEGORIES / DESCRIPTION block. A small sticky index on the left lists all entries.
- Project detail: optional. The list already holds the description. A detail page appears only for films with stills and credits worth a page.
- Recent Cuts: header copy as Cindy wrote it. The five Wave Wellness spots stack with Scroll Stack. Each card shows spot number, length, and "Broadcast + Social". A Count Up line: "Rough cut to delivery: 10 days."
- About: portrait on the left as a real photo with a cream border, like a print taped to the wall. Bio on the right in her words. Tools as small chips. "Los Angeles, CA". Her own stickers stuck on the portrait border.
- Contact: one cream card: email (copy button with "Copied" state, from dmcg.co), Instagram, Vimeo, "Open to edits" line.

### Footer — "The Plant Stays"
A single large leaf, cropped, with "CUTS BY CINDY" running full width under it in Gambarino. A live "LOS ANGELES 4:12 PM" (from Little Plains). Each leaf vein is a link: Email, Instagram, Vimeo, Resume. Hover a vein, it lights in Safelight.

### Video loading
Shared rules apply. Previews in leaf masks are CSS masks over a normal video element, so no extra cost. The lander loop is under 1.5 MB and starts after first paint.

### Mobile
Leaves come from top and bottom, not sides, so the portrait screen fills fast. Category list becomes full-width player with the description below. Stickers are fixed in place, not peelable, on touch.

### Risks
- Risk of sliding back into "cozy plant blog". Fix: real photography only, strict grid, no illustrations.
- Leaf photography must be good. It needs a 1-hour shoot.
- The 900 ms reveal must not repeat on every small action. Only on top-nav clicks.

---

## Concept 2 — "RAZOR" (bold departure)

One line: the whole site is her timeline. You scrub it, you cut it, you watch it.

### Mood and why it fits Cindy
Confident, graphic, a little cheeky. It shows her craft as the interface itself. Producers and directors read it in one second: "this person lives in an NLE". It is the least "pretty" and the most memorable. Her warmth comes through in color tags on clips and in her own handwriting on markers.

### Palette
| Token | Hex | Use |
|---|---|---|
| Bay Black | #0E0E10 | Background |
| Panel | #1A1A1E | Panels, cards |
| Track | #2A2A30 | Timeline tracks, rules |
| Paper | #F4F1EA | Main text |
| Cut Red | #FF3B2F | Playhead, cut line, primary accent |
| Marker Yellow | #F5D90A | Markers, hover |
| Audio Teal | #2EC4B6 | Waveforms |
| Clip colors | #7BC67E Short Films, #F28C38 Commercials, #B48CF2 Music Videos, #5AA9F2 Trailers | Category color labels, as editors color-code clips |

### Type
- Display: Clash Display (Fontshare). Tight, heavy, poster-like.
- UI and text: JetBrains Mono (Google Fonts). Timecode, labels, body at larger size.

### Layout and grid
The screen is split like an editing app: a "program monitor" at the top (about 60% height) and a "timeline" band at the bottom. Content lives in the monitor. Navigation lives on the timeline. On scroll, the playhead moves along the timeline and the monitor changes.

### The opening reveal
Her leaves, as a razor cut:
- Click a nav item. A Cut Red vertical line drops from the top at the playhead (the Razor tool).
- The current page splits into two clips that slide apart left and right.
- Behind them, the new page enters with a J-cut: its audio waveform (in Audio Teal) appears on the timeline 300 ms before the picture.
- The two halves have a frond-shaped edge, not straight: a nod to her leaves, cut by a blade. Total 700 ms.

### Signature interactions and React Bits
- Playhead scrollbar (idea from "Scrollbar BUT Cooler"): custom.
- Count Up (https://reactbits.dev/text-animations/count-up): live timecode in the corner, driven by scroll: 00:00:12:08.
- Shuffle (https://reactbits.dev/text-animations/shuffle): titles shuffle like a fast scrub, then land.
- Split Flap Text (https://reactbits.dev/text-animations/split-flap-text): "NOW CUTTING" board on the lander.
- Target Cursor (https://reactbits.dev/animations/target-cursor): corner brackets snap on clips like monitor safe-area marks.
- Scroll Velocity (https://reactbits.dev/text-animations/scroll-velocity): client and credit marquee.
- Animated List (https://reactbits.dev/components/animated-list): category clip list with arrow keys (J/K/L also work, a real editor shortcut joke that is useful).

### Pages
- Lander: monitor shows her reel loop. Over it: "Cuts By Cindy" in Clash Display, "Video Editor", "Sharing stories of culture and connection". Timeline below has 3 clips: Projects, Recent Work, About. Click a clip or a top-nav item to razor-cut into it.
- Projects: four tracks stacked, V1 to V4, each named and colored by category. Each track shows its clips as thumbnails. Hover scrubs the clip.
- Category page (x4): same monitor plus timeline layout, so it "looks similar". The monitor plays the selected clip. To the right, an "inspector" panel: title, client, year, role, runtime, description. Scroll or J/K moves to the next clip on the track. This is the "scroll through and see a description" request, done as an editor's inspector.
- Project detail: inspector expands full height with credits and stills.
- Recent Cuts: a sequence of 5 spots on one track: "Wave Wellness / Mainstay Films". Markers on the track in Marker Yellow show feedback rounds: "v1 rough", "v2 notes", "v3 notes", "final". A stamp: "10 DAYS". This tells her process story with zero extra text.
- About: monitor holds her portrait as a still frame with a timecode burn-in. Inspector holds the bio. Tools shown as track labels: PR, AE, ME, DR. Location as a metadata line: "LOC: Los Angeles, CA".
- Contact: an "Export" dialog. Fields: name, email, project type, "Export" button. Sends the form.

### Footer — "End Credits"
Inspired by Harvest Hall and Sea of Stars. The timeline reaches the end: the playhead stops, the monitor fades to black, credits roll in small JetBrains Mono: "Edited by Cindy Peralta", links, "Los Angeles". A final title card in Clash Display: "THAT'S A WRAP." Scroll back up rewinds the credits.

### Video loading
Shared rules apply. The timeline thumbnails are one sprite sheet per category (one image, many frames), so hover scrub costs one download. The monitor uses one video element that swaps its source; it never stacks players.

### Mobile
Timeline turns vertical along the right edge as a thin track with the playhead. Monitor is full width. Razor cut goes horizontal (top and bottom halves). J/K are replaced by swipe.

### Risks
- Too "app-like" can feel cold. Fix: her handwriting on markers, the clip colors, playful copy.
- Most complex to build. Needs strong motion work.
- Must stay readable for non-editors: every control also has a plain label.

---

## Concept 3 — "LIGHT TABLE"

One line: her work laid out as film on a light table: strips, frames, grease pencil and splicing tape.

### Mood and why it fits Cindy
Tactile, bright, handmade, and archival. It celebrates the physical history of the craft she studied (Cinema and Media Arts). Her playful side becomes grease-pencil notes and tape, not borrowed characters. Cream stays, but as backlit table light. Green appears only as one film stock color.

### Palette
| Token | Hex | Use |
|---|---|---|
| Light Table | #FBF7EE | Background, glowing white |
| Emulsion | #141210 | Film strips, text |
| Negative Base | #D9732B | Orange of color negative, primary accent |
| Grease Pencil | #C8322B | Marks, circles, active states |
| Splice Tape | #9CC3D5 | Tape strips, hover |
| Stock Green | #2F5D46 | One category stock, a nod to her green |
| Ink | #2B2722 | Body text |

### Type
- Display: Boska (Fontshare). High-contrast serif with film-title grace.
- Labels and edge codes: IBM Plex Mono (Google Fonts). Used like the edge print on real film ("KODAK 5219" style codes, written as her own: "CBC 2026 · 024").

### Layout and grid
Everything sits on the light table. Content is placed in film strips: vertical strips with sprocket holes, each frame a 16:9 cell. A contact-sheet grid for overviews. Grease-pencil marks (SVG, drawn on with stroke animation) circle the chosen frames.

### The opening reveal
Her leaves, as a splice:
- The current page sits on the table as a single big frame.
- Click a nav item. A strip of blue splicing tape tears off (Tear Ticket idea) across the frame.
- The frame splits along the splice and the two halves swing open like leaves (hinged at the outer edges, with a soft fold), backlit by the table glow.
- Beneath is the next page. Grease pencil writes its name. Total 850 ms.

### Signature interactions and React Bits
- Splice reveal: custom.
- Noise (https://reactbits.dev/animations/noise): fine grain and dust on frames only, not on text.
- Halftone Reveal (https://reactbits.dev/animations/halftone-reveal): About portrait as a print; the real photo comes through under the cursor.
- Image Trail (https://reactbits.dev/animations/image-trail): on the lander, stills from her films trail the cursor like frames slid across the table.
- Scroll Expand (https://reactbits.dev/animations/scroll-expand): one frame grows to full bleed and plays.
- Gradual Blur (https://reactbits.dev/animations/gradual-blur): table edges blur, like a loupe's falloff.
- Line Sidebar (https://reactbits.dev/components/line-sidebar): edge-code index of clips on the side of category pages.

### Pages
- Lander: a contact sheet of 24 frames from her work on the light table. "Cuts By Cindy" in Boska, grease-pencil underline draws on. "Video Editor" and "Sharing stories of culture and connection" as edge print.
- Projects: four film cans seen from above (from the Film Filter Selector idea), each labeled in her handwriting: Short Films, Commercials, Music Videos, Trailers. Click a can, the strip pulls out across the table.
- Category page (x4): same table, so it "looks similar". A vertical film strip runs down the center. Each frame is a clip. The frame in the "gate" (center of screen) plays; above and below are posters. Beside the gate, a paper note card with title, client, year, role, runtime and description. Scroll pulls the strip through the gate. This answers "scroll through the vids and see a description" in the most literal, physical way.
- Project detail: the frame lifts under a loupe; credits on a paper slip.
- Recent Cuts: five frames taped to the table in a row (3 then 2, as in her mockup) with grease-pencil notes: "Spot 1/5", "10 days!", "Broadcast + Social". A taped label: "Mainstay Films × Wave Wellness".
- About: her portrait as a print under halftone. Bio typed on a paper slip. Tools as film cans labelled PR, AE, ME, DR. Location as a stamp: "LOS ANGELES, CA".
- Contact: a paper slate with chalk-like fields: Name, Email, Project, "Roll it" button.

### Footer — "The Tail Leader"
The strip ends in a countdown leader: 8, 7, 6 … in a circle sweep (classic Academy leader, redrawn in her colors). It runs once when the footer enters. Then: links as edge print along the strip, "CUTS BY CINDY" in Boska, a live "LOS ANGELES" clock.

### Video loading
Shared rules apply. Only the frame in the gate plays. Frames out of view are posters. Contact sheet on the lander is a single optimized image grid, not 24 videos.

### Mobile
The strip is natural on a phone: one column, gate in the middle. Splice reveal splits top and bottom. Image Trail is off on touch.

### Risks
- Can drift into "retro film skeuomorph" cliché. Fix: keep the table white and clean, use effects sparingly, keep type modern.
- Handwriting needs Cindy's real handwriting, scanned. Fake script fonts would cheapen it.
- The leaves request is less literal here. Confirm with the Commander that a splice that opens like leaves is acceptable.

---

## Side-by-side

| | 1 The Greenroom | 2 Razor | 3 Light Table |
|---|---|---|---|
| Core idea | Leaves part on an edit line | Site is a timeline | Film on a light table |
| Keeps green/cream | Yes, as photography | No, only as a clip color | Cream as light, green as one stock |
| Bold factor | Low to medium | High | Medium |
| Leaves request | Most literal | Abstract (frond-edged razor cut) | Metaphor (splice opens like leaves) |
| Build effort | Medium | High | Medium to high |
| Needs from Cindy | Leaf photo shoot | Handwritten marker notes | Scanned handwriting |

Mood images: concept-1.png, concept-2.png, concept-3.png in the same folder.
