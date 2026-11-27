/** Wheel FAB: a disc grows from the button, then a second ring of wedge-shaped actions expands out of it. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wheel FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Activation-dependent', 'Staggered', 'Hierarchical', 'Reversible'],
  effect: ['Expansion', 'Divergence', 'Rotating'],
  purpose: ['Hierarchy', 'Affordance'],
  properties: ['Scale', 'Rotation', 'Clip & mask', 'Position'],
  description: 'A pie-menu FAB. A pale disc grows from the button first, then a second layer of wedge-shaped actions swings open and expands just past its rim, one after another. Hovering a wedge slides it outward.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Input here, Input here, Input here' },
    { key: 'spread', label: 'Spread', group: 'Layout', type: 'range', min: 60, max: 120, step: 5, unit: '°', default: 90 },
    tone('#a07a52', 'tone', '--sp-accent', 'Color'),
  ],
};

const pt = (deg, rr = 75) => {
  const a = (deg * Math.PI) / 180;
  return `${(50 + Math.sin(a) * rr).toFixed(1)}% ${(50 - Math.cos(a) * rr).toFixed(1)}%`;
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Input here', 'Input here']).slice(0, 5);
    const step = Number(p.spread) / acts.length;
    k.html(`
      <div class="sp sp-fabx sp-wheel">
        <div class="sp-fabx__hub">
          <i class="sp-wheel__disc"></i>
          ${acts.map((a, i) => {
            const a1 = i * step;
            const mid = a1 + step / 2;
            const m = (mid * Math.PI) / 180;
            return `<button type="button" class="sp-wheel__sec" style="clip-path:polygon(50% 50%, ${pt(a1)}, ${pt(mid)}, ${pt(a1 + step)});--dx:${(Math.sin(m) * 0.4).toFixed(2)}em;--dy:${(-Math.cos(m) * 0.4).toFixed(2)}em"><span style="rotate:${mid - 90}deg">${esc(a)}</span></button>`;
          }).join('')}
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const disc = k.$('.sp-wheel__disc');
    const secs = k.$$('.sp-wheel__sec');
    gsap.set(disc, { scale: 0 });
    gsap.set(secs, { scale: 0.2, rotation: -40, autoAlpha: 0 });

    fabToggle(k, gsap, k.$('.sp-fabx__main'), secs, (open) =>
      open
        ? gsap.timeline()
          .to(disc, { scale: 1, duration: 0.4, ease: 'power3.out' })
          .to(secs, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: 'back.out(1.6)' }, '-=0.15')
        : gsap.timeline()
          .to(secs.slice().reverse(), { scale: 0.2, rotation: -40, autoAlpha: 0, duration: 0.25, stagger: 0.05, ease: 'power2.in' })
          .to(disc, { scale: 0, duration: 0.3, ease: 'power2.in' }, '-=0.1'), reducedMotion);

    return () => k.destroy();
  },
};
