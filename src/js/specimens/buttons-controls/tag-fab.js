/** Tag FAB: an ink line grows up out of the button and slanted tags unroll from it as it passes each stop. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Tag FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Activation-dependent', 'Sequential', 'Staggered', 'Reversible'],
  effect: ['Extending', 'Rising', 'Sweeping', 'Retracting'],
  purpose: ['Hierarchy', 'Wayfinding', 'Affordance'],
  properties: ['Size', 'Clip & mask', 'Position'],
  description: 'A black line grows upward out of the button like a stem. Each time it reaches a stop, a small node pops on and a slanted tag unrolls sideways from the line. Closing rolls the tags back in from the top and the line sinks down.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Input text, Input text, Input text' },
    { key: 'speed', label: 'Grow time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.6, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Tag color'),
  ],
};

const BASE = 1.9; // the line starts at the button's top edge (em above the center)
const GAP = 2.4;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Input text', 'Input text']).slice(0, 4);
    const ys = acts.map((_, i) => BASE + 1.1 + i * GAP); // nearest the button first
    const top = ys[ys.length - 1] + 0.6;
    k.html(`
      <div class="sp sp-fabx sp-tag">
        <div class="sp-fabx__hub">
          <i class="sp-tag__line" style="bottom:${BASE}em;height:${top - BASE}em"></i>
          ${acts.map((a, i) => `
            <i class="sp-tag__node" style="bottom:${ys[i]}em"></i>
            <button type="button" class="sp-tag__act" style="bottom:${ys[i]}em;font-size:${(0.82 + i * 0.1).toFixed(2)}em">${esc(a)}</button>`).join('')}
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const line = k.$('.sp-tag__line');
    const nodes = k.$$('.sp-tag__node');
    const items = k.$$('.sp-tag__act');
    const SHUT = 'inset(0% 100% 0% 0%)';
    gsap.set(line, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(nodes, { scale: 0 });
    gsap.set(items, { clipPath: SHUT });

    fabToggle(k, gsap, k.$('.sp-fabx__main'), items, (open) => {
      const t = Number(p.speed);
      const tl = gsap.timeline();
      if (open) {
        tl.to(line, { scaleY: 1, duration: t, ease: 'none' });
        // When the tip passes a stop: node pops, tag unrolls.
        ys.forEach((y, i) => {
          const at = ((y - BASE) / (top - BASE)) * t;
          tl.to(nodes[i], { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at)
            .fromTo(items[i], { clipPath: SHUT, x: -6 }, { clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 0.45, ease: 'power3.out' }, at);
        });
      } else {
        tl.to(items.slice().reverse(), { clipPath: SHUT, duration: 0.22, stagger: 0.06, ease: 'power2.in' })
          .to(nodes.slice().reverse(), { scale: 0, duration: 0.15, stagger: 0.06 }, 0.05)
          .to(line, { scaleY: 0, duration: t * 0.6, ease: 'power2.in' }, '-=0.15');
      }
      return tl;
    }, reducedMotion);

    return () => k.destroy();
  },
};
