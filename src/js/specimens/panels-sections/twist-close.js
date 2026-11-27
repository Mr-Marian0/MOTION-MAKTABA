/** Twist Close: closing the sidebar wrings it: the free end twists the most, the edge it hangs from hardly at all, then it whips away. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Twist Close',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Anchored'],
  effect: ['Torsional-deformation', 'Sliding'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Rotation', 'Position', 'Clip & mask'],
  description: 'A sidebar that closes by being wrung out. The twist grows down its length, barely moving at the top and turning almost edge-on at the bottom, then the twisted panel whips off the side. Opening untwists it back into place.',
  params: [
    { key: 'twist', label: 'Twist', group: 'Shape', type: 'range', min: 30, max: 88, step: 2, unit: '°', default: 80, live: true },
    { key: 'bands', label: 'Bands', group: 'Shape', type: 'range', min: 6, max: 24, step: 1, unit: '', default: 14 },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Sidebar'),
  ],
};

const MENU = ['Overview', 'Projects', 'Assets', 'Team', 'Settings'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const menu = `<nav class="sp-tws__menu"><span class="sp-pn__kick">Studio</span>${MENU.map((m, i) => `<span class="sp-tws__item${i ? '' : ' is-on'}">${m}</span>`).join('')}</nav>`;
    k.html(`
      <div class="sp sp-pn sp-tws">
        <div class="sp-pn__page sp-tws__page"><span class="sp-pn__kick">Dashboard</span><b class="sp-pn__h">This week</b>${bars(5)}</div>
        <aside class="sp-tws__side">${menu}<div class="sp-cc__pieces"></div></aside>
        <button type="button" class="sp-pn__btn sp-pn__corner" aria-expanded="true">Close menu</button>
      </div>`);
    const side = k.$('.sp-tws__side');
    const real = k.$('.sp-tws__menu');
    const page = k.$('.sp-tws__page');
    const btn = k.$('.sp-pn__corner');
    const bands = pieces(k.$('.sp-cc__pieces'), menu, grid(1, Math.round(p.bands))).map((b) => b.el);
    gsap.set(bands, { autoAlpha: 0, transformPerspective: 500 });
    const s = k.track({ t: 0 });
    let open = true;

    // t 0 → 1 wrings it (twist grows with distance from the top); 1 → 2 slides the twisted panel away.
    const draw = () => {
      const w = Math.min(s.t, 1);
      bands.forEach((el, i) => gsap.set(el, { rotationY: w * p.twist * ((i + 0.5) / bands.length) ** 0.9 }));
      gsap.set(side, { xPercent: -110 * Math.max(0, s.t - 1) });
      gsap.set(page, { x: `${-11 * Math.max(0, s.t - 1)}em` });
      const twisting = s.t > 0;
      real.style.visibility = twisting ? 'hidden' : '';
      gsap.set(bands, { autoAlpha: twisting ? 1 : 0 });
    };
    k.on(btn, 'click', () => {
      open = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close menu' : 'Open menu';
      side.inert = !open;
      gsap.to(s, { t: open ? 0 : 2, duration: reducedMotion ? 0 : 1.1, ease: open ? 'power3.out' : 'power2.in', onUpdate: draw, overwrite: true });
    });
    draw();

    return () => k.destroy();
  },
};
