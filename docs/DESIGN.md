---
name: Cuts By Cindy
description: A video editor's portfolio built as her edit bay, readable by people who have never opened one.
colors:
  page: "#060607"
  bay: "#0E0E10"
  panel: "#1A1A1E"
  track: "#2A2A30"
  track-hi: "#34343B"
  line: "#3A3A42"
  monitor-fill: "#232328"
  slate: "#F3EBDD"
  paper: "#F4F1EA"
  dim: "#A9A59C"
  faint: "#77746D"
  ink: "#0E0E10"
  cut: "#FF3B2F"
  cut-text: "#FF5A4F"
  marker: "#F5D90A"
  audio: "#2EC4B6"
  audio-bg: "#17403D"
  clip-short: "#7BC67E"
  clip-com: "#F28C38"
  clip-mv: "#B48CF2"
  clip-trl: "#5AA9F2"
  appbar: "#1C1C1F"
  appbar-ink: "#F2F2F2"
typography:
  display:
    fontFamily: "Clash Display, Arial Narrow, sans-serif"
    fontSize: "clamp(40px, 7.4cqw, 124px)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Clash Display, Arial Narrow, sans-serif"
    fontSize: "clamp(36px, 5cqw, 72px)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Clash Display, Arial Narrow, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.05
  body:
    fontFamily: "General Sans, -apple-system, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
  timecode:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
rounded:
  xs: "2px"
  sm: "3px"
  md: "6px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "48px"
  3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.cut}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cut-text}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  workspace-tab:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.dim}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "36px"
  workspace-tab-current:
    backgroundColor: "{colors.track}"
    textColor: "{colors.paper}"
  contact-tab:
    backgroundColor: "{colors.cut}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "36px"
  chip-category:
    backgroundColor: "{colors.track}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xs}"
    padding: "0 12px"
    height: "44px"
  input:
    backgroundColor: "{colors.track}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xs}"
    padding: "10px 12px"
    height: "48px"
  clip-row:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px"
  label-chip:
    backgroundColor: "{colors.bay}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
---

# Design System: Cuts By Cindy

## Overview

**Creative North Star: "The Edit Bay"**

The site is Cindy's edit bay: a full-screen editing app with an app bar, workspace tabs, a project bin, a program monitor, an inspector, a timeline with audio meters, and a status strip. Every editor detail is real. Timecode counts real frames, markers carry real notes, color sorts real categories, and the waveform comes from the clip's own audio. An editor must call it "accurate", not "a costume".

The bay is for the work, not about the interface. The program monitor is the largest object on every screen. Panels sit around it in slim, quiet strips, and they open more when a visitor reaches for them. Producers, directors, and brand people who never open Premiere must find a video and a way to contact Cindy without reading any instructions. Each editor word has a plain word with it.

The surface is dark, flat, and dense, like a real NLE at night. Depth comes from tonal panels and 2px seams, not shadows. Color is functional: one red for the cut and the primary action, one yellow for markers, teal for audio, and four category colors for wayfinding.

**Key Characteristics:**
- Dark-only, flat panels with 2px `bay` seams between them.
- The program monitor leads; panels are slim at rest.
- Editor language with a plain partner on every label.
- Category color is the wayfinding system, used the same way everywhere.
- Motion is counted in frames at 24 fps.

## Colors

A near-black bay with warm off-white text, one hot red, and a small set of functional signal colors.

### Primary
- **Razor Red** (cut): the playhead, the razor blade, the primary button, the CONTACT tab, and the focus ring. It means "the action" and "the cut".
- **Razor Red, Text** (cut-text): red used as text, for errors, Media Offline, and pressed toggles. It is lighter than Razor Red so that it passes contrast on panels.

### Secondary
- **Marker Yellow** (marker): timeline markers, feedback pins, and the clip hover outline. It means "a note is here".
- **Meter Teal** (audio): the waveform, the audio meters, and OK messages in the status strip. **Teal Well** (audio-bg) is the A1 track tag background.

### Tertiary (category colors)
- **Short Films Green** (clip-short), **Commercials Orange** (clip-com), **Music Videos Violet** (clip-mv), **Trailers Blue** (clip-trl). Each one marks its category on bin dots, track edges, clip bands, chips, and kickers.

