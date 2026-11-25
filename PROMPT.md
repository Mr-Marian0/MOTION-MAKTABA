# PROMPT: 123 Motion Maktaba — Creative Developer Portfolio, Motion Library & Interactive Portfolio

## Role
You are a senior creative developer and motion designer who builds award-level editorial websites. Write clean, modular, production-ready code. Motion should feel deliberate and tactile, like handling real paper, never generic.

## Concept
**123 Motion Maktaba** ("maktaba" means library) is a portfolio built like an **old paper archive**. Visitors tear open the cover, browse **library index cards** of motion effects, and pull a card to open its page.

It's three things in one:
1. **Creative Developer Portfolio**: who I am and what I build.
2. **Motion Library**: a catalog of reusable interactive effects, each with a live demo.
3. **Interactive Portfolio**: the site itself shows off the craft.

**Creative motifs to use throughout:**
- Torn kraft paper, masking tape strips, staples, rubber-stamp marks.
- Library catalog codes on every card (e.g. `MM-001 · SCROLL`).
- Hand-annotation accents (a scribbled arrow or circle drawn in with SVG stroke animation).
- Page numbers and "VOL. 01" folio marks, like a printed journal.

## Tech stack (zero-build: runs directly in VS Code Live Server)
- **HTML5**: semantic markup.
- **Tailwind CSS v4** browser build (CDN): layout utilities. Tokens are plain CSS variables, used as `bg-(--color-kraft)`.
- **Custom CSS**: tear masks, blend modes, paper textures, plain `@import url() layer()`.
- **GSAP + ScrollTrigger**: scroll choreography (CDN via import map).
- **Lenis**: smooth scroll, synced to ScrollTrigger (CDN via import map).
- **SplitType**: character and word splitting (add to the import map when a section needs it).
- Vanilla JS ES modules. No framework, no bundler, no npm.

## File structure (built for add-ons)
```
123-motion-maktaba/
├── index.html
├── library/
│   ├── _template.html              # copy this to make any new category page
│   ├── scroll-motion.html
│   ├── typography.html
│   ├── hover-cursor.html
│   └── transitions.html
├── src/
│   ├── styles/
│   │   ├── main.css                # layer order + imports
│   │   ├── tokens.css              # :root vars: colors, type, easing, z-index, textures
│   │   ├── base.css                # resets, fonts, grain overlay
│   │   ├── paper/                  # reusable paper system
│   │   │   ├── tear.css            # .tear-edge--top/right/bottom/left + .tear-v1/2/3
│   │   │   ├── textures.css        # .paper-kraft, .paper-cream, .paper-ink
│   │   │   └── ornaments.css       # .tape, .staple, .stamp, .folio
│   │   ├── sections/               # one file per section
│   │   │   ├── portal-hero.css
│   │   │   └── card-catalog.css
│   │   └── effects/                # one file per library effect
│   ├── js/
│   │   ├── main.js                 # boots core, then auto-mounts sections
│   │   ├── core/
│   │   │   ├── registry.js         # section + effect registry (auto-mount)
│   │   │   ├── smooth-scroll.js    # Lenis + ScrollTrigger sync
│   │   │   ├── motion-prefs.js     # reduced-motion helper
│   │   │   └── page-transition.js  # paper-tear transition between pages
│   │   ├── sections/
│   │   │   ├── portal-hero.js
│   │   │   └── card-catalog.js
│   │   ├── effects/                # each effect = one plug-in module
│   │   └── components/
│   │       └── tear-edge.js        # generates random SVG/polygon tear paths
│   ├── data/
│   │   └── cards.js                # all catalog cards are data, not hard-coded HTML
│   └── assets/
│       ├── images/
│       └── fonts/
├── public/
│   └── svg/                        # tear-edge mask variants (served as-is)
└── README.md                       # includes "How to add a section / effect / card"
```

## Extensibility contract (required)
Everything new should plug in. Nothing existing should need to be rewritten.

**1. Sections are auto-mounted modules.**
```html
<section data-section="portal-hero"> … </section>
```
```js
// every section module exports the same shape
export default {
  name: 'portal-hero',
  init(el, ctx) { /* build timelines; ctx = { gsap, ScrollTrigger, lenis, reducedMotion } */ },
  destroy() { /* kill timelines & listeners */ }
}
```
`registry.js` finds every `[data-section]` and loads `src/js/sections/<name>.js` automatically. **Adding a section** means: add the HTML block, add a JS and CSS file, and import the CSS in `main.css`.

**2. Effects are plug-ins.** Same shape (`name`, `init(el, options)`, `destroy()`), applied with `data-effect="magnetic-hover"`. The same effect file powers both a card's mini-demo and the full category page.

**3. Cards are data.** `cards.js` holds an array:
```js
{ id:'MM-001', title:'Scroll Motion', category:'scroll-motion',
  description:'…', effect:'scroll-reveal', span:2, href:'/library/scroll-motion.html',
  ornament:'tape' }
```
The catalog renders from this data. **Adding a card** means adding one object.

**4. The paper system is reusable.** Any element can be torn or textured with classes alone: `class="paper-kraft tear-edge--bottom tear-v2"`. `tear-edge.js` can also generate a unique random tear for each instance.

**5. Tokens only.** No raw hex values or magic numbers in components. Colors, easings (`--ease-tear`, `--ease-settle`), durations and z-index layers all live in `tokens.css`.

