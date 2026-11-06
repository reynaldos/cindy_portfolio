# 01 — Video / Film Editor Portfolio Research

Project: cindy_portfolio ("Cuts By Cindy", Cindy Peralta, video editor, Los Angeles)
Phase: research only. No code. No design decisions.
Author: Drafter (dev line), 2026-11-04

Method: web_search to find candidates, web_fetch for page text, and a headless browser with a vision read of the live page for layout, type and color.
- Motion is inferred from still captures unless marked (observed).
- Page script inspection was blocked on this browser profile, so autoplay, muted and poster attributes were not measured.

---

## 0. Excluded sources (tried, not used)

| URL | Result |
|---|---|
| https://www.cutandrun.tv/ | Now serves a gambling spam page. |
| https://www.rockpaperscissors.com/ | Redirects to an unrelated studio ("MakeMake"). |
| https://www.rockpaperscissors.tv/ | Does not resolve. |
| https://workeditorial.com/ | Domain for sale. |
| https://www.stitchediting.com/ | Domain for sale. |
| https://www.mackenziecutler.com/ | Does not resolve. |
| https://www.spotwelders.com/ | Loads, but the text has only "Portfolio / Contact". Too thin to use. |
| https://www.marshallpost.com/ | Bot-check wall. |
| https://www.mikelabrow.com/ | TLS certificate error. Not visited. Colorlib's description is used in section 1C only. |
| https://www.wannerstedt.com/ | Redirects to wannerstedt.se, a different person (photographer Fredrik Wannerstedt). This is not Andreas Wannerstedt. |
| https://robin.cv/ (Robin Humphreys, from the A1 list) | A software / AI product designer, not a video editor. Excluded from the editor list. Its footer is noted in section 4 only. |
| https://grahammcdonnell.com/ | Does not resolve. The real site, greymac.com, belongs to a creative director, not an editor. Excluded. |

**Finding:** 7 of about 25 editor-related URLs are dead, hijacked, sold or blocked. Editor sites rot fast (see section 5).

---

## 1. Sites reviewed (15 visited live)

### 1A. Editorial houses (top commercial and music video editors)

**1. Final Cut** — https://www.finalcut-edit.com/
- **Editors:** Jim Helton, Adriana Legay, Joe Guest, Jeff Buchanan and others. Offices in London, New York and Los Angeles.
- **Hero:** A near full-bleed frame, offset about 15% from the left edge and flush with the right. A huge client name ("Tiffany & Co.") sits over it, then the project title, then a small "Editor – Jim Helton" line. The type overlaps both the black gutter and the image.
- **Video:** One featured project per full-screen panel, in a vertical scroll. No player chrome is visible, so the video is probably ambient autoplay (inferred).
- **Nav:** A centered "final." wordmark (the "al" turns gray) and a two-line hamburger icon.
- **Type and color:** Geometric sans in three sizes, white on pure black, with no accent color.
- **Footer (from page text):** Office blocks per city with named contacts, sales reps by region, a newsletter link, Instagram and LinkedIn. There is also a "news" section with editor interviews.
- **Memorable:** The offset frame with type bleeding across the gutter, like a magazine spread.

**2. Trim Editing** — https://www.trimediting.com/
- **Editors:** Thomas Grove Carter, Tom Lindsay, Paul Hardcastle, Mikkel E.G. Nielsen (Sound of Metal) and others.
- **Hero:** A horizontal split. The top half is black, with a giant "trim" wordmark drawn in concentric white lines (op-art). The bottom half is full-bleed warm, grainy, 80s/90s-style footage.
- **Video:** A long project list. Each entry credits the Director, Editor, Production Company and Agency.
- **Nav:** Two links only: "Editors" (top left) and "Contact" (top right).
- **Type and color:** A monospace typewriter face for all UI. Strict black and white; the footage supplies all the warmth.
- **Footer:** One line that also credits the site designer and developer ("Design: Workout Services Dev: jrgd + Sans").
- **Flaw:** A default green cookie banner clashes with the identity.
- **Memorable:** The hypnotic op-art logo filling half the viewport. Hard graphic UI against soft, nostalgic film.

**3. Exile Edit** — https://www.exileedit.com/ (observed)
- **Editors:** Kirk Baxter, Eric Zumbrunnen, Matt Murphy, Stephania Bulak and others.
- **Hero / video:** A fullscreen auto-advancing reel, one spot at a time, under a dark overlay.
  - A thin progress bar runs top left.
  - The spot shows client and editor centered ("Adidas" / "Stephania Bulak").
  - The page text lists every spot with a "PLAY" label.