### Neutral
- **Outer Black** (page): behind the app frame only.
- **Bay Black** (bay): the app background and the seams between panels.
- **Panel Graphite** (panel): panels and neutral navigation clips.
- **Track Graphite** (track) and **Track Lift** (track-hi): tracks, inputs, chips at rest; hover and selected.
- **Divider** (line): 1px dividers and secondary button borders.
- **Monitor Fill** (monitor-fill): the monitor before a poster loads.
- **Slate Paper** (slate): marker notes and the dialog title strip, with ink text.
- **Paper White** (paper): primary text, 17:1 on bay.
- **Label Gray** (dim): labels and metadata, at least 5:1 on every surface.
- **Tick Gray** (faint): ruler ticks and decorative lines only. Never text.
- **Ink** (ink): text on red, slate, and filled chips.
- **App Bar** (appbar) and **App Bar Ink** (appbar-ink): the top app bar only.

### Named Rules
**The One Red Rule.** Razor Red means the cut or the primary action. It never decorates.

**The Color Is a Category Rule.** The four clip colors mark categories and nothing else. A category keeps its color on every page.

**The Banned Pairs Rule.** Never paper on cut (3.15:1). Never cut as small text on track (4.02:1); use cut-text on panel. Never faint as text.

## Typography

**Display Font:** Clash Display (self-hosted with `next/font/local`; fallback Arial Narrow)
**Body Font:** General Sans (self-hosted; fallback system sans), for bios, descriptions, and long copy
**Label/Mono Font:** JetBrains Mono (`next/font/google`), for UI, labels, credits, and timecode

**Character:** a condensed, confident display face for titles, mono for everything that would be in an NLE's interface, and a quiet sans so that a visitor can read a bio without strain.

The app bar uses the system font at 13px. This is its only use.

### Hierarchy
- **Display** (700, clamp(40px, 7.4cqw, 124px), 0.88, uppercase): the lander hero, "THAT'S A WRAP.", and the Media Offline card.
- **Headline** (600, clamp(36px, 5cqw, 72px), 0.95): the page title (H1).
- **Title** (600, 28px, 1.05): section titles (H2). The H3 is 20px/1.2. Track names are 20px/1.1.
- **Body** (400, 16px, 1.6, max 62ch): bio, clip descriptions, Recent Cuts copy, and dialog help text.
- **UI** (400, 13px, 1.5): buttons, inspector values, clip row titles, menus.
- **Label** (500, 11px, +0.08em, uppercase, dim): kickers, field names, panel tabs, track heads.
- **Timecode** (500, 14px, tabular numbers): the master timecode (12px on phone).

### Named Rules
**The Text Floor Rule.** No functional text under 11px on desktop or 12px on phone. That includes ruler labels, track ids, pin labels, and canvas text.

**The Mono Is Interface Rule.** Mono sets interface, not prose. Any paragraph longer than two lines uses Body.

## Layout

The frame is a full-viewport app on a CSS grid with 2px seams. The breakpoints are container queries on the app frame, not viewport queries.

**Desktop (app ≥ 1280px), from top to bottom:**
- App bar, 26px.
- Workspace tabs, 36px.
- Work area: the bin, the stage (main + inspector), and the timeline band.
- Status strip, 24px.

**Work area at rest:**
- **Bin:** a 48px rail of category dots and icons. It opens to 240px on click and remembers the choice.
- **Program monitor:** `width: min(100%, calc(64vh * 16 / 9))`, centered. It is sticky on category pages. There its height also leaves 320px of the stage free (`calc((stage height - 320px) * 16 / 9)`), so the first clip row shows on first view.
- **Category head:** the breadcrumb, then the title (clamp(28px, 3.2cqw, 44px)) and the category chips in one wrapping row.
- **Inspector:** 360px, 440px on detail pages.
- **Timeline band:** at most 160px at rest (ruler, V1 Pages, one context track, A1). It opens to full height on hover, on focus, or from the Window menu.
- **Audio meters:** 112px, at the right of the timeline.

**Breakpoints:**

