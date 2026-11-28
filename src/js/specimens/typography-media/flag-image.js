/** Flag Image: a photo printed on a cloth banner hanging from a pole: it ripples gently in the breeze, and moving the pointer across it gusts the wind, sending bigger folds rolling along the cloth. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Flag Image',
  element: 'Image',
  trigger: ['Idle', 'Cursor move', 'Hover'],
  behavior: ['Continuous', 'Velocity-aware', 'Physics-driven'],
  effect: ['Cloth-motion', 'Traveling-wave', 'Swaying'],
  purpose: ['Delight', 'Branding'],
  properties: ['Position', 'Scale', 'Color'],
  description: 'An event banner: the photo is printed on cloth hanging from a pole on its left edge. The fabric ripples in a soft breeze, folds travelling from the pole to the free edge, the fixed edge staying still while the free edge flaps most. Sweep the pointer across it and the wind gusts with your speed, the folds growing and running faster, then calming.',
  params: [
    { key: 'strips', label: 'Folds detail', group: 'Shape', type: 'range', min: 10, max: 40, step: 1, unit: '', default: 24 },
    { key: 'wind', label: 'Breeze', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.05, unit: '', default: 0.35, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Pole'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.strips);
    k.html(`
      <div class="sp sp-tm sp-flg">
        <div class="sp-flg__rig"><i class="sp-flg__pole" aria-hidden="true"></i><div class="sp-flg__cloth" role="img" aria-label="Banner: Night market, Friday"><div class="sp-cc__pieces"></div></div></div>
      </div>`);
    const cloth = k.$('.sp-flg__cloth');
    const strips = pieces(k.$('.sp-cc__pieces'), `${photo(0, 'sp-flg__img')}<b class="sp-flg__text">Night market · Fri</b>`, Array.from({ length: n }, (_, i) => {
      const [a, b] = [Math.max(0, (i / n) * 100 - 0.25), Math.min(100, ((i + 1) / n) * 100 + 0.25)];
      return [[a, 0], [b, 0], [b, 100], [a, 100]];
    })).map((x) => x.el);
    let E = 14;
    k.resize(cloth, () => (E = parseFloat(getComputedStyle(cloth).fontSize) || 14));
    // A travelling wave along x: each strip moves up/down and is squeezed a little where the cloth folds.
    // Transforms only (no per-strip filters), since this runs continuously.
    const s = { t: 0, gust: 0 };
    const draw = () => strips.forEach((el, i) => {
      const u = i / (n - 1);
      const amp = (p.wind + s.gust) * u * E * 0.6; // pinned at the pole, freest at the far edge
      const ph = u * 7 - s.t * (3 + s.gust * 4);
      gsap.set(el, { y: Math.sin(ph) * amp, scaleY: 1 - Math.abs(Math.cos(ph)) * 0.03 * (p.wind + s.gust) });
    });
    let last = null, odd = false;
    // In the site's lite mode the cloth is drawn every other frame
    const tick = (time, ms) => { s.t += ms / 1000; s.gust *= Math.pow(0.4, ms / 1000); if (lite && (odd = !odd)) return; draw(); };
    if (!reducedMotion) gsap.ticker.add(tick); else draw();
    k.on(cloth, 'pointermove', (e) => {
      if (last !== null) s.gust = Math.min(1.2, s.gust + Math.abs(e.clientX - last) / 300);
      last = e.clientX;
    });
    k.on(cloth, 'pointerleave', () => (last = null));
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
