/**
 * SPECIMEN KIT — small helpers shared by every specimen module.
 *
 * Design contract (src/js/specimens/<drawer>/<id>.js + <id>.css; see _template.js):
 *
 *   export const meta = { title, element, trigger, behavior, effect, purpose, properties, description, params };
 *   export default {
 *     mount(stage, params, { gsap, reducedMotion }) {
 *       const k = kit(stage, gsap);
 *       k.html(`…`);
 *       …wire up listeners with k.on(), read params at event time…
 *       return { destroy: () => k.destroy(), update(key) { … } };   // or just a cleanup function
 *     },
 *   };
 *
 * `params` is a live object: the workbench mutates it in place, so a
 * specimen that reads `params.speed` inside an event handler always gets the
 * current value. Params marked `live` in meta.params don't re-mount the
 * specimen; `update(key)` is called instead (if the specimen returns one).
 * Params with a `css` var are written onto the stage as custom properties.
 */

export const EASES = {
  Expo: 'expo.out',
  Smooth: 'power3.out',
  Snappy: 'power4.out',
  Back: 'back.out(1.8)',
  Elastic: 'elastic.out(1, 0.45)',
  Bounce: 'bounce.out',
  Linear: 'none',
};

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** "A, B, C" → ['A','B','C'] (max 7), or the fallback if empty. */
export function labelsOf(value, fallback) {
  const out = String(value ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 7);
  return out.length ? out : fallback;
}

/** Placeholder text bars, for fake page content. */
export const bars = (n, cls = 'sp-line') =>
  Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--w:${[92, 78, 86, 64, 88, 52, 74][i % 7]}%"></i>`).join('');

export const uid = (p = 'sp') => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function kit(stage, gsap) {
  const offs = [];
  const extra = [];
  return {
    $: (s) => stage.querySelector(s),
    $$: (s) => [...stage.querySelectorAll(s)],
    html(str) {
      stage.innerHTML = str;
    },
    on(el, type, fn, opts) {
      el.addEventListener(type, fn, opts);
      offs.push(() => el.removeEventListener(type, fn, opts));
    },
    /** Run fn whenever el changes size (also right away once it has one). */
    resize(el, fn) {
      const ro = new ResizeObserver(() => el.offsetWidth && fn());
      ro.observe(el);
      offs.push(() => ro.disconnect());
    },
    /** Run fn each time el scrolls into view. */
    inView(el, fn, threshold = 0.4) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && fn()), { threshold });
      io.observe(el);
      offs.push(() => io.disconnect());
    },
    /** Track plain objects that get tweened, so they're killed on destroy. */
    track(obj) {
      extra.push(obj);
      return obj;
    },
    destroy() {
      offs.splice(0).forEach((off) => off());
      gsap.killTweensOf([...stage.querySelectorAll('*'), ...extra]);
      stage.innerHTML = '';
    },
  };
}
