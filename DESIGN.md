---
name: Suzana Galery
description: A warm pink paper vitrine for three Hu Tao illustrations.
colors:
  paper: "#f7f1ec"
  paper-blush: "#fdf5f3"
  hero-rose: "#f391a5"
  hero-rose-light: "#f7a7b4"
  hero-rose-deep: "#ef7f94"
  wine: "#4a1420"
  ink: "#251b1e"
  ink-soft: "#6c5b5f"
  muted: "#786569"
  rose-wash: "#fbe0e5"
  rose-ink: "#b34a61"
  berry: "#c4425c"
  berry-deep: "#a92e49"
  cherry: "#d8415e"
  charcoal: "#2a2023"
  pill-text: "#8f3547"

typography:
  display:
    fontFamily: "Gabarito, Inter, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.35vw, 60px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Gabarito, Inter, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Gabarito, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Gabarito, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Gabarito, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.09em"
  ui:
    fontFamily: "Gabarito, Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.015em"

rounded:
  pill: "999px"
  hero: "34px"
  frame: "26px"
  mat: "21px"
  card: "19px"
  panel: "18px"
  work: "17px"
  thumb: "12px"
  chip: "11px"
  focus: "8px"
  bar: "3px"

spacing:
  gutter: "26px"
  shelf: "16px"
  stack: "11px"
  topbar: "38px"
  hero-foot: "24px"

components:
  button-primary:
    backgroundColor: "{colors.berry}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0 19px"
    height: "38px"
    typography: "600 13px/1 Gabarito, system-ui, sans-serif"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.54)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 19px"
    height: "38px"
  icon-chip:
    backgroundColor: "{colors.charcoal}"
    textColor: "#fdf7f4"
    rounded: "{rounded.chip}"
    width: "36px"
    height: "36px"
  search-pill:
    backgroundColor: "{colors.rose-wash}"
    textColor: "{colors.pill-text}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  scene-card:
    backgroundColor: "#fffaf7"
    rounded: "{rounded.mat}"
    padding: "5px"
  work-row:
    backgroundColor: "rgba(255, 255, 255, 0.72)"
    rounded: "{rounded.work}"
    padding: "8px"
  autoplay-toggle:
    backgroundColor: "rgba(74, 20, 32, 0)"
    textColor: "{colors.wine}"
    rounded: "{rounded.pill}"
    width: "26px"
    height: "26px"
  viewer-shell:
    backgroundColor: "#fbf6f2"
    rounded: "{rounded.frame}"
    padding: "14px"
---

# Design System: Suzana Galery

## Overview

**Creative North Star: "The Living Paper Vitrine"**

A warm cream page holds one saturated pink stage. The illustration is the only sharp, saturated object on it; everything else is soft paper, wine-colored type, and quiet pink controls. The world is intimate and small on purpose: three works, one character, one author, a collection that feels pinned to a desk rather than loaded from a database.

The interface behaves like gallery furniture: a mark, a navigation line, two account actions, pagination bars with an autoplay switch, arrows placed outside the frame. Inside the stage the hero is layered — pale orbs, a 45%-soft-light grain, drifting petals, a cursor-following spot, and a print that lifts off the rose. State motion is slow and buoyant (0.25–1s on one easing curve); parallax uses a second, softer curve, and ambient drift runs at 8s. The 7.8s autoplay starts paused under reduced motion and can be stopped by hand. The system is one font family and a very small set of surface recipes; the richness comes from layering and warmth, not from added components.

**Key Characteristics:**
- Cream paper with a blush top edge, fixed fine grain at 32% multiply, and no cool greys anywhere.
- One rose stage with wine type; berry is reserved for the single filled account action.
- Gabarito alone (400–900, self-hosted, `swap`), from display to footer.
- Pill actions, rounded image mats, circles for arrows and closes; no square corners.
- Soft plum shadows with large blur and negative spread; no hard offset shadows, almost no 1px outlines.
- The hero print is provisional; `.hero__art.is-framed` is the documented swap point for transparent cutouts.

## Colors

