/** Pinch Accordion: a section closes by pinching in at its waist like a cinched bag, then drawing shut; it opens by puffing out and letting go. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Pinch Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Selection-dependent', 'Elastic', 'Reversible'],
  effect: ['Pinching', 'Contracting', 'Springing'],
  purpose: ['Hierarchy', 'Feedback', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Size'],
  description: 'A FAQ accordion whose answers close by pinching: the open panel cinches in at its waist like a drawstring bag, then the pinch draws it shut. Opening one fills it out pinched and lets the waist spring loose.',
  params: [
    { key: 'pinch', label: 'Pinch', group: 'Shape', type: 'range', min: 10, max: 48, step: 2, unit: '%', default: 38, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#b3412e'),
  ],
};

const QA = [
  ['How is the paper made?', 'Rag fibre, pressed and dried by hand in small sheets.'],
  ['Do you ship abroad?', 'Yes, in flat card mailers, tracked, within a week.'],
  ['Can I return a pad?', 'Unused pads come back free for thirty days.'],
];

/** A rectangle whose sides are pulled in around the middle by w percent. */
const waist = (w) => {
  const side = (x0, dir) => Array.from({ length: 13 }, (_, i) => [x0 + dir * w * Math.sin((i / 12) * Math.PI) ** 2, (i / 12) * 100]);
  const pts = [...side(0, 1), ...side(100, -1).reverse()];
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')})`;
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-pch">
        <div class="sp-pch__list">
          ${QA.map(([q, a], i) => `
            <section class="sp-pch__item">
              <button type="button" class="sp-pch__q" aria-expanded="${!i}"><span>${q}</span><i>+</i></button>
              <div class="sp-pch__a"><p>${a}</p></div>
            </section>`).join('')}
        </div>
      </div>`);
    const qs = k.$$('.sp-pch__q');
    const as = k.$$('.sp-pch__a');
    const s = as.map(() => k.track({ w: 0 }));
    const draw = (i) => (as[i].style.clipPath = waist(s[i].w));
    as.forEach((a, i) => (gsap.set(a, { height: i ? 0 : 'auto' }), draw(i)));
    gsap.set(k.$$('.sp-pch__q i')[0], { rotation: 45 });

    const set = (i, open) => {
      const t = reducedMotion ? 0 : p.time;
      qs[i].setAttribute('aria-expanded', String(open));
      gsap.to(qs[i].querySelector('i'), { rotation: open ? 45 : 0, duration: t * 0.6 });
      const full = as[i].scrollHeight;
      gsap.timeline()
        .to(s[i], open ? { w: p.pinch, duration: 0 } : { w: p.pinch, duration: t * 0.45, ease: 'power2.in', onUpdate: () => draw(i) })
        .to(as[i], { height: open ? full : 0, duration: t * 0.55, ease: open ? 'power2.out' : 'power3.in' })
        .add(() => draw(i))
        .to(s[i], { w: 0, duration: open ? t * 1.2 : 0, ease: 'elastic.out(1, 0.35)', onUpdate: () => draw(i) });
    };
    qs.forEach((q, i) => k.on(q, 'click', () => {
      const open = q.getAttribute('aria-expanded') !== 'true';
      qs.forEach((other, j) => j !== i && other.getAttribute('aria-expanded') === 'true' && set(j, false));
      set(i, open);
    }));

    return () => k.destroy();
  },
};
