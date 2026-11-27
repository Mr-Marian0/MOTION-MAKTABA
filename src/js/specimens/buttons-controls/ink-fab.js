/** Ink FAB: each action lands like a drop of ink seen from above: the drop falls, splats into a blot and flicks droplets around it. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Activation-dependent', 'Randomized', 'Sequential', 'Reversible'],
  effect: ['Dropping', 'Fluid-deformation', 'Exploding', 'Scattering', 'Expansion'],
  purpose: ['Delight', 'Hierarchy'],
  properties: ['Shape', 'Scale', 'Position'],
  description: 'Seen from above, a drop of ink falls onto each action\'s spot: it shrinks as it falls away, splats into a ragged blot that overshoots and settles, and flicks droplets all around. The white button then rises out of the blot. Closing sucks the ink back in.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Input, Input' },
    { key: 'splash', label: 'Droplets', group: 'Motion', type: 'range', min: 0, max: 14, step: 1, default: 8 },
    { key: 'rough', label: 'Splat roughness', group: 'Shape', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

const SPOTS = [[0.4, 6.4], [5.6, 3.4], [6.6, -1]]; // em from the button center (x right, y up)

/** A ragged closed blot around (0,0), smoothed through midpoints. */
function blot(rough, R) {
  const n = 18;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 30 + R(-3, 3) * rough + (Math.random() < 0.3 ? R(4, 9) * rough : 0); // occasional finger
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  const mid = (a, b) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  return `M${mid(pts[n - 1], pts[0])} ${pts.map((q, i) => `Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${mid(q, pts[(i + 1) % n])}`).join(' ')}Z`;
}
export default {
  mount(stage, p, { gsap: g, reducedMotion }) {
    const k = kit(stage, g);
    const R = g.utils.random;
    const acts = labelsOf(p.labels, ['Input', 'Input']).slice(0, SPOTS.length);
    const drops = () => Array.from({ length: Number(p.splash) }, () => {
      const a = R(0, Math.PI * 2);
      const d = R(36, 50);
      return `<circle class="sp-ink__dot" r="${R(1.5, 4).toFixed(1)}" data-x="${(Math.cos(a) * d).toFixed(1)}" data-y="${(Math.sin(a) * d).toFixed(1)}"/>`;
    }).join('');
    k.html(`
      <div class="sp sp-fabx sp-ink">
        <div class="sp-fabx__hub">
          ${acts.map((a, i) => `
            <div class="sp-ink__spot" style="left:${SPOTS[i][0]}em;bottom:${SPOTS[i][1]}em">
              <svg class="sp-ink__splat" viewBox="-50 -50 100 100" aria-hidden="true"><path d="${blot(Number(p.rough), R)}"/>${drops()}</svg>
              <i class="sp-ink__drop"></i>
              <button type="button" class="sp-ink__act">${esc(a)}</button>
            </div>`).join('')}
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const spots = k.$$('.sp-ink__spot').map((el) => ({
      blot: el.querySelector('path'),
      dots: [...el.querySelectorAll('.sp-ink__dot')],
      drop: el.querySelector('.sp-ink__drop'),
      act: el.querySelector('.sp-ink__act'),
    }));
    const items = spots.map((s) => s.act);
    spots.forEach((s) => {
      g.set(s.blot, { scale: 0, svgOrigin: '0 0' });
      g.set(s.dots, { x: 0, y: 0, scale: 0 });
      g.set([s.drop, s.act], { scale: 0, autoAlpha: 0 });
    });

    fabToggle(k, g, k.$('.sp-fabx__main'), items, (open) => {
      const tl = g.timeline();
      spots.forEach((s, i) => {
        if (open) {
          const at = i * 0.18;
          tl.fromTo(s.drop, { scale: 2.6, autoAlpha: 0.25 }, { scale: 0.45, autoAlpha: 1, duration: 0.3, ease: 'power2.in' }, at)
            .set(s.drop, { autoAlpha: 0 })
            .fromTo(s.blot, { scale: 0.15 }, { scale: 1.14, duration: 0.16, ease: 'power3.out', svgOrigin: '0 0' })
            .to(s.blot, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)', svgOrigin: '0 0' })
            .to(s.dots, { x: (_, el) => el.dataset.x, y: (_, el) => el.dataset.y, scale: 1, duration: 0.45, ease: 'expo.out', stagger: 0.01 }, '<-0.05')
            .to(s.act, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2.5)' }, '<0.08');
        } else {
          const at = (spots.length - 1 - i) * 0.1;
          tl.to(s.act, { scale: 0, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, at)
            .to(s.dots, { x: 0, y: 0, scale: 0, duration: 0.3, ease: 'power3.in' }, at + 0.05)
            .to(s.blot, { scale: 0, duration: 0.3, ease: 'power3.in', svgOrigin: '0 0' }, at + 0.12);
        }
      });
      return tl;
    }, reducedMotion);

    return () => k.destroy();
  },
};