## Theme: paper, ink and tear
| Token | Hex | Use |
|---|---|---|
| `--color-paper` | `#F3EBDD` | cream white, page background |
| `--color-paper-dark` | `#E4D6BF` | aged paper, cards |
| `--color-kraft` | `#A07A52` | **brown paper panels**, duotone A |
| `--color-kraft-deep` | `#6E4F33` | kraft shadow and fibers |
| `--color-umber` | `#3E2C1F` | deep brown, duotone B |
| `--color-ink` | `#111111` | black text |
| `--color-bone` | `#FAFAF7` | white highlights |

**Paper tear lines**
- Make torn edges with SVG paths through `mask-image` or `clip-path`. Never straight borders. Keep at least 3 variants.
- Every tear shows a **paper core**: a thin lighter fiber strip just inside the edge, the pale inner layer real kraft shows when ripped. Under it sits a soft offset shadow for thickness.
- A global grain overlay (SVG `feTurbulence`) at 4–6% opacity.
- Kraft texture: base color + noise + faint vertical fiber streaks, all in CSS/SVG with no heavy image files.

**Typography:** a display serif (*Fraunces*, *Instrument Serif* or *PP Editorial New*), paired with a mono (*JetBrains Mono* / *Space Mono*) for labels, catalog codes and metadata.

---

## SECTION 1: Portal Hero
**Structure**
- `<section data-section="portal-hero">` at about **250vh** tall (the scroll runway).
- A sticky stage: `position: sticky; top: 0; height: 100svh; overflow: hidden; isolation: isolate;`

**Layer stack, back to front:**
1. **Full-bleed image**: `object-fit: cover`, starts overscaled at `scale(1.25)`. Default artwork is layered torn kraft sheets (no books).
2. **Duotone wash**: a kraft → umber gradient, `mix-blend-mode: overlay`, `opacity: 0`.
3. **Radial veil**: transparent center fading to umber/ink at the edges.
4. **Two cream white paper panels** (plain paper texture, no imagery), each about 50.5%+ wide (they overlap, so no seam shows), pinned left and right and meeting in the middle. **The hero begins CLOSED.** The meeting edges are **interlocking torn edges**, one sheet ripped in two, with the pale fiber core visible. Ornaments: a strip of masking tape across the seam that tears when the panels separate, and a small stamp (`MM · VOL. 01`) on one panel.
5. **Wordmark** in ink on the kraft:
   - Top line, small mono: **MY**
   - Main line, display serif: **Motion Maktaba**, split into two `<span>`s at the seam ("Motion" | "Maktaba") so each half rides with its panel.
6. **Corner metadata** in small uppercase mono, pinned to the top and bottom edges:
   - TL `MY — MOTION MAKTABA` · TR `PORTFOLIO / LIBRARY / LAB`
   - BL `EST. 2026 — VOL. 01` · BR `SCROLL TO TEAR ↓` with an animated indicator

**Scroll choreography** (one GSAP timeline, `scrub`, across the runway):
| Progress | Action |
|---|---|
| 0 → 0.10 | Hold. The seam trembles slightly and the tape strains (scaleX stretch). |
| 0.08 → 0.14 | **Tape snaps**: the two tape halves flick apart and fall away. |
| 0.10 → 0.60 | **Panels tear apart**: left `xPercent:-100`, right `xPercent:100`, with a small rotation (±1.5°) and a slight `skewY` so it feels like ripping rather than sliding. Wordmark halves travel with them. "MY" lifts and fades. |
| 0.10 → 0.80 | Image `scale 1.25 → 1`. |
| 0.30 → 0.80 | Duotone opacity `0 → ~0.65`. |
| 0.30 → 1.00 | Veil deepens slightly. |
| 0.85 → 1.00 | BR metadata swaps to `ENTER THE LIBRARY ↓` and Section 2 begins. |

**Requirements**
- Animate only `transform` and `opacity` (plus color on small metadata), at 60fps.
- Mobile: `100svh`, `clamp()` type sizes.
- `prefers-reduced-motion`: the hero renders open with a simple fade and no scrub.
- The wordmark is one real `<h1>` (`aria-label="My 123 Motion Maktaba"`). Decorative layers are `aria-hidden`.
- Hero image loads with `fetchpriority="high"`.

---

## SECTION 2: Card Catalog *(next phase, spec only)*
- A **combined bento grid**: cards of different sizes mixed in one grid, set by the `span` field in data:
  - `span:1` is a small single cell
  - `span:2` is a wide card
  - `span:3` is a large feature card
- Categories: **Scroll Motion, Typography, Hover & Cursor, Transitions** (more can be added through data).
- Each card is a **library index card**: paper texture, torn edge, a catalog code, title, short description, an ornament (tape, staple or stamp), and a **live mini-demo** of its effect:
  - *Scroll Motion*: an element tied to scroll progress inside the card.
  - *Typography*: letters scatter and reassemble on hover.
  - *Hover & Cursor*: a magnetic object that follows the cursor inside the card.
  - *Transitions*: a looping paper-tear wipe preview.
- Hover: the card lifts, its shadow deepens, and it straightens from a slight random tilt to 0°.
- Click: a paper-tear page transition (`page-transition.js`) opens `/library/<category>.html`.

## Category pages
- Built from `library/_template.html`, which has a header, a back link and **an empty content area left blank on purpose** for content added later.

---

## Deliverable rules
- Build **only the section requested** in each step. Don't scaffold later sections early.
- Follow the extensibility contract in every file.
- Comment each timeline with what it does and why.
- Update the README's "How to add a section / effect / card" when you add a new pattern.
- No lorem ipsum in visible UI. Use real copy or a marked `TODO`.
