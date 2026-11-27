/** Parts Drawer: "Inspect" takes the cart drawer apart: header, items, total and button pull away from each other along dashed guides, each part labelled; "Assemble" slots them back. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Parts Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Toggle-dependent', 'Staggered', 'Hierarchical', 'Reversible'],
  effect: ['Disassembly', 'Sliding', 'Shape-disassembly'],
  purpose: ['Hierarchy', 'Storytelling'],
  properties: ['Position', 'Spacing', 'Rotation', 'Layout'],
  description: 'A cart drawer that shows how it is built. Press Inspect and it comes apart: the header, the item rows, the total and the checkout button each pull away from the next along dashed guides, tilt slightly and get a label, like parts laid out on a bench. Assemble slots them back together.',
  params: [
    { key: 'gap', label: 'Gap', group: 'Layout', type: 'range', min: 0.5, max: 3, step: 0.25, unit: 'em', default: 1.5, live: true },
    { key: 'tilt', label: 'Tilt', group: 'Motion', type: 'range', min: 0, max: 8, step: 1, unit: '°', default: 3, live: true },
    tone('#4f6b4a'),
  ],
};

const PARTS = [
  ['Header', '<b>Your cart</b><span>3 items</span>'],
  ['Item', '<i></i><span>Field notebook</span><em>$18</em>'],
  ['Item', '<i></i><span>Ink, sepia</span><em>$12</em>'],
  ['Summary', '<span>Total</span><em>$30</em>'],
  ['Action', '<span class="sp-pts__go">Checkout</span>'],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-pts">
        <div class="sp-pn__page"><span class="sp-pn__kick">Shop</span><b class="sp-pn__h">Notebooks</b></div>
        <aside class="sp-pts__drawer" aria-label="Cart">
          ${PARTS.map(([tag, html], i) => `<div class="sp-pts__part sp-pts__part--${i}">${html}<small class="sp-pts__tag">${tag}</small></div>`).join('')}
        </aside>
        <button type="button" class="sp-pn__btn sp-pts__btn" aria-pressed="false">Inspect</button>
      </div>`);
    const parts = k.$$('.sp-pts__part');
    const tags = k.$$('.sp-pts__tag');
    const btn = k.$('.sp-pts__btn');
    gsap.set(tags, { autoAlpha: 0, x: '-0.5em' });

    const set = (apart) => {
      btn.setAttribute('aria-pressed', String(apart));
      btn.textContent = apart ? 'Assemble' : 'Inspect';
      const t = reducedMotion ? 0 : 0.6;
      const mid = (parts.length - 1) / 2;
      // Parts spread out from the middle one, so the drawer opens up evenly
      gsap.to(parts, {
        y: (i) => (apart ? `${(i - mid) * p.gap}em` : 0),
        x: (i) => (apart ? `${(i % 2 ? -1 : 1) * 0.6}em` : 0),
        rotation: (i) => (apart ? (i % 2 ? -1 : 1) * p.tilt : 0),
        duration: t,
        ease: apart ? 'back.out(1.6)' : 'power3.inOut',
        stagger: { each: t * 0.08, from: 'center' },
      });
      gsap.to(k.$('.sp-pts__drawer'), { '--guides': apart ? 1 : 0, duration: t });
      gsap.to(tags, { autoAlpha: apart ? 1 : 0, x: apart ? 0 : '-0.5em', duration: t * 0.5, delay: apart ? t * 0.6 : 0, stagger: 0.04 });
    };
    k.on(btn, 'click', () => set(btn.getAttribute('aria-pressed') !== 'true'));

    return () => k.destroy();
  },
};
