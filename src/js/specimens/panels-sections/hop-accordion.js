/** Hop Accordion: a little paper frog marks the open section. Open another and it hops there, one hop per section in between, squashing on each landing; the section opens as it arrives. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Hop Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Selection-dependent', 'Sequential', 'Direction-aware', 'Elastic'],
  effect: ['Hopping', 'Squashing', 'Anticipation-motion', 'Expansion'],
  purpose: ['Wayfinding', 'Delight', 'Continuity'],
  properties: ['Position', 'Scale', 'Size'],
  description: 'An accordion with a tiny paper frog that sits beside the open section. Open another and the frog crouches and hops over to it, one hop for every section in between, squashing on each landing; the new section opens just as it arrives and the old one closes behind it.',
  params: [
    { key: 'hop', label: 'Hop height', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.25, unit: 'em', default: 1.5, live: true },
    { key: 'pace', label: 'Hop time', group: 'Motion', type: 'range', min: 0.15, max: 0.6, step: 0.05, unit: 's', default: 0.3, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Frog'),
  ],
};

const QA = [['Paper weight', '120 gsm, smooth, takes ink without bleeding.'], ['Binding', 'Lay-flat thread binding, opens to 180°.'], ['Size', 'A5, 148 × 210 mm, 96 pages.'], ['Care', 'Keep dry; the cover darkens nicely with age.']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-hop">
        <div class="sp-hop__wrap">
          <i class="sp-hop__frog" aria-hidden="true"><i></i></i>
          <div class="sp-hop__list">
            ${QA.map(([q, a], i) => `<section class="sp-hop__item"><button type="button" class="sp-hop__q" aria-expanded="${!i}">${q}</button><div class="sp-hop__a"><p>${a}</p></div></section>`).join('')}
          </div>
        </div>
      </div>`);
    const frog = k.$('.sp-hop__frog');
    const qs = k.$$('.sp-hop__q');
    const as = k.$$('.sp-hop__a');
    as.forEach((a, i) => gsap.set(a, { height: i ? 0 : 'auto' }));
    // The frog's y for section i: the middle of its header (offsetTop is from the positioned wrap).
    const spot = (i) => qs[i].offsetTop + qs[i].offsetHeight / 2 - frog.offsetHeight / 2;
    gsap.set(frog, { y: spot(0) });
    let cur = 0;
    let tl;

    qs.forEach((q, i) => k.on(q, 'click', () => {
      if (i === cur || tl?.isActive()) return;
      const from = cur;
      cur = i;
      qs.forEach((x, j) => x.setAttribute('aria-expanded', String(j === i)));
      const dir = i > from ? 1 : -1;
      const em = parseFloat(getComputedStyle(frog).fontSize);
      tl = gsap.timeline();
      // Close the old section first, so the headers stand still under the hops
      tl.to(as[from], { height: 0, duration: reducedMotion ? 0 : 0.25, ease: 'power2.in' });
      if (reducedMotion) {
        tl.add(() => gsap.set(frog, { y: spot(i) })).set(as[i], { height: 'auto' });
        return;
      }
      for (let s = from + dir; dir > 0 ? s <= i : s >= i; s += dir) {
        const target = () => spot(s);
        tl.to(frog, { scaleY: 0.7, scaleX: 1.2, duration: p.pace * 0.3, ease: 'power2.out' })
          .to(frog, { y: () => (gsap.getProperty(frog, 'y') + target()) / 2 - p.hop * em, scaleY: 1.15, scaleX: 0.9, duration: p.pace * 0.5, ease: 'power2.out' })
          .to(frog, { y: target, scaleY: 1, scaleX: 1, duration: p.pace * 0.5, ease: 'power2.in' })
          .to(frog, { scaleY: 0.8, scaleX: 1.15, duration: 0.06 })
          .to(frog, { scaleY: 1, scaleX: 1, duration: 0.25, ease: 'elastic.out(1, 0.4)' });
      }
      tl.to(as[i], { height: () => as[i].scrollHeight, duration: 0.35, ease: 'back.out(1.4)' }, '-=0.25');
    }));

    return () => { tl?.kill(); k.destroy(); };
  },
};
