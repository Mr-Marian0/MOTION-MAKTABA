/** Roll Search: the scope button switches what you search, and the whole bar does a barrel roll round its long axis to get there, coming back up with the new scope's colour and placeholder. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const SCOPES = [['Docs', 'Search documents', '#2f4a6b'], ['People', 'Search people', '#3e7d5a'], ['Files', 'Search files', '#b3412e']];

export const meta = {
  title: 'Roll Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Cyclic', 'Sequential'],
  effect: ['Barrel-roll', 'Axial-rotation', 'Overshoot-motion'],
  purpose: ['Navigation', 'Orientation', 'Feedback'],
  properties: ['Rotation', 'Color'],
  description: 'A search bar with a scope switch. Press the scope chip (or Alt + →) and the whole bar barrel-rolls a full turn about its long axis; halfway round, edge-on to you, it swaps to the next scope, so it rolls back into view with a new colour, a new label and a new placeholder, overshooting the level slightly before it settles. What you typed stays.',
  params: [
    { key: 'time', label: 'Roll time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'rolls', label: 'Rolls', group: 'Motion', type: 'range', min: 1, max: 3, step: 1, unit: '', default: 1, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'First scope'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('rol');
    k.html(`
      <div class="sp sp-fi sp-rol">
        <div class="sp-fi__wrap">
          <div class="sp-rol__bar" role="search">
            <button type="button" class="sp-rol__scope" aria-label="Change scope (Alt + right arrow)"></button>
            <input class="sp-fi__input" id="${id}" type="search" aria-label="Search" />
          </div>
          <p class="sp-note">Press the scope chip to switch</p>
        </div>
      </div>`);
    const bar = k.$('.sp-rol__bar');
    const scope = k.$('.sp-rol__scope');
    const input = k.$('.sp-fi__input');
    let at = 0, tl;
    const show = (i) => {
      const [name, ph, c] = SCOPES[i];
      scope.textContent = `${name} ▸`;
      input.placeholder = ph;
      input.setAttribute('aria-label', ph);
      bar.style.setProperty('--c', i ? c : 'var(--sp-accent)');
    };
    show(0);
    gsap.set(bar, { transformPerspective: 700 });
    const roll = () => {
      at = (at + 1) % SCOPES.length;
      tl?.kill();
      if (reducedMotion) return show(at);
      const n = Math.round(p.rolls);
      // n full turns about the X (long) axis; the swap happens while the bar is edge-on, half way through the last turn
      tl = gsap.timeline()
        .fromTo(bar, { rotationX: 0 }, { rotationX: 360 * n + 12, duration: p.time * n, ease: 'power2.inOut' })
        .call(() => show(at), null, p.time * (n - 0.5))
        .to(bar, { rotationX: 360 * n, duration: 0.35, ease: 'back.out(3)' });
    };
    k.on(scope, 'click', roll);
    k.on(input, 'keydown', (e) => e.altKey && e.key === 'ArrowRight' && (e.preventDefault(), roll()));
    return () => k.destroy();
  },
};
