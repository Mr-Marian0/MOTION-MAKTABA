/** Orbit Badges: earned achievement badges circle a profile on a tilted elliptical track, passing in front of and behind it; hover the track to slow it, and a newly earned badge joins the orbit. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const BADGES = [['🔥', '30-day streak'], ['★', 'Top reviewer'], ['✎', '100 posts'], ['♥', 'Helpful']];

export const meta = {
  title: 'Orbit Badges',
  element: 'Badges',
  trigger: ['Idle', 'Hover', 'Click'],
  behavior: ['Orbiting', 'Continuous', 'Hover-dependent'],
  effect: ['Elliptical-motion', 'Revolving', 'Scaling'],
  purpose: ['Delight', 'Hierarchy', 'Feedback'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A profile header where earned badges orbit the avatar on a tilted ellipse, like moons. Each badge grows and comes to the front as it swings toward you and shrinks and passes behind the avatar on the far side. Point at the system and the orbit slows right down so you can read them; "Earn a badge" sends a new one flying in to join the circuit.',
  params: [
    { key: 'period', label: 'Orbit time', group: 'Motion', type: 'range', min: 3, max: 20, step: 1, unit: 's', default: 9, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Badges'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-orb">
        <div class="sp-orb__sys" role="list" aria-label="Badges">
          <i class="sp-orb__track" aria-hidden="true"></i>
          <i class="sp-orb__me" aria-hidden="true"></i>
          ${BADGES.map(([ic, name]) => `<b class="sp-orb__b" role="listitem" title="${name}" aria-label="${name}">${ic}</b>`).join('')}
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost">Earn a badge</button>
      </div>`);
    const sys = k.$('.sp-orb__sys');
    let bs = k.$$('.sp-orb__b');
    let RX = 80, RY = 26;
    k.resize(sys, () => { RX = sys.offsetWidth * 0.42; RY = sys.offsetHeight * 0.2; place(); });
    const s = { a: 0, rate: 1 };
    // badge i sits at angle a + i·(2π/n) on the ellipse; sin > 0 means the near side (in front, larger)
    function place() {
      bs.forEach((b, i) => {
        const t = s.a + (i / bs.length) * Math.PI * 2;
        const near = Math.sin(t);
        gsap.set(b, { x: Math.cos(t) * RX, y: near * RY, scale: 0.75 + near * 0.3, zIndex: near > 0 ? 3 : 1, opacity: 0.6 + (near + 1) * 0.2 });
      });
    }
    const tick = (t, ms) => { s.a += ((ms / 1000) * Math.PI * 2 * s.rate) / p.period; place(); };
    if (reducedMotion) place(); else gsap.ticker.add(tick);
    k.on(sys, 'pointerenter', () => gsap.to(s, { rate: 0.12, duration: 0.6 }));
    k.on(sys, 'pointerleave', () => gsap.to(s, { rate: 1, duration: 0.6 }));
    const extra = [['⚑', 'First event'], ['☀', 'Early bird'], ['✓', 'Verified']];
    k.on(k.$('.sp-df__btn'), 'click', (e) => {
      const next = extra.shift();
      if (!next) return (e.currentTarget.disabled = true);
      sys.insertAdjacentHTML('beforeend', `<b class="sp-orb__b" role="listitem" title="${next[1]}" aria-label="${next[1]}">${next[0]}</b>`);
      const b = sys.lastElementChild;
      bs = k.$$('.sp-orb__b');
      place();
      if (!reducedMotion) gsap.from(b, { y: '-6em', scale: 2, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', clearProps: 'opacity' });
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
