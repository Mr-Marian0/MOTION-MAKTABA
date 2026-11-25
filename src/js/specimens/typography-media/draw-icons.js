/** Living Icons: line icons draw themselves in, then each one acts out its meaning on hover. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Living Icons',
  element: 'Icon',
  trigger: ['In view', 'Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Staggered', 'Visibility-dependent'],
  effect: ['Path-following', 'Wiggle', 'Pulsating', 'Spinning', 'Sliding'],
  purpose: ['Affordance', 'Delight', 'Feedback'],
  properties: ['Path', 'Rotation', 'Scale', 'Position'],
  description: 'A row of line icons that draw themselves in stroke by stroke. Hover (or tab to) each one and it acts out its meaning: the bell rings, the heart beats, the arrow nudges forward and the gear turns.',
  params: [
    { key: 'draw', label: 'Draw time', group: 'Motion', type: 'range', min: 0.3, max: 2.5, step: 0.1, unit: 's', default: 1.1, live: true },
    { key: 'stroke', label: 'Stroke', group: 'Appearance', type: 'range', min: 1, max: 3, step: 0.25, default: 1.75, css: '--sp-stroke' },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

// [label, paths, hover animation]
const ICONS = [
  ['Notifications', ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'], (g, el) => g.fromTo(el, { rotation: 0 }, { keyframes: { rotation: [18, -16, 10, -6, 0] }, duration: 0.7, transformOrigin: '50% 10%' })],
  ['Favourite', ['M12 20s-7-4.3-8.6-8.6C2.2 8.2 4 5 7.2 5c2 0 3.3 1.1 4.8 2.8C13.5 6.1 14.8 5 16.8 5 20 5 21.8 8.2 20.6 11.4 19 15.7 12 20 12 20z'], (g, el) => g.fromTo(el, { scale: 1 }, { keyframes: { scale: [1.25, 0.95, 1.15, 1] }, duration: 0.6, transformOrigin: '50% 50%' })],
  ['Next', ['M4 12h15', 'M13 6l6 6-6 6'], (g, el) => g.fromTo(el, { x: 0 }, { keyframes: { x: [5, 0, 3, 0] }, duration: 0.6 })],
  ['Settings', ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1'], (g, el) => g.to(el, { rotation: '+=90', duration: 0.6, ease: 'back.out(2)', transformOrigin: '50% 50%' })],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-icons">
        <ul class="sp-icons__row">
          ${ICONS.map(([label, paths]) => `<li class="sp-icons__cell"><button type="button" class="sp-icons__btn" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true"><g>${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg></button><small>${label}</small></li>`).join('')}
        </ul>
        <p class="sp-note">Hover each icon</p>
      </div>`);
    const btns = k.$$('.sp-icons__btn');
    const paths = k.$$('.sp-icons__btn path');
    paths.forEach((el) => gsap.set(el, { strokeDasharray: el.getTotalLength(), strokeDashoffset: reducedMotion ? 0 : el.getTotalLength() }));

    k.inView(k.$('.sp-icons__row'), () =>
      !reducedMotion && gsap.fromTo(paths, { strokeDashoffset: (i, el) => el.getTotalLength() }, { strokeDashoffset: 0, duration: Number(p.draw), ease: 'power2.inOut', stagger: 0.12 }));
    btns.forEach((b, i) => {
      const act = () => !reducedMotion && ICONS[i][2](gsap, b.querySelector('g'));
      k.on(b, 'pointerenter', act);
      k.on(b, 'focus', act);
    });

    return () => k.destroy();
  },
};
