/** Wiggle Field: a required field you skipped wiggles at you when you try to submit: a quick side-to-side waggle of the box, its label tipping the other way, with a nudge of a message. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wiggle Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Conditional', 'Event-driven', 'Oscillating'],
  effect: ['Wiggle', 'Wobbling', 'Damped-oscillation'],
  purpose: ['Feedback', 'Focus', 'Affordance'],
  properties: ['Rotation', 'Position', 'Color'],
  description: 'A sign-up form whose empty required field wiggles. Press "Continue" with the name left blank and the field waggles: a few quick tilts left and right that get smaller each time, its label tipping the opposite way like it is shaking its head. The field is focused and a short message appears. Fill it in and Continue goes through.',
  params: [
    { key: 'angle', label: 'Wiggle', group: 'Motion', type: 'range', min: 1, max: 10, step: 0.5, unit: '°', default: 4, live: true },
    { key: 'wiggles', label: 'Wiggles', group: 'Motion', type: 'range', min: 2, max: 8, step: 1, unit: '', default: 5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Needed'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wgf');
    k.html(`
      <div class="sp sp-fi sp-wgf">
        <form class="sp-fi__wrap" novalidate>
          <label class="sp-fi__label sp-wgf__label" for="${id}">Name on the card *</label>
          <div class="sp-fi__box sp-wgf__box"><input class="sp-fi__input" id="${id}" required aria-describedby="${id}-m" autocomplete="off" placeholder="As it appears on the card" /></div>
          <small class="sp-fi__msg" id="${id}-m" aria-live="polite"></small>
          <button class="sp-fi__btn sp-wgf__go">Continue</button>
        </form>
      </div>`);
    const form = k.$('form');
    const box = k.$('.sp-wgf__box');
    const label = k.$('.sp-wgf__label');
    const input = k.$('input');
    const msg = k.$('.sp-fi__msg');
    gsap.set(box, { transformOrigin: '50% 100%' });
    gsap.set(label, { transformOrigin: '0% 100%' });
    k.on(form, 'submit', (e) => {
      e.preventDefault();
      if (input.value.trim()) {
        box.classList.remove('is-bad');
        input.removeAttribute('aria-invalid');
        msg.textContent = 'Thanks, card name saved.';
        return;
      }
      box.classList.add('is-bad');
      input.setAttribute('aria-invalid', 'true');
      msg.textContent = 'We need the name on the card.';
      input.focus();
      if (reducedMotion) return;
      // n wiggles, each smaller: alternating ±angle × (1 − i/n)
      const n = Math.round(p.wiggles);
      const rot = Array.from({ length: n }, (_, i) => (i % 2 ? -1 : 1) * p.angle * (1 - i / n)).concat(0);
      gsap.timeline()
        .to(box, { keyframes: { rotation: rot, x: rot.map((r) => r * 0.8) }, duration: 0.09 * (n + 1), ease: 'none' }, 0)
        .to(label, { keyframes: { rotation: rot.map((r) => -r * 1.5) }, duration: 0.09 * (n + 1), ease: 'none' }, 0.04);
    });
    k.on(input, 'input', () => input.value && box.classList.remove('is-bad'));
    return () => k.destroy();
  },
};
