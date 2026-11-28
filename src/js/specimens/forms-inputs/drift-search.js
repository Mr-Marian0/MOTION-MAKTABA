/** Drift Search: recent searches drift under the bar like leaves on slow water, each wandering around its spot; as you type, the matches drift up towards the bar and the rest float off downstream. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

const RECENT = ['moss green paint', 'linen apron', 'oak frame', 'clay mugs', 'wool throw', 'brass hooks'];

export const meta = {
  title: 'Drift Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Click', 'Idle'],
  behavior: ['Randomized', 'Reactive', 'Continuous'],
  effect: ['Drifting', 'Floating', 'Perlin-noise-motion'],
  purpose: ['Delight', 'Navigation', 'Hierarchy'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A shop search with your recent searches floating underneath. Left alone, each one drifts slowly around its own spot, turning a little, like leaves on still water. Start typing and the ones that match drift up close under the bar while the others are carried off to the right and fade. Click one to search it again. Hovering a chip holds it still so it is easy to hit.',
  params: [
    { key: 'drift', label: 'Drift', group: 'Motion', type: 'range', min: 0, max: 1.5, step: 0.1, unit: 'em', default: 0.6, live: true },
    { key: 'pace', label: 'Drift time', group: 'Motion', type: 'range', min: 2, max: 8, step: 0.5, unit: 's', default: 4, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Leaf'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('dft');
    k.html(`
      <div class="sp sp-fi sp-dft">
        <div class="sp-fi__wrap">
          <div class="sp-fi__box" role="search"><i class="sp-fi__icon" aria-hidden="true">⌕</i><input class="sp-fi__input" id="${id}" type="search" placeholder="Search the shop" aria-label="Search the shop" /></div>
          <div class="sp-dft__pond" aria-label="Recent searches">${RECENT.map((r) => `<button type="button" class="sp-dft__leaf">${esc(r)}</button>`).join('')}</div>
        </div>
      </div>`);
    const input = k.$('.sp-fi__input');
    const leaves = k.$$('.sp-dft__leaf');
    const held = new Set();
    // Each leaf wanders: a new random nearby target every few seconds (smooth, never repeating)
    const wander = (leaf) => {
      if (reducedMotion || !p.drift || held.has(leaf) || leaf.classList.contains('is-gone')) return;
      const r = () => `${(Math.random() - 0.5) * 2 * p.drift}em`;
      gsap.to(leaf, { x: r(), y: r(), rotation: (Math.random() - 0.5) * 10, duration: p.pace * (0.7 + Math.random() * 0.6), ease: 'sine.inOut', onComplete: () => wander(leaf) });
    };
    leaves.forEach((l, i) => gsap.delayedCall(i * 0.3, () => wander(l)));
    k.on(input, 'input', () => {
      const q = input.value.trim().toLowerCase();
      leaves.forEach((l) => {
        const hit = !q || l.textContent.includes(q);
        const was = !l.classList.contains('is-gone');
        l.classList.toggle('is-gone', !hit);
        l.classList.toggle('is-hit', Boolean(q) && hit);
        l.tabIndex = hit ? 0 : -1;
        if (hit === was && !(hit && q)) return;
        gsap.killTweensOf(l);
        const d = reducedMotion ? 0 : 1;
        if (!hit) gsap.to(l, { x: '+=6em', y: '+=0.8em', rotation: 25, autoAlpha: 0, duration: 1.6 * d, ease: 'power1.in' });
        else gsap.to(l, { x: 0, y: q ? '-0.4em' : 0, rotation: 0, autoAlpha: 1, duration: 0.9 * d, ease: 'power2.out', onComplete: () => !q && wander(l) });
      });
    });
    leaves.forEach((l) => {
      k.on(l, 'click', () => { input.value = l.textContent; input.dispatchEvent(new Event('input')); input.focus(); });
      // Extra: hovering a leaf holds it still under the pointer
      k.on(l, 'pointerenter', () => { held.add(l); gsap.killTweensOf(l); gsap.to(l, { rotation: 0, duration: 0.3 }); });
      k.on(l, 'pointerleave', () => { held.delete(l); wander(l); });
    });
    return () => k.destroy();
  },
};
