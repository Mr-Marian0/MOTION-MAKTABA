/** Flip Profile: the card flips over to show stats that rise in; Follow morphs into Following. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Flip Profile',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Staggered'],
  effect: ['Axial-rotation', 'Rising', 'Morphing'],
  purpose: ['Hierarchy', 'Continuity', 'Feedback'],
  properties: ['Rotation', 'Size', 'Opacity'],
  description: 'A profile card with two sides. "More" flips it over to the stats, which rise in one by one. "Follow" stretches into "Following".',
  params: [
    { key: 'name', label: 'Name', group: 'Content', type: 'text', default: 'Ana Reyes' },
    { key: 'axis', label: 'Flip axis', group: 'Motion', type: 'choice', options: ['Y', 'X'], default: 'Y', live: true },
    { key: 'speed', label: 'Flip time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.8, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Avatar color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const initials = String(p.name).split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2);
    const stats = [['Designs', 128], ['Followers', '4.2k'], ['Drawers', 8]];
    k.html(`
      <div class="sp sp-prof">
        <div class="sp-prof__card">
          <section class="sp-prof__face">
            <span class="sp-prof__avatar">${esc(initials)}</span>
            <h4 class="sp-prof__name">${esc(p.name)}</h4>
            <p class="sp-prof__role">Motion designer</p>
            <div class="sp-prof__row">
              <button type="button" class="sp-prof__follow" aria-pressed="false">Follow</button>
              <button type="button" class="sp-prof__flip">More ↻</button>
            </div>
          </section>
          <section class="sp-prof__face sp-prof__face--back" aria-hidden="true">
            ${stats.map(([l, v]) => `<p class="sp-prof__stat"><b>${v}</b>${l}</p>`).join('')}
            <button type="button" class="sp-prof__flip" tabindex="-1">Back ↺</button>
          </section>
        </div>
      </div>`);
    const card = k.$('.sp-prof__card');
    const [front, back] = k.$$('.sp-prof__face');
    const rows = k.$$('.sp-prof__stat');
    const follow = k.$('.sp-prof__follow');
    let flipped = false;

    k.$$('.sp-prof__flip').forEach((b) => k.on(b, 'click', () => {
      flipped = !flipped;
      const prop = p.axis === 'X' ? 'rotationX' : 'rotationY';
      const t = reducedMotion ? 0 : Number(p.speed);
      gsap.set(card, { rotationX: 0, rotationY: 0, [prop]: flipped ? 0 : 180 });
      gsap.set(back, { rotationX: 0, rotationY: 0, [prop]: 180 });
      gsap.to(card, { [prop]: flipped ? 180 : 0, duration: t, ease: 'power3.inOut' });
      if (flipped) gsap.fromTo(rows, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, delay: t * 0.5, duration: 0.5, ease: 'expo.out' });
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      k.$$('.sp-prof__flip').forEach((x) => (x.tabIndex = x.closest('[aria-hidden="true"]') ? -1 : 0));
      follow.tabIndex = flipped ? -1 : 0;
      (flipped ? back : front).querySelector('.sp-prof__flip').focus({ preventScroll: true });
    }));

    k.on(follow, 'click', () => {
      const on = follow.getAttribute('aria-pressed') !== 'true';
      const w = follow.offsetWidth;
      follow.setAttribute('aria-pressed', String(on));
      follow.textContent = on ? 'Following ✓' : 'Follow';
      if (!reducedMotion) gsap.fromTo(follow, { width: w }, { width: follow.scrollWidth + 2, duration: 0.45, ease: 'back.out(2)', clearProps: 'width' });
    });

    return () => k.destroy();
  },
};