The palette is one warm family — paper, rose, wine, berry — with charcoal for dark actions, selected states, and floating surfaces. Every neutral leans plum.

### Primary
- **Stage Rose** (#f391a5): the `.hero` base fill beneath the visible scene. The field itself is a 106° gradient from Rose Light (#f7a7b4) through #f38d9f at 58% to Rose Deep (#ef7f94), which is what gives the stage its light-left / deep-right weight.
- **Rose Light** (#f7a7b4) and **Rose Deep** (#ef7f94): the two ends of that stage gradient, not used as flat fills on their own.

### Secondary
- **Wine Ink** (#4a1420): all type inside the hero — title, description, mark, active pagination bar, art focus ring. It is the only ink allowed on rose.
- **Berry** (#c4425c) → **Berry Deep** (#a92e49): the single filled call to action ("Criar conta"), as a 180° gradient with a 1px inner white highlight. White on berry measures 4.91:1 at the top stop and 6.62:1 at the bottom.
- **Rose Label** (#b34a61): metadata on paper — work metadata lines and empty-state links. 4.61:1 on paper.
- **Pill Wine** (#8f3547): text on the pink search-pill wash. 5.70:1 on its own gradient.

### Tertiary
- **Cherry** (#d8415e): focus outline and hover accents on arrows, keep-close buttons, and the extra-row arrow. Never a large fill.
- **Petal Wash** (#fbe0e5): image placeholders and viewer-control hover.

### Neutral
- **Paper Cream** (#f7f1ec): the page floor; the body gradient starts at Blush Paper (#fdf5f3), passes #f9f0ec at 26%, and settles here.
- **Aubergine Ink** (#251b1e): body and headline text on paper; 14.95:1.
- **Soft Plum Ink** (#6c5b5f): secondary icon color (shelf chevrons); **Quiet Plum** (#786569): 11–12px metadata and footer text; 4.85:1.
- **Charcoal** (#2a2023): dark surfaces — toast, "Ver mais" hover, active search pill, icon chips; the dark-action surface, never a page background.

**The Wine-On-Rose Rule.** Type on rose is always Wine Ink (#4a1420), never body ink or black. It holds 6.66:1 on the base rose and 5.76:1 on the deepest stop, so normal-size text passes AA anywhere on the stage.

**The One Filled Action Rule.** Berry appears once per viewport, on "Criar conta". Secondary actions use the ghost outline or the pink wash; selected states use charcoal. If two berry filled buttons are visible, one is wrong.

**The Warm Neutral Rule.** No pure grey, no pure black, no cool white as a field. White is a material accent only: the 7px print mat (#fff8f3), the scene mat (#fffaf7), and the viewer shell (#fbf6f2).

## Typography

**Display Font:** Gabarito, 400–900 variable, self-hosted as two woff2 subsets (latin and latin-ext) with `font-display: swap`. The declared fallbacks are Inter, then system-ui; no other family is loaded.
**Body Font:** the same Gabarito stack.

**Character:** a single geometric-humanist voice. The display is tight and heavy; body copy is small, quiet, and slightly loose. Hierarchy is made by size and weight, never by adding a second typeface.

### Hierarchy
- **Display** (700, `clamp(38px, 4.35vw, 60px)`, 0.98, −0.028em): the hero title only, in Wine Ink. Letters are split into `.ch` spans for the entrance.
- **Headline** (600, 21px, −0.012em): shelf headings ("Cenas de Hu Tao", "Buscas recentes").
- **Title** (650, 18px, −0.01em): viewer title; work rows step down to 13.5px at the same weight.
- **Body** (400, 15px/1.5): page default. Hero description uses `clamp(12.5px, 1.02vw, 14.5px)` / 1.58 at 29rem; work descriptions are 12px/1.45.
- **Label** (500–600, 11–12px, uppercase, 0.08–0.09em): footer (11px), work metadata (12px), the "RECENTE" state tag (12px), the desktop art hint.
- **UI** (500–600, 13–14px): nav links, buttons, search pills.

**The Single Family Rule.** Gabarito is the only family. The Inter fallback is declared but never fetched; do not load it or add a second display face.

**The Tight Display Rule.** The negative tracking and 0.98 line-height belong to the hero title alone. Body copy keeps its default 1.5 and zero tracking.

**The Uppercase-Is-Metadata Rule.** Uppercase with letterspacing is reserved for metadata, state tags, and the footer. It never introduces a section.

## Layout

A centered shell carries the page. The top bar is a three-column grid (`1fr auto 1fr`) 98px tall at desktop (22px top + 38px control + 38px bottom), with brand and chips left, nav centered, auth actions right.

The hero sits in a three-column stage (`36px minmax(0,1fr) 36px`, 8px gaps) capped at 1252px, which yields a 1164px card at ≥1278px. The card is `clamp(382px, 33vw, 474px)` tall at a 34px radius. Copy starts at 8.5% left and 30% top, capped at 48%/480px; the foot sits at 8.5% left, 24px above the bottom, with the pagination bars and a 26px autoplay circle 12px apart; the art occupies 34% width at 4% right, bleeding 2.5% above the card (≈12px). Arrows live outside the card, one per 36px gutter.

Below, the boards shell is 1180px wide with a 34px top margin, three unequal columns `1.06fr 0.9fr 1.02fr` and a 26px gutter. The rhythm is the built one, not an 8px scale: 11px between repeated cards and list rows, 16px under shelf headings, 26px between columns, 24px for the hero footer inset, 34px between hero and shelves.

**Responsive behavior (as shipped):**
- **≤1080px:** shell becomes `100vw − 44px`, stage `100vw − 30px`; boards fold to two columns with works spanning full width as a three-up row; thumbnails go 1.35:1; hero copy widens to 50%.
- **≤860px:** top bar becomes two rows (brand + auth, nav beneath, centered); arrows shrink to 28px; hero grows to 540px at 28px radius, copy to 7%/14%, art to 64% starting at 42.5%; boards stack to one column; work rows return to horizontal; the art hint hides; pagination bars shrink to 34/48px and the autoplay circle moves to the hero's top-right (18px top, 20px right) on a 22% white field.
- **≤520px:** shell `100vw − 32px`, stage `100vw − 16px`; arrows hide; hero 560px at 24px radius; title fixed at 39px; art 62% at 45%; pagination bars shrink to 26/36px.
- **Touch (`hover: none`):** the cursor spot, art hint, and pill slide are disabled.

**The Stage-Not-Card Rule.** The hero is the only full-color page field. Shelves sit directly on paper without their own page-level panels; each item carries its own mat or wash.

## Elevation & Depth

A hybrid: a flat paper field whose components lift on diffuse, warm plum shadows. Shadows use `rgba(96, 42, 54, …)` with 40–86px blur and negative spread, so edges stay soft and never read as grey. The one inset white line on the hero is a paper-edge highlight, not a bevel. Hover raises by 2–4px and deepens the same shadow; nothing gains a border as it lifts.

### Shadow Vocabulary
- **Card lift** (`0 12px 26px -22px rgba(96, 42, 54, 0.7)`): scenes, keeps, extra rows. The default resting lift.
- **Soft hover** (`0 22px 44px -30px rgba(96, 42, 54, 0.42)`): scene and keep hover.
- **Hero field** (`0 44px 86px -58px rgba(150, 50, 70, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.36)`): the pink stage itself.
- **Print lift** (`0 40px 64px -30px rgba(58, 30, 36, 0.48)` plus `inset 0 3px 0 rgba(255, 255, 255, 0.4)`): the framed artwork in the hero.
- **Viewer** (`0 60px 120px -40px rgba(34, 10, 18, 0.75)`): the modal shell over a `rgba(38, 20, 26, 0.52)` backdrop blurred 16px and desaturated to 0.9.
- **Toast** (`0 20px 40px -20px rgba(20, 6, 12, 0.8)`): the floating status pill.

**The Warm Shadow Rule.** Shadows are plum, never neutral black. Blur is large, spread is negative; a shadow that reads as a grey halo is off-world.

**The Lift-Not-Outline Rule.** Depth comes from shadow and a 1–2px translate. Standing outlines are hairlines on the ghost button (24% ink) and the viewer controls (12% ink); no card surface gains a border.

## Shapes

Form language is pill-and-mat: every action that is a word is fully rounded; every image sits on a rounded mat; every corner is generous. Circles are used for navigation arrows, close buttons, the mark, the autoplay toggle, and the heart seal.

- **Pill (999px):** all word actions — account buttons, search pills, toast, state tags, skip link.
- **Icon chip (11px radius):** 36px square (32px at ≤520).
- **Hero (34px):** 28px at ≤860, 24px at ≤520. The art button inherits the bottom-right radius so the click target matches the card.
- **Framed print (26px):** 22px at ≤860; the mat is 7px (6px at ≤860) in #fff8f3 with a −2.2° rotation on the front print.
- **Scene card (21px):** 5px white mat around a 16px-radius image.
- **Keep tile (19px), work row (17px), "Ver mais" (16px), thumbnail (12px).**
- **Pagination bars:** 3px tall, 3px radius, 44px wide (34 at ≤860, 26 at ≤520), active 64px (48/36), in a 24px-tall hit area.
- **Autoplay toggle:** 26px circle, transparent at rest, filled Wine at 88% when paused, with a 12px icon.
- **Focus:** 2px Cherry outline, 3px offset, 8px radius; the hero art overrides to 2px Wine inset −6px.

**The Pill-Or-Mat Rule.** If it is an action, it is a pill. If it is an image, it is a rounded mat with an inset image radius. Never a square interactive box.

**The Frame-Is-Provisional Rule.** `.hero__art.is-framed` is the only place the white print mat, cover crop, and −2.2° rotation exist. When the client delivers transparent cutouts, remove `is-framed`; the base `.hero__img` is `object-fit: contain`, anchored bottom center, with no border, so the character bleeds directly out of the rose. Do not delete the framed styles until the cutouts have been approved.

## Components

### Hero stage
The signature surface. A rose gradient layer holds two pale orbs, a 45%-soft-light grain, a canvas petal field (14 petals ≤700px wide, 22 above), and a hover spot that follows the pointer only on fine pointers. The mark is 46px Wine Ink (40px ≤860), rotating −12° on hover. The copy is Wine Ink over the rose; the art is the framed print at 34% width. Two stacked images swap on slide change: outgoing fades to blur(10px)/scale(1.035)/translateY(16px), while incoming resolves through a 1s circular clip-path (from 74%/58%, radius 0 → full) and then floats ±9px over 8s. The large pale orb breathes on a 9s `haloPulse` scale/opacity cycle. The 7.8s autoplay pauses on hover, focus, hidden tab, or open viewer, and starts paused under reduced motion. The desktop hint ("toque na arte") is a 12px uppercase white-on-wine translucent pill; hidden below 860px and on touch.

### Pagination, autoplay, and arrows
Bars are Wine Ink at 38% opacity at rest, 58% hover, full Wine when active; the active bar widens. The autoplay toggle is a 26px circle with a 1px 28%-Wine border, transparent at rest and Wine at 88% when `.is-paused`, its 12px play/pause icon flipping from Wine to #fff4f6. Its accessible name switches between "Pausar apresentação" and "Reproduzir apresentação"; it exposes state through that name and the `.is-paused` class, not `aria-pressed`. At ≤860px it detaches to the hero's top-right (18px/20px) on a 22% white field while the bars stay bottom-left.
Arrows are transparent 36px circles with a #d76c85 chevron; hover paints white, shifts to Cherry, scales 1.06. Arrows are 28px at ≤860 and hidden at ≤520. All are real buttons with visible focus.

### Buttons and icon chips
- **Primary:** berry 180° gradient, white 13px/600, 38px tall, 19px side padding, 999px radius, warm berry shadow and a 1px top inner white line. Hover lifts 1px and widens the glow; active returns and scales 0.98.
- **Ghost:** 54% white over the paper, 24% ink border, ink text; hover goes solid white with a soft shadow.
- **Icon chips:** 36px, 11px radius, 17px stroke icon. Ink chip uses #33272a→#231a1c with #fdf7f4; the rose chip uses #f9b0bd→#f294a6 with #6b2434 and opens the local acervo. Hover lifts 2px; active scales 0.96.

### Search pills
44px tall, fully rounded, a pink wash (#fbe3e8→#f8d7de) with Petal Wash as the base, Pill Wine 13.5px/600 text, a 5px currentColor dot, and an inset white top line. Hover slides 4px and darkens the wash. The active pill is the charcoal surface (#322629→#221a1c) with #fff7f4 text and no slide. Each is a toggle with `aria-pressed`.

### Scene cards and work rows
Scenes are white mats (5px, 21px radius) on a 0.84 aspect ratio, rotated −2.4°, +2.4° with a 12px drop, and +4° with 18px drop for the collapsed third card. Hover flattens rotation and lifts 4px; the image scales 1.055. The third card reveals only when "Ver mais" expands the row, which also widens the grid from `1.08fr 0.94fr 0fr` to three equal columns.
Work rows are 72% white at 17px radius, 8px padding, a 72px 12px-radius thumb, a 13.5px/650 title, a 12px uppercase Rose Label metadata line, and a two-line 12px Quiet Plum description. Hover lifts 2px and turns the surface white.

### Keep cards and recent state
Two 19px-radius tiles on a rose gradient (#f8aab7→#ee8297) with a desaturating overlay, a 62%-white heart seal bleeding from the lower left, and a "RECENTE" tag: 12px/600 uppercase at 0.1em on a 74% deep-wine pill, blurred 6px. The tile is a full-area open control that launches the viewer; the close is a 27px charcoal circle above it that rotates 90° on hover and turns Cherry. Removing a card plays a 0.42s shrink/blur exit, then the shelf reports "1 recente oculto" / "N recentes ocultos" in a `role="status"` live region with a Restaurar link; restoring re-enters over 460ms and announces "Recentes restaurados."

### Viewer dialog
A native `<dialog>` with a #fbf6f2 shell at 26px radius and 14px padding over a blurred plum backdrop. The frame is an 18px-radius variable surface per work (#eee2e8, #f2dcdb, #f6e1e3), with the image contained. The title is 18px/650 and the note is 12px uppercase Quiet Plum. The close is a 34px white circle with a 12%-ink border, rotating 90° on hover; previous/next are 36px white circles that tint to Petal Wash. Width is fitted to the image ratio in JS, capped by the viewport. Arrow keys navigate while open.

### Acervo local (modal)
A native `<dialog class="archive">` for configuring categories from the photographs already in `assets/Suzana`. It is a working tool inside the same paper-and-rose world, not a new visual identity.

- **Shell:** min(1080px, 100vw − 24px), #fbf6f2, 28px radius, 22px padding, 60px mulberry shadow; the header is fixed, the body scrolls, and a 79px footer keeps Save visible.
- **Body:** 292px category rail + fluid editor at ≥981px; single column with the editor first below 981px. The category rail is a 52%-white panel with 42px thumbs and a count badge.
- **Fields:** Gabarito 16px inputs on #fffaf7, 13px radius, 1px #ecd9d6 border, Cherry-tinted focus ring; uppercase 12px Rose Label field labels; description counter in Quiet Plum.
- **Photo library:** 82px square tiles (70px ≤560px), 11px radius, 8px gaps, 286px internal scroll; each tile is a toggle with `aria-pressed`; selected tiles carry a 4px Wine ring and a tabular Wine order badge. A 36px search pill filters by filename.
- **Selection rail:** 58px square tiles in click order, numbered 1…N, draggable to reorder; 24px charcoal remove buttons; "Limpar" confirms above eight items. This rail is the order that gets saved.
- **Footer:** berry Save always visible, quiet Cherry delete when editing, `role="status"` save confirmation, inline error, and a two-step delete confirmation in a pink panel.
- **Data:** photos are never uploaded or copied. The record in `localStorage` (`suzana-galeria-categorias-v1`) stores the category name, description, and an ordered array of original filenames. `scripts/build-suzana-assets.py` generates the manifest (`js/suzana-assets.js`) with `name`, `src`, `thumb`, and dimensions; HEIC/HEIF photos get a web JPG in `_web`, and every photo gets a 400px thumb in `_thumbs`. Library and selection scale to 50+ photos without storing blobs.
- **Behavior:** Escape/backdrop close; native focus trap; unsaved edits prompt before discarding; the hero autoplay pauses while the dialog is open.

### Toast
A fixed charcoal pill at bottom center, 12.5px/500 #fff7f4 text, a #ffb3c1 heart icon, 40px blur shadow, 3.6s dwell. `role="status"` and `aria-live="polite"`.

### Browser surfaces
`theme-color` is #f7f1ec. Selection is #f7b9c5 on #37161f. The scrollbar is 11px, #e3c3c8 on Paper, with a 3px Paper border. The favicon is a rose rounded square with the crescent-and-spark mark. Focus is Cherry 2px with 3px offset; the skip link lands at 12/12 and slides out of `translateY(-160%)` into a dark ink pill.

### Accessibility decisions
- Wine Ink on rose is the AA choice: 6.66:1 base, 7.89:1 on the lightest gradient stop, 5.76:1 on the deepest.
- Body ink on paper is 14.95:1; Quiet Plum is 4.85:1; Rose Label 4.61:1; Pill Wine 5.70:1. None fail 4.5:1 at their shipped sizes.
- Reduced motion: the CSS collapses all animation/transition durations to 0.001ms and restores revealed shelves at every width; JS also stops petals, autoplay, title/description animation, and scripted flips, and starts the carousel paused.
- The hero has a polite live region, the carousel has labeled buttons and bars with `aria-current`, pills are `aria-pressed`, and the art button names the current work. The autoplay toggle exposes state through its dynamic accessible name and `.is-paused` class, not `aria-pressed`.
- Filtering announces the visible count in `#worksStatus`; the recent shelf reports hidden counts in a `role="status"` row and confirms restores through the toast live region, with each removal button labeled per work and each tile opening its artwork.
- Touch targets: chips 36px, arrows 36px, viewer nav 36px, close 34px, autoplay 26px, selection remove 24px; the art button is the entire print.
- The acervo dialog traps focus natively, labels each library tile with its action, exposes the order as text and a badge, announces save confirmation in a live region, and keeps Save outside the scrolling body. Selection order is keyboard-independent but drag-reorderable; removing and re-adding is the accessible fallback.

## Do's and Don'ts

### Do:
- **Do** keep the artwork the most saturated object on screen; chrome stays quiet and occupies well under a tenth of the surface.
- **Do** set any type on rose in Wine Ink (#4a1420), at the shipped sizes and weights.
- **Do** use Gabarito alone; make hierarchy with 400–900 weight, size, and the two tracking extremes.
- **Do** use 999px pills for word actions and 16–34px radii for image mats; keep the mat/image nesting (5px mat, 16px inner image).
- **Do** shade with warm plum, large blur, negative spread (`rgba(96, 42, 54, …)`).
- **Do** treat `.hero__art.is-framed` as the swap point: test the hero both with the print mat and with a transparent cutout bleeding out of the rose.
- **Do** keep metadata labels uppercase, 11–12px, with 0.08em+ tracking.

### Don't:
- **Don't** load or introduce a second display family; Inter stays an unused fallback.
- **Don't** put body ink (#251b1e) or black on the rose; that role is Wine Ink only.
- **Don't** add a decorative kicker or eyebrow above headings; uppercase is for metadata, state tags, and the footer only.
- **Don't** use hard offset shadows, neutral grey shadows, or outline cards and images with rigid 1px borders; lift with diffuse warm shadow and 1–4px translation. Hairline borders belong only to the ghost button and viewer controls.
- **Don't** use berry as a section fill or for more than one filled action per viewport.
- **Don't** let arrows or pagination bars cover the framed print; use the shipped shrink/hide breakpoints.
- **Don't** overlay interface labels on the artwork beyond the desktop "toque na arte" hint and the state tags.