| App width | Change |
|---|---|
| ≤ 1279px | The bin rail is hidden. |
| ≤ 1023px | The inspector stacks under the main column. The meters, the timeline range, odd ruler labels, and the middle status items are hidden. |
| ≤ 767px (phone) | The status strip is hidden. A 56px bottom bar holds Prev, Play, Next, the current timecode only, and a Tracks handle. The timeline becomes a drawer (max 62% height) with 48px tracks and a 44px ruler. The app bar grows to 44px. Workspace tabs scroll sideways, and CONTACT stays pinned at the right. Clip rows use a 112px thumbnail. The razor cut runs horizontally. |

**Lander:** the reel's poster is a strong, bright frame. One primary "Play reel" button starts the reel with sound. There is no instruction text in the hero.

**Spacing:** the scale is 2 / 4 / 8 / 12 / 16 / 24 / 48 / 96. The gutters are 16px (12px on phone) and respect safe areas. Credits padding is 96px on top and 64px at the bottom.

### Named Rules
**The Monitor Leads Rule.** On every screen, the program monitor or the page's main picture is the largest object. If a panel competes with it, the panel collapses.

**The Plain Partner Rule.** Every editor label has a plain label next to it or under it: "Export (send message)", "V1 Pages" with "Pages", "Yellow pins = feedback rounds".

**The Thumb Wins Rule.** On phone, every tap target is at least 44 × 44px. When a desktop height is smaller (the 26px app bar, the 30px ruler, 44px tracks), the phone version grows to fit the target.

## Elevation & Depth

The system is flat. Depth comes from tonal steps (bay → panel → track → track-hi) and 2px bay seams. There are only two shadows: the app bar dropdown and the hero text shadow over video.

### Shadow Vocabulary
- **Dropdown** (`box-shadow: 0 10px 30px rgba(0,0,0,.55)`): app bar menus only.
- **Hero over picture** (`text-shadow: 0 2px 12px rgba(0,0,0,.6)`): display text set on a video frame.

### Named Rules
**The Seam Not Shadow Rule.** Panels separate with 2px bay seams. Never add a shadow to a panel or a card.

## Shapes

The corners are small and square, like an NLE interface:
- 2px on chips and inputs.
- 3px on buttons, rows, and clips.
- 6px on menus.

There are no pills and no circles, except the record dot and the category dots. Every panel names itself in a 28px tab strip. The tab in use has a 2px red top inset, like an in-point. Clips have a 4px category band on top (6px when selected). Markers are small yellow pentagons.

## Components

### Buttons
- **Shape:** squared (3px).
- **Primary:** Razor Red fill, ink text, UI type at 700, 48px tall (52px in the credits). Hover uses Razor Red, Text. Active moves down 1px. Focus is a 2px paper outline.
- **Secondary:** transparent, with a 1px divider border and paper text. Hover changes the border to paper.

### Chips
- **Category chip:** 44px tall, track fill, an 8px category dot, and the label "Commercials (05)". Pressed: category color fill, ink text, ink dot.
- **Label chip:** a solid bay chip with paper label text. It holds every label that sits on a poster or film strip.

### Cards / Containers
- **Panels:** panel fill, no radius, no shadow, a 28px tab strip on top.
- **Clip row:** a 160px thumbnail with a number chip, the title, the client · production company · year, **a 1–2 line description in Body**, and the runtime. It has a 4px category band on top. Hover: a 1px marker inset. Selected: a 2px paper outline.

### Inputs / Fields
- **Style:** track fill, a 1px divider border, 2px radius, 48px tall (textarea 96px).
- **Focus:** a 2px Razor Red border.
- **Error:** a cut-text border and an error message under the field in plain words.

### Navigation
- **App bar (26px; 44px on phone):** a CBC mark (never an OS logo), the brand name (goes home), and the menus File, Clip, Window, and Help. The menus are dropdown buttons with clear item labels, not a fake OS menubar. At the right: a mute toggle (24×24 target), a record dot while video plays, and the Los Angeles clock.
- **Workspace tabs (36px, 44px on phone):** Home, Projects, Recent Work, About. They are the main navigation. The current tab has a track fill, paper text, and a 2px red top inset.
- **CONTACT tab:** Razor Red fill. It opens the contact dialog.
- **Bin rows, V1 Pages clips:** secondary paths to the same pages. They never replace the tabs.

