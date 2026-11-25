/**
 * REGISTRY — auto-mounts sections and effects from HTML attributes.
 *
 *   <section data-section="portal-hero">  → src/js/sections/portal-hero.js
 *   <div data-effect="magnetic-hover"
 *        data-effect-options='{"strength":0.4}'> → src/js/effects/magnetic-hover.js
 *
 * Module contract (default export):
 *   { name, init(el, ctx | options, ctx), destroy?() }
 * `init` may be async and may return a cleanup function. Prefer that for
 * effects, which can be used many times on one page; it's used instead
 * of `destroy`.
 *
 * Effect modules may also export `demo()` → HTML string for their
 * mini-demo; the card catalog uses it to fill each card.
 *
 * Modules load on demand (native dynamic import, no build step).
 */

const cleanups = [];
const cache = new Map();

/** Load a module namespace from src/js/<folder>/<name>.js (cached). */
export function loadModule(folder, name) {
  const url = new URL(`../${folder}/${name}.js`, import.meta.url).href;
  if (!cache.has(url)) cache.set(url, import(url));
  return cache.get(url);
}

async function mount(attr, folder, run) {
  const nodes = [...document.querySelectorAll(`[${attr}]`)].filter((el) => !el.__mmMounted);

  await Promise.all(
    nodes.map(async (el) => {
      el.__mmMounted = true;
      const name = el.getAttribute(attr);
      let mod;
      try {
        mod = (await loadModule(folder, name)).default;
      } catch (err) {
        console.warn(`[registry] Could not load ${attr}="${name}" (expected src/js/${folder}/${name}.js)`, err);
        return;
      }
      const result = await run(mod, el);
      cleanups.push(typeof result === 'function' ? result : () => mod.destroy?.());
    })
  );
}

/** Sections receive the shared context: { gsap, ScrollTrigger, lenis, reducedMotion }. */
export function mountSections(ctx) {
  return mount('data-section', 'sections', (mod, el) => mod.init(el, ctx));
}

/** Effects receive their own options (from data-effect-options JSON) plus the context. */
export function mountEffects(ctx) {
  return mount('data-effect', 'effects', (mod, el) => {
    let options = {};
    try {
      options = JSON.parse(el.dataset.effectOptions || '{}');
    } catch {
      console.warn('[registry] Invalid data-effect-options JSON on', el);
    }
    return mod.init(el, options, ctx);
  });
}

/** Tear everything down (used before page transitions). */
export function destroyAll() {
  while (cleanups.length) cleanups.pop()();
}
