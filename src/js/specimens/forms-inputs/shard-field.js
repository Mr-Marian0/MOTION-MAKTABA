/** Shard Field: clearing the field breaks what you typed: every letter cracks in two along a slanted line and the halves fall away tumbling, leaving the field empty and ready. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Shard Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Randomized', 'Gravity-driven'],
  effect: ['Fragmentation', 'Splitting', 'Falling'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Opacity'],
  description: 'A search-style text field whose clear button breaks the text instead of wiping it. Press ✕ (or Esc) and each letter splits in two along a slanted crack; the top and bottom halves drift apart and tumble down out of the field, a few at a time from the end of the word, while the field itself is already empty and focused for the next entry.',
  params: [
    { key: 'fall', label: 'Fall', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3.5, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 1.6, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Clear'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('shd');
    k.html(`
      <div class="sp sp-fi sp-shd">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Coupon code</label>
          <div class="sp-fi__box sp-shd__box">
            <input class="sp-fi__input sp-shd__input" id="${id}" autocomplete="off" value="SPRING-SALE-25" />
            <span class="sp-shd__ghost" aria-hidden="true"></span>
            <button type="button" class="sp-shd__x" aria-label="Clear">✕</button>
          </div>
          <p class="sp-note">Press ✕ or Esc · type again</p>
        </div>
      </div>`);
    const input = k.$('.sp-shd__input');
    const ghost = k.$('.sp-shd__ghost');
    const x = k.$('.sp-shd__x');
    const shatter = () => {
      const text = input.value;
      if (!text) return;
      const scrolled = input.scrollLeft; // long text: the ghost has to show the same window onto it
      input.value = '';
      input.focus();
      if (reducedMotion) return;
      // A ghost copy of the text sits exactly over the input; each letter is two clipped halves
      ghost.style.setProperty('--sl', `${-scrolled}px`);
      ghost.innerHTML = [...text].map((c) => {
        const cut = 35 + Math.random() * 30;
        const tilt = (Math.random() - 0.5) * 30;
        const ch = c === ' ' ? '&nbsp;' : esc(c);
        return `<span><i style="clip-path:polygon(0 0,100% 0,100% ${cut + tilt}%,0 ${cut - tilt}%)">${ch}</i><i style="clip-path:polygon(0 ${cut - tilt}%,100% ${cut + tilt}%,100% 100%,0 100%)">${ch}</i></span>`;
      }).join('');
      const halves = [...ghost.querySelectorAll('i')];
      const n = halves.length / 2;
      gsap.timeline({ onComplete: () => (ghost.innerHTML = '') }).to(halves, {
        x: (i) => `${(i % 2 ? 1 : -1) * (0.1 + Math.random() * 0.4)}em`,
        y: (i) => `${(i % 2 ? 1 : 0.6) * p.fall * (0.7 + Math.random() * 0.5)}em`,
        rotation: () => (Math.random() - 0.5) * 140,
        autoAlpha: 0,
        duration: p.time,
        ease: 'power2.in',
        // from the end of the word back to the start; both halves of a letter leave together
        stagger: (i) => ((n - Math.floor(i / 2)) / n) * p.time * 0.35,
      });
    };
    k.on(x, 'click', shatter);
    k.on(input, 'keydown', (e) => e.key === 'Escape' && (e.preventDefault(), shatter()));
    // Extra: the ✕ only shows when there is something to clear, and pops in when you start typing
    const sync = () => {
      const on = Boolean(input.value);
      if (on === !x.hidden) return;
      x.hidden = !on;
      if (on && !reducedMotion) gsap.fromTo(x, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    };
    k.on(input, 'input', sync);
    k.on(x, 'click', sync);
    k.on(input, 'keyup', sync);
    return () => k.destroy();
  },
};
