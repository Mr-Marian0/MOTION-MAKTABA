/** Fan FAB: the plus turns into an X and the actions fan out in an arc, one after another. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Fan FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Activation-dependent', 'Staggered', 'Reversible', 'Spring-driven'],
  effect: ['Rotating', 'Divergence', 'Convergence', 'Springing'],
  purpose: ['Hierarchy', 'Affordance'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A floating action button. The plus turns into an X while the actions spring out along an arc, staggered. Closing pulls them back in reverse.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Note, Photo, Clip, Stamp' },
    { key: 'radius', label: 'Reach', group: 'Layout', type: 'range', min: 5, max: 12, step: 0.5, unit: 'em', default: 9, live: true },
    { key: 'arc', label: 'Arc', group: 'Layout', type: 'range', min: 60, max: 180, step: 5, unit: '°', default: 100, live: true },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Note', 'Photo']).slice(0, 6);
    k.html(`
      <div class="sp sp-fab">
        <ul>${acts.map((a) => `<li><button type="button" class="sp-fab__act" tabindex="-1">${esc(a)}</button></li>`).join('')}</ul>
        <button type="button" class="sp-fab__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const main = k.$('.sp-fab__main');
    const items = k.$$('.sp-fab__act'); // (not 'li button': the lab card itself is an <li>)
    gsap.set(items, { scale: 0, autoAlpha: 0 });

    k.on(main, 'click', () => {
      const open = main.getAttribute('aria-expanded') !== 'true';
      main.setAttribute('aria-expanded', String(open));
      items.forEach((b) => (b.tabIndex = open ? 0 : -1));
      const d = reducedMotion ? 0 : 1;
      gsap.to(main.firstChild, { rotation: open ? 135 : 0, duration: 0.5 * d, ease: 'back.out(2)' });
      // Arc from straight up toward the left (the FAB sits bottom-right).
      const n = items.length;
      const r = p.radius * parseFloat(getComputedStyle(main).fontSize); // em → px
      items.forEach((b, i) => {
        const a = ((-90 - (n > 1 ? (i / (n - 1)) * p.arc : 0)) * Math.PI) / 180;
        gsap.to(b, open
          ? { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1, autoAlpha: 1, duration: 0.6 * d, delay: i * 0.06 * d, ease: 'back.out(1.8)' }
          : { x: 0, y: 0, scale: 0, autoAlpha: 0, duration: 0.35 * d, delay: (n - 1 - i) * 0.04 * d, ease: 'power3.in' });
      });
    });

    return () => k.destroy();
  },
};