- **Nav:** Split across the four corners: logo top left, EDITORS and MUSIC VIDEOS top right, INSTAGRAM and CONTACT at the bottom.
- **Type and color:** A widely tracked typewriter wordmark, small caps grotesk for UI, and white over darkened footage. The only accent is a hot-pink watercolor skull logo.
- **Memorable:**
  - The four-corner layout keeps the footage dominant.
  - The progress bar makes the home page feel like a playing timeline.
  - The pink skull is the one human, hand-made mark.

**4. Cosmo Street Editorial** — https://www.cosmostreet.com/
- **Video:** Stacked featured cards with Editor, Client, Production and Director. Each card repeats a "Click to play" layer, which suggests a cursor label (inferred).
- **Footer:**
  - Locations (LA, NY, Kansas City, Chicago, Miami)
  - One tone line: "Also known for serving hard and cutting sharp."
  - Site map and socials
- **Flaw:** Webflow placeholder text ("This is some text inside of a div block.") is live in the DOM.
- **Memorable:** One joke line in the footer carries the brand voice.

**5. Whitehouse Post** — https://www.whitehousepost.com/
- **Hero:** A two-sentence tagline: "Editing & Post Production is what we do. London, New York, Chicago & Los Angeles is where we do it."
- **Video:** Tiles with Client / Editor / Spot title.
- **Nav:** Editors, About, Digital, News, Contact.
- **Memorable:** The plain what/where tagline.

**6. Lost Planet** — https://www.lostplanet.com/
- **Editors:** Includes Hank Corwin.
- **Video:** A featured "Spot – Editor" list, then an "All Projects" index with Project / Editor / Director / Client columns. It is probably sortable (inferred from the column headers).
- **Nav:** Home, Editors, About, and a section called "Black Hole".
- **Memorable:** A credits-roll index and a playful section name.

**7. Arcade Edit** — https://www.arcadeedit.com/
- **Video:** A large archive filtered by Category, Brand and Agency (dozens of each).
- **Contact line:** "Did we just become best friends? LET'S TALK" (a Step Brothers quote).
- **Memorable:** The personality lives in the call to action, not the layout.

**8. Mackcut** — https://www.mackcut.com/ (observed)
- **Hero:** No reel. A large hand-drawn black-ink doodle of a figure with its arms flung up, on white. A second doodle appears in the footer.
- **Nav:** Split: ABOUT and EDITORS on the left, the MACKCUT wordmark centered, NEWS and CONTACT on the right.
- **Type and color:** A heavy condensed grotesk. Strict black and white, with a black footer band showing the New York addresses.
- **Memorable:** An illustrated character in place of the expected showreel. Human and self-assured.

**9. Nomad Edit** — https://www.nomadedit.com/us/ (observed)
- **Hero:** A full-width spot with Editor, Director, Production and Agency credits.
- **Work:** A staggered, asymmetric grid on black.
  - Tiles sit offset vertically, with mixed widths and large black gaps.
  - Titles sit in large type on the bottom-center of each image.
- **Nav:** A location switcher (LA / NY / Austin, London, Tokyo). The active city is in blue.
- **Memorable:** The magazine-rhythm grid. Offset tiles break the template 3-column grid.

### 1B. Individual editors

