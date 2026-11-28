/** Fractal Lightbox: the photo is revealed by recursive subdivision: a cover splits into four, each quarter into four again, down to a fine grid of tiles that then wink out in a self-similar order. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Fractal Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Recursive', 'Hierarchical', 'Sequential'],
  effect: ['Fractal-motion', 'Splitting', 'Contracting'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Scale', 'Opacity', 'Layout'],
  description: 'A lightbox whose cover divides itself away. Open it and a solid cover over the photo splits into four squares, each of those splits into four, and again, until it is a fine grid; then the tiles shrink away in Z-order, the same pattern at every scale, uncovering the photo. Closing builds the cover back up.',
  params: [
    { key: 'depth', label: 'Depth', group: 'Shape', type: 'range', min: 2, max: 4, step: 1, unit: '', default: 3 },
    { key: 'step', label: 'Step time', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: 's', default: 0.25, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Cover'),
  ],
};

/** Index → (col, row) in Z-order (Morton): every block of 4 is itself a block of 4, so the order is self-similar. */
const morton = (i, levels) => {
  let x = 0;
  let y = 0;
  for (let b = 0; b < levels; b++) {
    x |= ((i >> (2 * b)) & 1) << b;
    y |= ((i >> (2 * b + 1)) & 1) << b;
  }
  return [x, y];
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const D = Math.round(p.depth);
    // Cells for every level 0..D, each level a 2^L × 2^L grid, listed in Z-order.
    const levels = Array.from({ length: D + 1 }, (_, L) => {
      const n = 2 ** L;
      return Array.from({ length: n * n }, (_, i) => {
        const [x, y] = morton(i, L);
        return `<i class="sp-frc__cell sp-frc__L${L}" style="left:${(x * 100) / n}%;top:${(y * 100) / n}%;width:${100 / n}%;height:${100 / n}%"></i>`;
      }).join('');
    });
    k.html(scene('sp-frc', `<div class="sp-ov__light sp-ov__photo sp-frc__light" role="dialog" aria-label="Photo"><div class="sp-frc__cover">${levels.join('')}</div></div>`, { label: 'View photo', title: 'Trip album', kick: 'Photos' }));
    const light = k.$('.sp-frc__light');
    const lv = Array.from({ length: D + 1 }, (_, L) => k.$$(`.sp-frc__L${L}`));
    gsap.set(light, { autoAlpha: 0 });
    const reset = () => lv.forEach((cells, L) => gsap.set(cells, { autoAlpha: L ? 0 : 1, scale: 1 }));
    reset();
    const build = () => {
      const tl = gsap.timeline();
      // Each level: swap in the next, finer level, whose cells pull apart a little (scale < 1)
      for (let L = 1; L <= D; L++) {
        tl.set(lv[L - 1], { autoAlpha: 0 }).set(lv[L], { autoAlpha: 1, scale: 1 }).to(lv[L], { scale: 0.9, duration: p.step, ease: 'power2.out' });
      }
      // …then the finest tiles wink out in Z-order
      return tl.to(lv[D], { scale: 0, duration: p.step * 1.2, ease: 'back.in(2)', stagger: { each: (p.step * 2) / lv[D].length } });
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (open) {
        reset();
        return gsap.timeline().set(light, { autoAlpha: 1 }).add(build(), 0.2);
      }
      return gsap.timeline().to(light, { autoAlpha: 0, scale: 0.95, duration: 0.3 }).set(light, { scale: 1 });
    }, ['View photo', 'Close']);
    return () => k.destroy();
  },
};
