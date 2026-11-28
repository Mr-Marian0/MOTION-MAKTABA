/** Split Icon: a set of dark icons with a broadcast-glitch hover: point at one and its red, green and blue layers split apart and jitter, then snap back together into a clean white icon. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const ICONS = [
  ['Home', '<path d="M3 11 L12 4 L21 11 V20 H14 V14 H10 V20 H3 Z"/>'],
  ['Search', '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 L20 20"/>'],
  ['Inbox', '<path d="M3 13 L6 5 H18 L21 13 V19 H3 Z"/><path d="M3 13 H8 L9.5 15.5 H14.5 L16 13 H21"/>'],
  ['Profile', '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20 C5.5 15 8.5 13.5 12 13.5 C15.5 13.5 18.5 15 19 20"/>'],
];

export const meta = {
  title: 'Split Icon',
  element: 'Icon',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Randomized', 'Reversible'],
  effect: ['RGB-splitting', 'Jittering', 'Merging'],
  purpose: ['Delight', 'Affordance', 'Branding'],
  properties: ['Position', 'Color'],
  description: 'A navigation bar of icons on a dark screen. Point at an icon (or tab to it) and it glitches: its red, green and blue channels pull apart into three coloured outlines that jitter in hard steps, then lock back together into one clean white icon. The icon you choose stays slightly split, like a stuck channel, to show where you are.',
  params: [
    { key: 'split', label: 'Split', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'px', default: 3, live: true },
    { key: 'time', label: 'Glitch time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    tone('#ff3d8b', 'tone', '--sp-accent', 'Label'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-spi">
        <nav class="sp-spi__bar" aria-label="Main">
          ${ICONS.map(([name, d], i) => `<button type="button" class="sp-spi__btn" aria-label="${name}" aria-current="${!i}"><svg viewBox="0 0 24 24" aria-hidden="true"><g class="sp-spi__r">${d}</g><g class="sp-spi__g">${d}</g><g class="sp-spi__b">${d}</g></svg><small>${name}</small></button>`).join('')}
        </nav>
      </div>`);
    const btns = k.$$('.sp-spi__btn');
    const layers = (b) => ['.sp-spi__r', '.sp-spi__g', '.sp-spi__b'].map((s) => b.querySelector(s));
    const rest = (b) => (b.getAttribute('aria-current') === 'true' ? 0.35 : 0);
    const settle = (b) => { const [r, , bl] = layers(b); gsap.to(r, { x: -p.split * rest(b), y: 0, duration: 0.15, overwrite: true }); gsap.to(bl, { x: p.split * rest(b), y: 0, duration: 0.15, overwrite: true }); };
    const glitch = (b) => {
      if (reducedMotion) return;
      const [r, g, bl] = layers(b);
      const n = Math.max(3, Math.round(p.time / 0.05));
      const jit = (sign) => Array.from({ length: n }, (_, i) => ({ x: sign * p.split * (1 - i / n) * (0.6 + Math.random()), y: (Math.random() - 0.5) * p.split, duration: 0.05, ease: 'steps(1)' }));
      gsap.to(r, { keyframes: jit(-1), overwrite: true, onComplete: () => settle(b) });
      gsap.to(bl, { keyframes: jit(1), overwrite: true });
      gsap.fromTo(g, { y: 0 }, { keyframes: { y: [-p.split * 0.4, p.split * 0.3, 0] }, duration: p.time, ease: 'steps(3)', overwrite: true });
    };
    btns.forEach((b) => {
      ['pointerenter', 'focus'].forEach((ev) => k.on(b, ev, () => glitch(b)));
      k.on(b, 'click', () => { btns.forEach((x) => x.setAttribute('aria-current', String(x === b))); btns.forEach(settle); glitch(b); });
    });
    btns.forEach(settle);
    return () => k.destroy();
  },
};