### Program Monitor (signature)
- A 16:9 black frame with title-safe corners and a burn-in strip (file name and source timecode).
- **Poster first.** No video loads until the visitor clicks play.
- Hovering a clip or track changes the poster only.
- Media Offline is the error card. A 2px render bar shows loading. There is never a spinner.

### Transport and Keys (signature)
- **Transport buttons:** 40px on desktop, 44px on phone.
- **J:** back 5 s.
- **K:** pause.
- **L:** play.
- **← / →:** previous or next clip.
- **M:** mute.
- **?:** opens the shortcuts sheet.
- Space and Enter always press the focused button or link. The letter and arrow keys work everywhere, except while the visitor types in a field.
- The inspector key hint ("Scroll, or ← / → to move…") shows on desktop only.

### Timeline (signature)
- **Ruler:** 30px, with frame-accurate ticks.
- **Video tracks:** 44px, with film-strip clips. Each clip's label sits on a label chip.
- **A1:** a waveform from peaks data that is made at upload time.
- **Playhead:** 2px Razor Red, moved with `transform`.
- **Markers:** they open their slate note on hover, on focus, or on tap. The note opens downward, over the tracks, so the band's top edge never clips it. On phone each marker has a 44 × 44px hit area; the drawn pin does not change.
- **Notes near an edge:** every marker and pin note moves sideways to stay at least 8px inside the app frame.

### Contact Dialog ("Export Settings")
- The slate title strip reads "Export Settings — Send Cindy a message".
- **Fields:** Name, Email, Project type (Short Film / Commercial / Music Video / Trailer / Other), and Message.
- The button reads "Export (send message)".
- Cindy's email and a Copy button are always visible in the dialog.
- **States:**
  - Idle.
  - Error, with a plain message at the field.
  - Sending, with a real progress state.
  - Success: "Export complete. Cindy will reply within 2 business days." The reply time is a placeholder until Cindy confirms it.
  - Failure: the email and a Copy button.
- After each state change, focus moves to the new message, and the live region reads it.
- The draft stays when the dialog closes.

### End Credits (signature)
- A black block at the end of every page: credit lines (Edited by, Contact, Instagram, Vimeo, Resume, Based in), one client marquee, "THAT'S A WRAP.", and "Start a project".
- The marquee pauses on hover, and a click on it toggles pause. It has no button. It also pauses while keyboard focus is anywhere in the end credits. It is static under reduced motion.

### Razor Cut (signature motion)
- A page change is a 17-frame cut (708 ms at 24 fps):
  1. The blade drops at the clicked point.
  2. The page splits in two halves.
  3. The halves part to show the new page.
- On phone the cut is horizontal.
- Under reduced motion, it is a 200 ms crossfade.
- Input stays active during the cut. A second click finishes the cut at once and goes to the new target.

### Admin Panel
- This tool is for Cindy only, so it has no editor costume.
- It uses the same color tokens, Body and UI type, and shadcn/ui forms on panel surfaces.
- The primary button is Razor Red. Tables use the track and panel tones.
- Each category in the list has its category color dot.

## Do's and Don'ts

### Do:
- **Do** keep the program monitor the largest object on every screen (`min(100%, calc(64vh * 16 / 9))` on desktop).
- **Do** put a plain label with every editor word ("Export (send message)").
- **Do** put every label that sits on an image on a solid bay label chip.
- **Do** load video only on click, and show a poster before that.
- **Do** keep J/K/L as in Premiere (back, pause, play) and use arrows for clips.
- **Do** keep touch targets at 44px on phone and at least 24px on desktop.
- **Do** use the CBC mark in the app bar.
- **Do** write "Adobe Media Encoder" in the tools list.

### Don't:
- **Don't** show an Apple logo or any OS logo.
- **Don't** put instruction text ("Press L for sound…") in the hero or on phone.
- **Don't** set functional text under 11px (12px on phone), or use Tick Gray as text.
- **Don't** set paragraphs in mono.
- **Don't** add shadows to panels, rows, or cards.
- **Don't** let Space or Enter do anything but press the focused control.
- **Don't** let a note or tooltip run past the app frame.
- **Don't** start video or a download on hover.
- **Don't** use pills, gradients on surfaces, or color that does not carry a meaning.
