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

/**
 * Wire a 0–100 slider: pointer drag anywhere on `rail`, arrow keys on `thumb`.
 * move(v) gets each new value; key(±1) gets arrow presses; start/end bracket a drag.
 */
export function slider(k, rail, thumb, { start, move, end, key }) {
  let held = false;
  const at = (e) => {
    const r = rail.getBoundingClientRect();
    return clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
  };
  const stop = () => held && ((held = false), end?.());
  k.on(rail, 'pointerdown', (e) => {
    rail.setPointerCapture(e.pointerId);
    held = true;
    start?.();
    move(at(e));
  });
  k.on(rail, 'pointermove', (e) => held && move(at(e)));
  k.on(rail, 'pointerup', stop);
  k.on(rail, 'pointercancel', stop);
  k.on(thumb, 'keydown', (e) => {
    const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (d) e.preventDefault(), key(d);
  });
}

/**
 * Wire a FAB: clicking `main` flips aria-expanded, turns its first child (a "+") into an "×",
 * makes `items` tabbable only while open, and calls run(open), which may return a timeline.
 * A new click kills the previous timeline, so the next one starts from wherever things are.
 */
export function fabToggle(k, gsap, main, items, run, reducedMotion) {
  let tl;
  items.forEach((b) => (b.tabIndex = -1));
  k.on(main, 'click', () => {
    const open = main.getAttribute('aria-expanded') !== 'true';
    main.setAttribute('aria-expanded', String(open));
    items.forEach((b) => (b.tabIndex = open ? 0 : -1));
    gsap.to(main.firstElementChild, { rotation: open ? 135 : 0, duration: reducedMotion ? 0 : 0.5, ease: 'back.out(2)' });
    tl?.kill();
    tl = run(open);
    if (reducedMotion) tl?.progress(1);
  });
}

/** A short "you clicked me" motion on el; kind is one of SIGNAL_CHOICES (_params.js). */
export function clickSignal(gsap, el, kind, reducedMotion) {
  if (reducedMotion || kind === 'None') return;
  gsap.killTweensOf(el, 'x,y,scale,scaleX,scaleY');
  const tl = gsap.timeline();
  if (kind === 'Bounce') tl.to(el, { y: '-0.35em', duration: 0.12, ease: 'power2.out' }).to(el, { y: 0, duration: 0.55, ease: 'bounce.out' });
  else if (kind === 'Squash') tl.to(el, { scaleX: 1.08, scaleY: 0.86, duration: 0.1 }).to(el, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  else if (kind === 'Shake') tl.to(el, { keyframes: { x: [-5, 5, -3, 3, 0] }, duration: 0.4, ease: 'none' });
  else tl.to(el, { scale: 1.08, duration: 0.12, ease: 'power2.out' }).to(el, { scale: 1, duration: 0.4, ease: 'power2.inOut' });
  return tl;
}

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
