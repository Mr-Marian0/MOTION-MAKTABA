# 123 Motion Maktaba

A creative developer portfolio, motion library and interactive portfolio, designed as an old paper archive.
The full creative brief is in [PROMPT.md](PROMPT.md).

## Run it

No install, no build. Open the **project folder** in VS Code and start **Live Server** on `index.html`.
Any static server works, at any base path (all asset paths are relative, so it also runs as a GitHub Pages project site).
The empty `.nojekyll` file stops GitHub Pages from running Jekyll, which would otherwise drop every `_`-prefixed file (`_params.js`, `_kit.js`, `_shared.css`).
A file opened by double-click (`file://`) won't work, because ES modules need a server.

Stack: HTML · plain CSS (tokens + layers, no build step) · GSAP + ScrollTrigger · Lenis, from the jsDelivr CDN through the import map in `index.html`.

> The Tailwind browser script was removed: no markup used its utilities, and it compiled CSS in the browser on every DOM change. Its reset lives on as `src/styles/preflight.css`.

**Performance / device-friendly mode.** Phones, tablets and low-power machines get *lite mode* automatically (`src/js/core/device.js`): native scrolling instead of Lenis, fewer live designs at once, and lighter shadows. Force it with `?lite=1` or turn it off with `?lite=0` (remembered on that device). In every mode, library designs only run while their card is near the screen, and the workbench pauses the grid behind it.

## Built so far

| # | Section | HTML | CSS | JS |
|---|---|---|---|---|
| 1 | Portal Hero | `index.html` | `src/styles/sections/portal-hero.css` | `src/js/sections/portal-hero.js` |
| 2 | The Collections | `index.html` (`#catalog`) | `src/styles/sections/card-catalog.css` | `src/js/sections/card-catalog.js` + `src/data/cards.js` |
| — | Library pages | `library/*.html` | `src/styles/pages/library.css` | `src/js/sections/library-header.js` |
| — | Design lab (every drawer) | `library/*.html` | `src/styles/pages/lab.css` | `src/js/sections/specimen-lab.js` + `lab-code.js`, designs in `src/js/specimens/<drawer>/` |
| — | Page transition | (injected) | `src/styles/components/page-transition.css` | `src/js/core/page-transition.js` |

**Section 2** lists 8 component drawers in alternating left/right rows: Navigation, Buttons & Controls, Cards & Containers, Panels & Sections, Overlays & Popups, Forms & Inputs, Typography & Media, Data & Feedback. Each row has a kraft plate with a looping paper mock-up (the `ui-specimen` effect), and each drawer opens its own page in `library/`. Every drawer page is a design lab. Navigation Bar has 14 designs, Buttons & Controls 7, Cards & Containers 6, Panels & Sections 6, Forms & Inputs 6, Overlays & Popups 7, Typography & Media 8 and Data & Feedback 7 (61 in all). A drawer with no designs shows a "drawer empty" guide.

**Effects** (each works anywhere with `data-effect`):
`ui-specimen` (the catalog plates, `{"kind":"navigation|controls|cards|panels|overlays|forms|media|data"}`) · `line-draw` (the catalog scribble) · `scroll-reveal` · `letter-scatter` · `magnetic-hover` · `tear-wipe`. They're in `src/js/effects/`, with styles in `src/styles/effects/`.

**Replace the hero image:** put your photo in `src/assets/images/` and update the `src` of `[data-hero="media"]` in `index.html`. The current `hero.svg` is placeholder artwork.

## How things plug in

### Add a section
1. Add the HTML to the page: `<section data-section="my-section">…</section>`
2. Create `src/js/sections/my-section.js`:
   ```js
   export default {
     name: 'my-section',
     init(el, { gsap, ScrollTrigger, lenis, reducedMotion }) {
       this._ctx = gsap.context(() => { /* timelines */ }, el);
     },
     destroy() { this._ctx?.revert(); },
   };
   ```
3. Create `src/styles/sections/my-section.css` and import it in `src/styles/main.css`.

The registry finds the module from the attribute automatically. Nothing else needs to change.

### Add an effect
1. Create `src/js/effects/my-effect.js`. `init` returns a cleanup function, since an effect can appear many times on one page:
   ```js
   export default {
     name: 'my-effect',
     init(el, options, { gsap, reducedMotion }) {
       const tween = gsap.to(el, { /* … */ });
       return () => tween.kill();
     },
   };
   ```
