/** Lens Paragraph: a reading lens you slide over small print: words under its centre swell, and the words near its rim bend outward around it, as a curved glass would refract them; it follows the pointer or the arrow keys. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

const TEXT = 'Terms of hire: tools are lent for seven days. A deposit of twenty pounds is taken and returned on safe return. Blades and bits are not covered. Late returns are charged at two pounds per day, capped at the deposit. Please clean equipment before bringing it back.';

export const meta = {
  title: 'Lens Paragraph',
  element: 'Paragraph',
  trigger: ['Cursor move', 'Keyboard', 'Hover'],
  behavior: ['Cursor-following', 'Proximity-aware', 'Draggable'],
  effect: ['Refraction-motion', 'Bulging', 'Optical-warping'],
  purpose: ['Focus', 'Affordance', 'Delight'],
  properties: ['Scale', 'Position'],
  description: 'Small-print terms with a reading lens. A round glass follows the pointer across the paragraph (or moves with the arrow keys when the text is focused). Words inside the glass are magnified, most at its centre, and the words around its rim are pushed outward and slightly enlarged, as if bent by the curved edge of the lens, so the text seems to flow around it.',
  params: [
    { key: 'mag', label: 'Magnification', group: 'Motion', type: 'range', min: 1.1, max: 2.2, step: 0.05, unit: '×', default: 1.6, live: true },
    { key: 'size', label: 'Lens size', group: 'Shape', type: 'range', min: 3, max: 8, step: 0.5, unit: 'em', default: 5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Lens rim'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-lnp">
        <div class="sp-lnp__page" tabindex="0" aria-label="Terms of hire (arrow keys move the reading lens)"><p class="sp-tm__p sp-lnp__p">${words(TEXT, 'sp-tm__w sp-lnp__w')}</p><i class="sp-lnp__lens" aria-hidden="true" style="--d:${p.size}em"></i></div>
      </div>`);
    const page = k.$('.sp-lnp__page');
    const ws = k.$$('.sp-lnp__w');
    const lens = k.$('.sp-lnp__lens');
    let C = [], E = 14, at = [80, 40];
    k.resize(page, () => { E = parseFloat(getComputedStyle(page).fontSize) || 14; C = ws.map((w) => [w.offsetLeft + w.offsetWidth / 2, w.offsetTop + w.offsetHeight / 2]); look(...at); });
    const lx = gsap.quickTo(lens, 'x', { duration: 0.2 }), ly = gsap.quickTo(lens, 'y', { duration: 0.2 });
    gsap.set(lens, { autoAlpha: 0 });
    function look(x, y) {
      at = [x, y];
      lx(x); ly(y);
      if (reducedMotion) return;
      const R = (p.size / 2) * E;
      ws.forEach((w, i) => {
        const dx = C[i][0] - x, dy = C[i][1] - y, d = Math.hypot(dx, dy) || 1;
        if (d > R * 1.6) return gsap.to(w, { x: 0, y: 0, scale: 1, duration: 0.25, overwrite: true });
        const inside = Math.max(0, 1 - d / R);
        const rim = Math.max(0, 1 - Math.abs(d - R) / (R * 0.6));
        gsap.to(w, { x: (dx / d) * rim * E * 0.6, y: (dy / d) * rim * E * 0.4, scale: 1 + (p.mag - 1) * inside + rim * 0.1, duration: 0.25, overwrite: true });
      });
    }
    let box;
    const show = (on) => gsap.to(lens, { autoAlpha: on ? 1 : 0, duration: 0.2 });
    k.on(page, 'pointerenter', () => { box = page.getBoundingClientRect(); show(true); });
    k.on(page, 'pointermove', (e) => box && look(e.clientX - box.left, e.clientY - box.top));
    const reset = () => { show(false); gsap.to(ws, { x: 0, y: 0, scale: 1, duration: 0.4, overwrite: true }); };
    k.on(page, 'pointerleave', () => { box = null; if (document.activeElement !== page) reset(); });
    k.on(page, 'focus', () => { show(true); look(...at); });
    k.on(page, 'blur', reset);
    k.on(page, 'keydown', (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (d) e.preventDefault(), look(at[0] + d[0] * E * 2, at[1] + d[1] * E * 1.2);
    });
    return () => k.destroy();
  },
};
