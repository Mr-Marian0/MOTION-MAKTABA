# Design Guide (for Claude Code)

How to add or change a design in a drawer when the owner sends a request. Read this first, every time.

## 1. Shorthand

| Write | Means | Example |
|---|---|---|
| `!name` | a class name or ARIA role in the design | `!sp-tabs__deck`, `!tab` |
| `>Element>N` | the design whose UI Element is `Element` and whose card number is `N` (case doesn't matter) | `>tabs>12` = No. 12 Folder Tabs |
| `>Element` | every design of that UI Element | `>navbar` |

Find a card number from the card itself (`No. 12 · Tabs`) or from its position in the drawer's `index.js` (1-based).

## 2. Images

Images are rough sketches made in Krita (plain colors, simple shapes). Treat them as a **guide, not a spec**:
- read layout, proportions, order and intent from them;
- don't copy them exactly; restyle in the paper theme (tokens in `src/styles/tokens.css`) and improve freely;
- never save the image into the project.
- Numbered sketches (1, 2, 3…) map to the numbered lines of the request; one sketch = one new card unless the words say otherwise.

## 2b. Add your own (standing instruction from the owner)

Every request is a starting point, not the whole brief, with or without an image:
- Add your own design and motion where it makes the result more visually effective: hover, press/click and idle touches (e.g. a peek on hover, a squash on press, a gentle idle loop), follow-through, secondary motion.
- Keep what was asked exactly as asked; extras must support it, never replace or obscure it.
- Expose useful extras as workbench settings (direction, color, speed, amount) so they can be tuned or turned off.
- List the extras you added in the reply, so the owner can veto them.

## 3. Digest (do this before writing code)

Split the request into two parts and show it to the owner in one short table:

| Part | It is a… when | How it is built | Cost |
|---|---|---|---|
| **Variant** | it changes only how an existing design **looks or is tuned**: color, size, layout/orientation, spacing, speed, easing, labels | add a preset to that design's `meta.variants` (and a new param if the setting doesn't exist yet) | ~100 bytes, no new files |
| **New card** | it adds a new **trigger, behavior or motion effect** (anything that changes the classification), or changes how the element is used | new `<id>.js` + `<id>.css` that **builds on** the closest design (reuse its CSS with `@import`, reuse its markup classes) | ~1–3 KB |

Rules:
- When in doubt, it's a variant. Prefer the cheapest option that still lets the filters find it.
- One request can produce both (see the example below).
- A new card inherits the variant's look when the request says so.

Example: *">tabs>12 in long portrait; !sp-tabs__deck swipes left page by page like a book; reverses going back; clicking a !tab also turns pages."*

| Part | Type | Result |
|---|---|---|
| Long portrait | Variant of No. 12 Folder Tabs | `layout` param + `variants: { Portrait: { layout: 'Portrait' } }` |
| Swipe/drag + book page turn, reversible, tab click leafs through | New card | No. 14 Book Tabs (`book-tabs.js/.css`, `@import url('paper-tabs.css')`) |

## 4. Where things go

```
src/js/specimens/<drawer>/
  index.js        design ids in display order — ADD NEW IDS AT THE END (card numbers must not shift)
  <id>.js         export const meta = {…}; export default { mount }
  <id>.css        styles, one class prefix (.sp-<name>)
```
Start from `src/js/specimens/_template.js` / `_template.css`. Helpers: `_kit.js` (kit, esc, labelsOf, bars, clamp, EASES), `_params.js` (tone, EASE_CHOICES, control types), `_shared.css` (.sp, .sp-bar, .sp-note, .sp-line).

`meta`:
- `title`, `description` (1–2 sentences), `element` (one of `ELEMENTS[drawer]`), `trigger`, `behavior`, `effect`, `purpose`, `properties`: terms **exactly** as spelled in `src/data/taxonomy.js`. Pick ideas per element from [MOTION-LIBRARY.md](MOTION-LIBRARY.md) first; add a term there only if nothing fits.
- `params`: 3–5 controls. `css: '--var'` (instant), `live: true` (read at event time), or neither (re-mounts).
- `variants` (optional): `{ 'Name': { key: value, … } }` = defaults + these values. Shown as chips on the workbench.

`mount(stage, p, { gsap, reducedMotion })`: build inside `stage` with `kit()`, read `p.*` inside handlers, return a cleanup (or `{ destroy, update }`).

## 5. Efficiency

- Smallest change that works. Reuse before writing: existing design, `_kit.js`, `_shared.css`, `@import` of a sibling CSS.
- JavaScript only (plain ES modules + GSAP). No new libraries, no build step.
- No duplicated CSS or markup; no comments that repeat the code; no placeholder files.
- Size in `em`, theme via tokens, respect `reducedMotion`, keyboard accessible.
- Select by class (`.sp-x__item`), never by bare tags like `li button`: every card is itself an `<li>`, so tag selectors leak onto other parts of the design. Give each element you query its own class; `k.$()` returns the first match.
- Element ids must be unique per mount (`uid()` from `_kit.js`): the card and the workbench can show the same design at once.

## 6. Finish

1. Check the page in a browser: the card mounts, the workbench controls work, the console has no `[lab]` warnings.
2. Reply briefly: the digest table, files touched, and the new card number(s).

## 7. Notes from Claude

- Name the card numbers in requests (`>tabs>12`), not titles; titles can change.
- Never reorder `index.js`; to retire a design, delete its line and files and accept that later numbers shift (say so in the reply).
- If a request is a variant of a variant, it's still just one more entry in `meta.variants`.
- If a sketch and the words disagree, the words win.
