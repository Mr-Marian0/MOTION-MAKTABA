/**Ink Spill Menu: the menu spreads out of the button as a circle. */
import { kit, bars, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Ink Spill Menu',
  element: 'Hamburger menu',
  trigger: ['Click'],
  behavior: [],
  effect: ['Expansion', 'Rising'],
  purpose: ['Navigation', 'Continuity'],
  properties: ['Clip & mask', 'Position'],
  description: 'The menu spreads out from the button like ink soaking into paper, and the links rise up through it. It has no behavior tag: this one is a pure motion effect.',
  params: [
    { key: 'corner', label: 'Button corner', group: 'Layout', type: 'choice', options: ['Top right', 'Bottom right', 'Bottom left', 'Top left'], default: 'Top right' },
    tone('#111111', 'fill', '--sp-fill', 'Ink color'),
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.05, unit: 's', default: 0.8, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Expo', live: true },
  ],
};

const CORNER = { 'Top right': 'tr', 'Bottom right': 'br', 'Bottom left': 'bl', 'Top left': 'tl' };

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-circ sp-circ--${CORNER[p.corner] || 'tr'}">
        <div class="sp-circ__page">
          <p class="sp-note sp-note--inline">Press the round button</p>
          ${bars(6)}
        </div>
        <nav class="sp-circ__menu" aria-label="Specimen menu">
          <ul>${['Index', 'Work', 'Lab', 'Contact'].map((l) => `<li><a href="#"><span>${l}</span></a></li>`).join('')}</ul>
        </nav>
        <button class="sp-circ__btn" type="button" aria-expanded="false" aria-label="Open menu"><i></i><i></i></button>
      </div>`);

    const root = k.$('.sp-circ');
    const btn = k.$('.sp-circ__btn');
    const menu = k.$('.sp-circ__menu');
    const words = k.$$('.sp-circ__menu span');
    let open = false;
    let tl;

    const origin = () => {
      const r = root.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const x = b.left + b.width / 2 - r.left;
      const y = b.top + b.height / 2 - r.top;
      const R = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      return { x, y, R };
    };
    const closedClip = () => {
      const { x, y } = origin();
      return `circle(0px at ${x}px ${y}px)`;
    };
    k.resize(root, () => !open && gsap.set(menu, { clipPath: closedClip(), autoAlpha: 1 }));

    k.on(btn, 'click', () => {
      open = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('is-open', open);
      const { x, y, R } = origin();
      const d = Number(p.speed);
      tl?.kill();
      tl = gsap.timeline();
      if (open) {
        tl.fromTo(menu, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: d, ease: EASES[p.ease] || 'expo.out' })
          .fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, d * 0.35);
      } else {
        tl.to(words, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.03 })
          .to(menu, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: d * 0.6, ease: 'power3.inOut' }, 0.1);
      }
    });
    words.forEach((w) => k.on(w.parentElement, 'click', (e) => e.preventDefault()));

    return () => k.destroy();
  },
};
