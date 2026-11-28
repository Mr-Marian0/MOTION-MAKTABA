/** Smoke Search: clear the search and the words go up in smoke: soft puffs rise from each letter, swelling and curling sideways as they climb, and thin out to nothing. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Smoke Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Randomized', 'Temporary'],
  effect: ['Smoke-motion', 'Turbulence-motion', 'Dissolving'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A search bar whose clear button burns the query away. Press ✕ (or Esc) and the text fades while soft grey puffs rise from along its length: each puff swells as it climbs, drifts and curls to one side on a wavering path, and thins into nothing above the bar. The field is empty and ready straight away.',
  params: [
    { key: 'puffs', label: 'Puffs', group: 'Shape', type: 'range', min: 6, max: 30, step: 1, unit: '', default: 16, live: true },
    { key: 'rise', label: 'Rise', group: 'Motion', type: 'range', min: 2, max: 8, step: 0.5, unit: 'em', default: 4.5, live: true },
    tone('#6d6f73', 'tone', '--sp-accent', 'Smoke'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('smk');
    k.html(`
      <div class="sp sp-fi sp-smk">
        <div class="sp-fi__wrap">
          <div class="sp-fi__box sp-smk__bar" role="search">
            <i class="sp-fi__icon" aria-hidden="true">⌕</i>
            <input class="sp-fi__input" id="${id}" type="search" value="smoked paprika" aria-label="Search recipes" />
            <button type="button" class="sp-smk__x" aria-label="Clear search">✕</button>
            <span class="sp-smk__air" aria-hidden="true"></span>
            <span class="sp-smk__measure" aria-hidden="true"></span>
          </div>
        </div>
      </div>`);
    const input = k.$('input');
    const air = k.$('.sp-smk__air');
    const measure = k.$('.sp-smk__measure');
    const clear = () => {
      const text = input.value;
      if (!text) return input.focus();
      input.value = '';
      input.focus();
      if (reducedMotion) return;
      // The ghost of the text, fading, and puffs spread along its width (measured once)
      measure.textContent = text;
      const w = Math.min(measure.offsetWidth, input.offsetWidth);
      const ghost = document.createElement('b');
      ghost.className = 'sp-smk__ghost';
      ghost.textContent = text;
      air.append(ghost);
      gsap.to(ghost, { opacity: 0, y: '-0.3em', duration: 0.6, ease: 'power1.in', onComplete: () => ghost.remove() });
      for (let i = 0; i < p.puffs; i++) {
        const puff = document.createElement('i');
        air.append(puff);
        const x = Math.random() * w;
        const side = (Math.random() - 0.5) * 2;
        const dur = 1.4 + Math.random() * 0.8;
        // rise steadily; curl sideways on a slow wave; swell and thin out
        gsap.timeline({ delay: Math.random() * 0.35, onComplete: () => puff.remove() })
          .fromTo(puff, { x, y: 0, scale: 0.3, opacity: 0.55 }, { y: `-${p.rise * (0.7 + Math.random() * 0.5)}em`, scale: 2 + Math.random(), opacity: 0, duration: dur, ease: 'power1.out' }, 0)
          .to(puff, { keyframes: { x: [x + side * 6, x - side * 4, x + side * 14] }, duration: dur, ease: 'sine.inOut' }, 0);
      }
    };
    k.on(k.$('.sp-smk__x'), 'click', clear);
    k.on(input, 'keydown', (e) => e.key === 'Escape' && (e.preventDefault(), clear()));
    return () => k.destroy();
  },
};
