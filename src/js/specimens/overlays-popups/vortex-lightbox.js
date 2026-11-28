/** Vortex Lightbox: closing the lightbox swirls the photo down a whirlpool: its rings turn faster toward the centre, twisting the picture, as it drains away into the middle. Opening spins it back out. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Vortex Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Hierarchical'],
  effect: ['Vortex-motion', 'Swirl-motion', 'Spinning', 'Contracting'],
  purpose: ['Delight', 'Continuity', 'Storytelling'],
  properties: ['Rotation', 'Scale', 'Clip & mask'],
  description: 'A lightbox that leaves down a plughole. Close it and the photo, cut into concentric rings, starts to turn, inner rings faster than outer ones, so the picture twists into a whirlpool as it shrinks and drains away into the centre. Opening runs it backwards: the photo spins up out of the middle and untwists flat.',
  params: [
    { key: 'rings', label: 'Rings', group: 'Shape', type: 'range', min: 3, max: 10, step: 1, unit: '', default: 6 },
    { key: 'twist', label: 'Twist', group: 'Motion', type: 'range', min: 90, max: 1080, step: 45, unit: '°', default: 540, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

/** Square ring i of n (0 = outermost) as a polygon with a hole: outer square, then inner square backwards.
    Each ring reaches 0.4% past its outer edge, under its neighbour, so no anti-aliased seam shows when flat. */
const ring = (i, n) => {
  const [a, b] = [Math.max(0, (i / n) * 50 - 0.4), ((i + 1) / n) * 50];
  const sq = (d) => [[d, d], [100 - d, d], [100 - d, 100 - d], [d, 100 - d], [d, d]];
  return i === n - 1 ? sq(a).slice(0, 4) : [...sq(a), ...sq(b).reverse()];
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.rings);
    k.html(scene('sp-vtx', `<div class="sp-ov__light sp-vtx__light" role="dialog" aria-label="Photo"><i class="sp-ov__photo sp-vtx__img sp-vtx__whole"></i><div class="sp-cc__pieces"></div></div>`, { label: 'View photo', title: 'Lake trip', kick: 'Photos' }));
    const light = k.$('.sp-vtx__light');
    const host = k.$('.sp-cc__pieces');
    const whole = k.$('.sp-vtx__whole');
    const rings = pieces(host, '<i class="sp-ov__photo sp-vtx__img"></i>', Array.from({ length: n }, (_, i) => ring(i, n))).map((b) => b.el);
    rings.forEach((r) => gsap.set(r, { transformOrigin: '50% 50%' }));
    gsap.set([light, whole], { autoAlpha: 0 });
    // At rest one whole photo stands in for the rings (separate rings always show hairline seams)
    const settle = (done) => { gsap.set(whole, { autoAlpha: done ? 1 : 0 }); gsap.set(host, { autoAlpha: done ? 0 : 1 }); };
    // Ring i turns twist × (i+1)/n: the centre spins most, the rim least, which is what twists it into a vortex
    const drain = () => gsap.timeline()
      .to(rings, { rotation: (i) => p.twist * ((i + 1) / n), duration: p.time, ease: 'power2.in' }, 0)
      .to(rings, { scale: 0, duration: p.time, ease: 'power3.in' }, 0);
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (open) {
        gsap.set(light, { autoAlpha: 1 });
        gsap.set(rings, { rotation: 0, scale: 1 });
        if (reducedMotion) return settle(true), null;
        settle(false);
        const tl = drain().eventCallback('onReverseComplete', () => settle(true));
        tl.progress(1).reverse();
        return tl;
      }
      settle(false);
      return drain().set(light, { autoAlpha: 0 });
    }, ['View photo', 'Close']);
    return () => k.destroy();
  },
};
