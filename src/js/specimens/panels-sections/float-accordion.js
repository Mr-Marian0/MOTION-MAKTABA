/** Float Accordion: the sections float on a waterline like little boats, each riding its own swell; open one and it rises out of the water and opens up while the others bob lower. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Float Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard', 'Idle'],
  behavior: ['Floating', 'Desynchronized', 'Selection-dependent', 'Continuous'],
  effect: ['Floating', 'Bobbing', 'Swaying', 'Rising'],
  purpose: ['Delight', 'Decoration', 'Hierarchy'],
  properties: ['Position', 'Rotation', 'Size'],
  description: 'A seaside FAQ whose sections float like little paper boats on a waterline, each riding its own slow swell out of step with its neighbours. Open one and it rises up out of the water to unfold its answer while the others sink a little lower and keep bobbing.',
  params: [
    { key: 'swell', label: 'Swell', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: 'em', default: 0.4 },
    { key: 'rock', label: 'Rock', group: 'Motion', type: 'range', min: 0, max: 6, step: 0.5, unit: '°', default: 2.5 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

const QA = [['Tides?', 'Twice a day, high at nine this week.'], ['Boat hire?', 'From the jetty, by the hour, life vests included.'], ['Swimming?', 'Flags mark the safe area, lifeguards until six.']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-flt2">
        <div class="sp-flt2__row">
          ${QA.map(([q, a]) => `<section class="sp-flt2__boat"><button type="button" class="sp-flt2__q" aria-expanded="false">${q}</button><div class="sp-flt2__a"><p>${a}</p></div></section>`).join('')}
        </div>
        <i class="sp-flt2__water"></i>
      </div>`);
    const boats = k.$$('.sp-flt2__boat');
    const qs = k.$$('.sp-flt2__q');
    const as = k.$$('.sp-flt2__a');
    gsap.set(as, { height: 0 });
    // Each boat rides its own swell, out of step with the others.
    const bob = boats.map((b, i) => (reducedMotion ? null : gsap.fromTo(b,
      { y: `${-p.swell}em`, rotation: (i % 2 ? -1 : 1) * p.rock },
      { y: `${p.swell}em`, rotation: (i % 2 ? 1 : -1) * p.rock, duration: 2.4 + i * 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4 })));

    qs.forEach((q, i) => k.on(q, 'click', () => {
      const open = q.getAttribute('aria-expanded') !== 'true';
      qs.forEach((x, j) => {
        const on = open && j === i;
        x.setAttribute('aria-expanded', String(on));
        gsap.to(as[j], { height: on ? as[j].scrollHeight : 0, duration: reducedMotion ? 0 : 0.5, ease: on ? 'back.out(1.4)' : 'power2.inOut' });
        // The open boat rises out of the water; the rest sit a little lower
        gsap.to(boats[j], { marginBottom: on ? '2.2em' : open ? '-0.6em' : '0em', duration: reducedMotion ? 0 : 0.6, ease: 'power2.out' });
      });
    }));

    return () => { bob.forEach((t) => t?.kill()); k.destroy(); };
  },
};
