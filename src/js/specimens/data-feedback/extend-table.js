/** Extend Table: each order row has a detail panel folded away under it: open a row and the panel extends downward out of the row like a drawer, its line items sliding out one by one; close and it retracts. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const ORDERS = [
  ['#1042', 'Paid', '£84', [['Linen apron', '£32'], ['Clay mug × 2', '£52']]],
  ['#1043', 'Packing', '£46', [['Oak frame', '£28'], ['Brass hook × 3', '£18']]],
  ['#1044', 'Shipped', '£120', [['Wool throw', '£96'], ['Gift wrap', '£4'], ['Delivery', '£20']]],
];

export const meta = {
  title: 'Extend Table',
  element: 'Tables',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Hierarchical'],
  effect: ['Extending', 'Retracting', 'Sliding'],
  purpose: ['Hierarchy', 'Continuity', 'Orientation'],
  properties: ['Clip & mask', 'Position'],
  description: 'An orders table with expandable rows. Press a row\'s arrow and a detail panel extends down out of the row like a drawer pulled open, pushing the rows below down smoothly, and the line items inside slide out one after another. Press again and the panel retracts back up under its row. Several rows can be open at once.',
  params: [
    { key: 'time', label: 'Extend time', group: 'Motion', type: 'range', min: 0.15, max: 1, step: 0.05, unit: 's', default: 0.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Open row'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-ext">
        <div class="sp-df__card">
          <span class="sp-df__kick">Recent orders</span>
          <div class="sp-ext__table" role="table" aria-label="Recent orders">
            ${ORDERS.map(([id, st, tot, items], i) => `
              <div class="sp-ext__row" role="row"><button type="button" class="sp-ext__tog" aria-expanded="false" aria-controls="ext-${i}" aria-label="Details for order ${id}">▸</button><span role="cell">${id}</span><span role="cell">${st}</span><b role="cell">${tot}</b></div>
              <div class="sp-ext__drawer" id="ext-${i}" role="region" aria-label="Order ${id} items"><ul>${items.map(([n, pr]) => `<li><span>${n}</span><span>${pr}</span></li>`).join('')}</ul></div>`).join('')}
          </div>
        </div>
      </div>`);
    // The drawer's height is animated from 0 to its content's height (layout, but only during a click, on one element)
    k.$$('.sp-ext__tog').forEach((btn) => {
      const drawer = k.$(`#${btn.getAttribute('aria-controls')}`);
      const row = btn.parentElement;
      const items = [...drawer.querySelectorAll('li')];
      gsap.set(drawer, { height: 0 });
      k.on(btn, 'click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        row.classList.toggle('is-open', open);
        const d = reducedMotion ? 0 : p.time;
        gsap.to(btn, { rotation: open ? 90 : 0, duration: d * 0.6 });
        if (open) {
          gsap.to(drawer, { height: 'auto', duration: d, ease: 'power3.out', overwrite: true });
          gsap.fromTo(items, { y: '-0.8em', opacity: 0 }, { y: 0, opacity: 1, duration: d * 0.8, stagger: d * 0.15, delay: d * 0.2, ease: 'power2.out' });
        } else gsap.to(drawer, { height: 0, duration: d * 0.8, ease: 'power3.inOut', overwrite: true });
      });
    });
    return () => k.destroy();
  },
};
