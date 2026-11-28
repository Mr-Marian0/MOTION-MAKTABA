/** Pond Image: a lakeside photo with its reflection in the water below: little surface waves keep the reflection shimmering; touch the water and a bigger wave rolls across it, bending the reflected picture as it passes. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Pond Image',
  element: 'Image',
  trigger: ['Idle', 'Click', 'Cursor move'],
  behavior: ['Continuous', 'Position-aware', 'Reactive'],
  effect: ['Surface-wave', 'Water-motion', 'Reflection-distortion'],
  purpose: ['Delight', 'Storytelling'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A landscape with a still lake under it, the picture mirrored upside-down in the water. Small surface waves keep the reflection shimmering: thin horizontal bands of it slide side to side out of step. Click or drag a finger over the water and a bigger wave rolls down through it from where you touched, the bands swinging wider as the swell passes, then calming again.',
  params: [
    { key: 'bands', label: 'Wave bands', group: 'Shape', type: 'range', min: 8, max: 30, step: 1, unit: '', default: 16 },
    { key: 'calm', label: 'Ripple', group: 'Motion', type: 'range', min: 0, max: 0.4, step: 0.02, unit: 'em', default: 0.12, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.bands);
    k.html(`
      <div class="sp sp-tm sp-pnd">
        <div class="sp-tm__frame sp-pnd__frame" role="img" aria-label="Pines over a lake, reflected in the water">
          <div class="sp-pnd__sky">${photo(2, 'sp-pnd__img')}</div>
          <div class="sp-pnd__water"><div class="sp-cc__pieces"></div><i class="sp-pnd__tint"></i></div>
        </div>
      </div>`);
    const water = k.$('.sp-pnd__water');
    const bands = pieces(k.$('.sp-cc__pieces'), photo(2, 'sp-pnd__img sp-pnd__flip'), Array.from({ length: n }, (_, i) => {
      const [a, b] = [Math.max(0, (i / n) * 100 - 0.4), Math.min(100, ((i + 1) / n) * 100 + 0.4)];
      return [[0, a], [100, a], [100, b], [0, b]];
    })).map((x) => x.el);
    let E = 14, H = 100;
    k.resize(water, () => { E = parseFloat(getComputedStyle(water).fontSize) || 14; H = water.offsetHeight; });
    // swell: a single wave travelling down from y0; ripple: small constant shimmer
    const s = { t: 0, swell: 0, y0: 0, at: 0 };
    let odd = false;
    const tick = (time, ms) => {
      s.t += ms / 1000;
      s.swell *= Math.pow(0.3, ms / 1000);
      if (lite && (odd = !odd)) return;
      bands.forEach((el, i) => {
        const v = i / (n - 1);
        const front = s.at + (s.t - s.y0) * 1.2; // where the swell's crest is (0..1 down the water)
        const swell = s.swell * Math.exp(-(((v - front) * 5) ** 2));
        const x = Math.sin(s.t * 3 + i * 1.7) * p.calm * E * (0.4 + v) + Math.sin(i * 0.9 - s.t * 8) * swell * E * 0.8;
        gsap.set(el, { x, scaleX: 1 + swell * 0.04 });
      });
    };
    if (!reducedMotion) gsap.ticker.add(tick);
    let box;
    const splash = (e) => {
      box = box || water.getBoundingClientRect();
      s.swell = 1; s.y0 = s.t; s.at = Math.max(0, (e.clientY - box.top) / H - 0.1);
    };
    k.on(water, 'pointerdown', splash);
    k.on(water, 'pointerenter', () => (box = water.getBoundingClientRect()));
    k.on(water, 'pointermove', (e) => e.buttons && splash(e));
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