**10. Thomas Grove Carter** (Trim partner editor) — https://thomasgrovecarter.com/ (observed)
- **Hero:** None. A two-column grid of large 16:9 stills (Apple "The Relay", Nike, BBC) with no captions.
- **Nav:** Commercial / Music Video / Short Film / About.
- **Type and color:** A wide-tracked caps serif name and a thin sans nav. White on flat dusty pink (about #E07A7A). Built on Fabrik.
- **Memorable:** The pink. Top editor sites default to black or white; one flat color makes this one instantly recallable.

**11. Cal Laird** (LA commercial / music video editor) — https://www.callaird.com/ (observed)
- **Hero:** A huge heavy caps "CAL LAIRD", then "LOS ANGELES BASED EDITOR", then a full-width reel frame (surreal cloud-people footage).
- **Below the hero:**
  - A yellow ticker of the work categories
  - A "MY CLIENTS" logo row (LEGO, Ford, CBS, NFL, adidas)
  - A "SELECTED WORK" marquee
  - Two big category tiles (Commercial, Music Video)
- **Footer:** A yellow "LET'S WORK TOGETHER" ticker, then a black band with the yellow "C" mark and two link columns.
- **Type and color:** A wide heavy grotesk, black on white, with one yellow accent (about #F9C823).
- **Copy voice:** The bio says he spends nights "pretending he won't tweak the cut one more time".
- **Memorable:** The yellow ticker cutting across dreamy footage.
- **Caution:** Three marquees on one page is a template habit now.

**12. Mauricio Bejota** (trailer / commercial / music video editor) — https://mauriciobejota.com/ (observed)
- **Hero:** A heavy italic caps name, with an embedded Vimeo reel on the left and a first-person intro on the right ("Hi there, I'm Mauricio…").
- **Work:** A four-column thumbnail grid. A thick colored bar under each tile marks the category: yellow = Trailers, pink = Commercials, blue = Music Videos. The same colors mark the category words in the bio.
- **Nav:** Home / Trailers & Promos / Commercials / Music Videos / About me. The background is near black.
- **Memorable:** The color-coded category system works as a legend without filters. His category split is almost the same as Cindy's.
- **Flaws:** Emoji in the page title and in the copy. The rest of the layout is generic.

**13. K. Spencer Jones** (LA film and commercial editor) — https://www.kspencerjones.com/ (observed — counter-example)
- **Hero:** The default YouTube embed with all its YouTube branding, on white, under a dark header bar. The name repeats below the video.
- **Footer:** An unconfigured newsletter block ("This newsletter signup form needs a storage option"), "Copyright 2024" and "Made with Squarespace".
- **Lesson:** Good work, undersold by a stock template and visible neglect.

**14. Sam Mulvey** (London filmmaker / editor) — https://www.sammulvey.net/ (observed)
- **Recognition:** Awwwards Honorable Mention — https://www.awwwards.com/sites/sam-mulvey-portfolio
- **Hero:** None. A fixed left sidebar holds a serif "s.mulvey" wordmark and the lowercase links films / stills / info / contact, plus Vimeo and Instagram icons.
- **Work:** A two-column 16:9 grid on pure black. The tiles were still lazy-loading in the capture.
- **Accent:** One amber active-state color (about #F5B82E).
- **Stills page:** A separate gallery of frames — https://www.sammulvey.net/stills
- **Memorable:** The restraint (a dark screening-room feel) and stills presented as their own gallery.

### 1C. Motion / title designers (best practice for moving work)

**15. Oliver Latta / Extraweg** (Severance titles) — https://extraweg.com/ (observed)
- **Hero:** A full-bleed surreal 3D loop: a pearlescent pink head with tiny hands and one blue eye. No frame or card.
- **Tagline:** "The work of Oliver Latta / Artist, Director, Human."
- **Nav:** A hamburger icon top left and a row of social icons bottom right.
- **Project pages (per Colorlib, not visited):** Split into Film / Stills / Credits.
- **Memorable:** The artwork is the page; the style is clear without copy.

**Secondhand only (not visited; source https://colorlib.com/wp/motion-design-portfolios/):**
- **Mike Labrow:** A 60-second reel with a timestamped breakdown (client, agency, his role) and an "Available for Freelance" ticker.
- **Andreas Wannerstedt:** The home page is only a grid of synced loops, with no headline.
- **Nadia Tzuo:** The home page is a list of titles, newest first, that "reads like a credit roll".
- **Saskia Marka:** One scrolling page. Each title plays in place with stills below it and full team credits.

---

## 2. List A — Baseline (nearly all good editor sites have this)

These items are the floor for Cindy's site, not the creative idea.

1. **Work within one screen.** A reel or frames are visible at once or after one scroll. Text never leads for more than a line. (Trim, Final Cut, Exile, TGC, Sam Mulvey, Nomad)
2. **A category split that matches how clients hire.** (TGC, Cal Laird, Mauricio Bejota, K. Spencer Jones, Arcade)
   - Cindy's four types map 1:1: Short Films / Commercials / Trailers / Music Videos.
3. **A credit line on every project:** Client — Title — Director — Production Co. — Agency. Universal on the editorial houses. Producers read credits to judge level.
4. **One flat background so the footage owns the color.** Black (Final Cut, Exile, Sam Mulvey, Nomad), white (Cal Laird, Mackcut) or one flat color (TGC).
5. **Previews in the index, the full film with sound only on click.** Use muted loops or stills in the grid; the project page or modal plays the real cut.
6. **Minimal nav, 2–5 items.** Trim has two. Exile puts four in the corners.
7. **Location stated.** "Los Angeles based editor" matters for LA hiring.
8. **One obvious contact path.** A nav button or a large footer call to action.
9. **A footer with contact, Instagram and Vimeo / LinkedIn.**
10. **Short copy with one line of personality** (Cal Laird, Arcade, Cosmo Street).

## 3. List B — Standout moves

| # | Move | Where | Why it works / translation for Cindy |
|---|---|---|---|
| B1 | A signature flat color | TGC (dusty pink) | Recall. Editors default to black. |
| B2 | The wordmark as artwork | Trim (op-art "trim") | The logo is the hero. "CUTS" can be built from cut marks or slices. |
| B3 | An offset, magazine frame with type over the gutter | Final Cut | Feels crafted, not templated. |
| B4 | Home page as a playing reel with a progress bar | Exile | The site behaves like a timeline in playback. |
| B5 | A four-corner nav around centered credits | Exile | Zero chrome over the footage. |
| B6 | A color-coded category legend | Mauricio Bejota | Instant scanning. Cindy's four types could each own a color. |
| B7 | A credits-roll / spreadsheet index | Lost Planet, (Nadia Tzuo, secondhand) | Native to an editor's world of bins, EDLs and end credits. |
| B8 | An annotated reel with timestamped credits | (Mike Labrow, secondhand) | A reel with markers per shot. |
| B9 | An asymmetric, staggered grid | Nomad | Breaks the 3-column template rhythm. |
| B10 | A hand-made character instead of a reel | Mackcut | Personality first; fun without gimmick. |
| B11 | One-line voice in the call to action or footer | Arcade, Cosmo Street, Cal Laird | Fun without clutter. |
| B12 | Stills as their own gallery | Sam Mulvey | Frames from the cuts as photography. Light to load. |
| B13 | A hard graphic UI against soft, nostalgic footage | Trim, Cal Laird | The tension reads as taste. |

**Open lane (inference — for the concept phase, not a decision):** No site reviewed uses the editing interface itself as its design language: a timeline as navigation, a playhead, in/out points, cut-on-scroll transitions, bins. Exile's progress bar is the closest. The houses show finished films; nobody shows the cut. That gap fits "Cuts By Cindy".

## 4. Footers observed

- **Final Cut:** Office directory, named people per city, sales reps (utility).
- **Cosmo Street:** Locations, a tone line, a site map, socials.
- **Arcade:** A movie-quote call to action plus an Instagram handle.
- **Trim:** One line that credits the web designers.
- **Cal Laird:** A yellow "LET'S WORK TOGETHER" ticker, then a black band with a monogram and link columns.
- **Mackcut:** A black band with addresses and a small doodle.
- **robin.cv (non-editor, footer reference only):** A rounded inset card filling the viewport, a large "Let's work together" line, an obfuscated email, socials on the bottom row.
- **K. Spencer Jones (anti-pattern):** A broken newsletter block and "Made with Squarespace".

The footer.design findings belong in a separate research file.

## 5. Failure patterns

1. **Dead or hijacked domains.** About 7 of 25 URLs were dead, sold, hijacked or walled.
   - Own the domain long-term.
   - Do not depend on one external video host with no fallback.
2. **Template residue shipped live.** Cosmo Street placeholder text; K. Spencer Jones' unconfigured block and stale copyright year.
3. **Plugin chrome breaking the identity.** Trim's green cookie banner; Nomad's default cookie bar.
4. **Raw third-party embeds as the hero.** YouTube branding over the reel (K. Spencer Jones).
5. **The generic builder look.** Hero reel, 3-column grid, stock footer. SiteBuilderReport's list (https://www.sitebuilderreport.com/inspiration/video-editor-portfolios) has 24 sites, 21 of them on Squarespace or Wix.
6. **Marquee overuse.** Cal Laird uses three on one page.
7. **Heavy video weight.**
   - A1 (https://www.a1.gallery/websites/video-portfolio): "Autoplaying six full-length reels at once is what kills these sites."
   - The fix A1 describes: a poster image first, a short muted loop on hover or in view, the full film on click.
   - Sam Mulvey's tiles were still empty gray boxes at first capture, which shows the cost.
8. **Emoji in titles and copy.** Mauricio Bejota; reads casual, not crafted.

## 6. Limits

- Motion, hover and scroll behavior were inferred from still captures unless marked (observed).
- Only home pages were reviewed. Project detail pages were not opened.
- Mike Labrow, Andreas Wannerstedt, Nadia Tzuo and Saskia Marka are secondhand from Colorlib.
- Whitehouse Post, Lost Planet, Arcade and Cosmo Street were read as page text, not with a visual check.

## 7. Sources visited

- https://www.finalcut-edit.com/
- https://www.trimediting.com/
- https://www.exileedit.com/
- https://www.cosmostreet.com/
- https://www.whitehousepost.com/
- https://www.lostplanet.com/
- https://www.arcadeedit.com/
- https://www.mackcut.com/
- https://www.nomadedit.com/us/
- https://thomasgrovecarter.com/
- https://www.callaird.com/
- https://mauriciobejota.com/
- https://www.kspencerjones.com/
- https://www.sammulvey.net/
- https://extraweg.com/
- https://robin.cv/ (footer reference only)
- https://colorlib.com/wp/motion-design-portfolios/
- https://www.a1.gallery/websites/video-portfolio
- https://www.sitebuilderreport.com/inspiration/video-editor-portfolios
- https://lesfm.net/blog/video-editor-portfolio-examples/
- https://www.awwwards.com/sites/sam-mulvey-portfolio