2. Use it anywhere: `<div data-effect="my-effect" data-effect-options='{"strength":0.5}'></div>`
3. Optional styles: `src/styles/effects/my-effect.css`, imported in `main.css`.

### Add a drawer (+ its page)
1. Add one object to `src/data/cards.js`. The field reference is at the top of that file: `items` are the tags, and `effect` + `effectOptions` pick the plate's live demo.
2. Copy `library/_template.html` to `library/<category>.html` and set both `data-category="<category>"`.
3. Create `src/js/specimens/<category>/index.js` (copy an empty one, e.g. from `buttons-controls/`) and add the drawer's UI elements to `ELEMENTS` in `src/data/taxonomy.js`.

The row (and which side its plate is on), its drawer number, and the page header with previous/next links all update automatically.

**New plate mock-up:** add a `kind` to `MARKUP` and `BUILDERS` in `src/js/effects/ui-specimen.js` and style it in `src/styles/effects/ui-specimen.css`.

### Designs (inside a drawer)
Every drawer page holds the lab: `<section data-section="specimen-lab" data-category="<drawer>">`. A design is **two files side by side**:

```
src/js/specimens/
  _template.js / _template.css   ← copy these to start a design
  _kit.js        helpers for mount() (k.on, k.html, bars, labelsOf, EASES…)
  _params.js     ready-made workbench controls (tone(), EASE_CHOICES) + control docs
  _shared.css    base styles every design can use (.sp, .sp-bar, .sp-note, .sp-line)
  navigation/
    index.js              the drawer's designs, in display order (+ card number prefix)
    ink-underline.js      export const meta = {…}  +  export default { mount }
    ink-underline.css     its styles
```

**Add a design in 3 steps**
1. Copy `_template.js` + `_template.css` into the drawer folder, renamed to the design id (`press-button.js`, `press-button.css`).
2. Add `'press-button'` to the **end** of that folder's `index.js` (card numbers stay stable).
3. Fill in `meta` and `mount`, then refresh. The card, its number, the filters, the counts, the workbench controls and the code panel all pick it up.

- **Classification** (`src/data/taxonomy.js`): UI Element → Interaction → Motion Effect, plus Behavior and Purpose; Element Properties are the workbench control groups. Spelling must match. The browser console warns about any unknown term, and to add a term you add it to the comma-separated lists.
- **A broken design** (e.g. a syntax error) is skipped with a console message. The rest of the drawer still works.
- **Variants:** `meta.variants = { Portrait: { layout: 'Portrait' } }` adds preset chips on the workbench (no new files).
- **Workbench code panel** (view only, each with Copy): *JavaScript* is the design's `.js` with the current settings on top; *AI prompt* rebuilds it in plain JS + GSAP.
- **Requests to Claude Code** (`!class`, `>Element>N`, sketches, variant vs. new card): see [DESIGN-GUIDE.md](DESIGN-GUIDE.md).
- **Deep links:** `navigation.html?element=Navbar&trigger=Hover&effect=Sliding` opens a filtered view. The catalog's Navigation Bar tags use this.

### Give an effect a card demo
Export `demo()` from the effect module, returning the demo's HTML. The catalog places it inside the card, and the registry then mounts the effect on it.

### Page transitions
Add `data-transition` (and optionally `data-transition-label="…"`) to any same-site link to get the paper-tear curtain.

## Paper system (use anywhere)

| Class | What it does |
|---|---|
| `.paper-kraft` / `.paper-cream` / `.paper-ink` | procedural paper textures |
| `.tear-edge--top/right/bottom/left` | torn edge on one side (mask) |
| `.tear-v1` / `.tear-v2` / `.tear-v3` | swap the tear pattern |
| `.tear-shadow` | paper thickness shadow (put on a wrapper) |
| `.tape` · `.staple` · `.stamp` · `.folio` | ornaments |

Tune a tear with `--tear-depth` and `--tear-period`. For a unique, random tear per element, use `edgeClipPath()` from `src/js/components/tear-edge.js`.

All colors, easings, durations and z-layers live in `src/styles/tokens.css`.

## Accessibility
- `prefers-reduced-motion`: smooth scroll and scrubbed timelines are off, and sections render in their final state.
- Decorative layers are `aria-hidden`. The hero wordmark is one real `<h1>`.
