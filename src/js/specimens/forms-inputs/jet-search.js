/** Jet Search: press Enter and your query, as a little pill, is propelled along the bar by puffs of exhaust, gathering speed until it shoots out of the far end; the results count lands behind it. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Jet Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Click'],
  behavior: ['Event-driven', 'Sequential', 'Momentum-driven'],
  effect: ['Propelling', 'Accelerating', 'Particle-trail'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A search bar that sends your query off under its own power. Press Enter or the arrow button: the text lifts out of the field as a pill, puffs of exhaust burst from its tail, and it is pushed along the bar in short thrusts, faster each time, until it shoots off the right edge. A "12 results" note then drops in where it left.',
  params: [
    { key: 'thrusts', label: 'Thrusts', group: 'Motion', type: 'range', min: 2, max: 8, step: 1, unit: '', default: 4, live: true },
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Exhaust'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('jet');
    k.html(`
      <div class="sp sp-fi sp-jet">
        <div class="sp-fi__wrap">
          <form class="sp-fi__box sp-jet__bar" role="search">
            <input class="sp-fi__input" id="${id}" type="search" value="linen notebooks" aria-label="Search the shop" />
            <button class="sp-jet__go" aria-label="Search">→</button>
            <span class="sp-jet__sky" aria-hidden="true"></span>
          </form>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const bar = k.$('.sp-jet__bar');
    const input = k.$('.sp-fi__input');
    const sky = k.$('.sp-jet__sky');
    const msg = k.$('.sp-fi__msg');
    let W = 1;
    k.resize(bar, () => (W = bar.offsetWidth));
    k.on(bar, 'submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      msg.textContent = '';
      const done = () => (msg.textContent = `${8 + (q.length % 9)} results for “${q}”`);
      if (reducedMotion) return done();
      const pill = document.createElement('b');
      pill.className = 'sp-jet__pill';
      pill.textContent = q;
      sky.append(pill);
      // n thrusts, each a puff at the tail and a burst forward; the gaps shrink so it accelerates
      const n = Math.round(p.thrusts);
      const tl = gsap.timeline({ onComplete: () => { pill.remove(); done(); } })
        .fromTo(pill, { y: 0, scale: 1 }, { y: '-0.3em', scale: 0.9, duration: 0.15 });
      let x = 0;
      for (let i = 0; i < n; i++) {
        const step = (W * (i + 1)) / ((n * (n + 1)) / 2);
        const dur = (p.time / n) * (1 - i / (n + 1));
        const from = x; // the pill's position when this thrust fires (x moves on before the call runs)
        tl.call(() => {
          const puff = document.createElement('i');
          puff.className = 'sp-jet__puff';
          sky.append(puff);
          gsap.fromTo(puff, { x: from - 4, scale: 0.3, autoAlpha: 0.9 }, { x: from - 30 - Math.random() * 20, y: (Math.random() - 0.5) * 16, scale: 1.6, autoAlpha: 0, duration: 0.6, ease: 'power2.out', onComplete: () => puff.remove() });
        });
        x += step;
        tl.to(pill, { x, duration: dur, ease: 'power3.out' });
      }
      tl.to(pill, { x: x + W * 0.6, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
      input.value = '';
    });
    return () => k.destroy();
  },
};
