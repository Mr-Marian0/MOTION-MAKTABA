/** Ink Field: the label floats up, the underline draws out from where you clicked, errors shake, valid input gets a tick. */
import { kit, esc, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink Field',
  element: 'Text field',
  trigger: ['Focus', 'Click', 'Keyboard'],
  behavior: ['Focus-dependent', 'State-dependent', 'Position-aware', 'Reactive'],
  effect: ['Rising', 'Stretching', 'Shaking', 'Bouncing'],
  purpose: ['Feedback', 'Affordance', 'Focus'],
  properties: ['Position', 'Scale', 'Color'],
  description: 'An email field. The label floats up on focus and the underline draws outward from the point you clicked. Leaving it with a bad address shakes the field red; a good one pops a tick.',
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Email address' },
    { key: 'shake', label: 'Shake', group: 'Motion', type: 'range', min: 0, max: 16, step: 1, unit: 'px', default: 8, live: true },
    { key: 'fromClick', label: 'Draw from click', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('field');
    k.html(`
      <div class="sp sp-field">
        <div class="sp-field__box">
          <input class="sp-field__input" id="${id}" type="email" autocomplete="off" placeholder=" " aria-describedby="${id}-msg" />
          <label class="sp-field__label" for="${id}">${esc(p.label)}</label>
          <i class="sp-field__line"></i>
          <span class="sp-field__tick" aria-hidden="true">✓</span>
        </div>
        <small class="sp-field__msg" id="${id}-msg" aria-live="polite"></small>
        <p class="sp-note">Click in · type · click away</p>
      </div>`);
    const box = k.$('.sp-field__box');
    const input = k.$('.sp-field__input');
    const line = k.$('.sp-field__line');
    const tick = k.$('.sp-field__tick');
    const msg = k.$('.sp-field__msg');
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(line, { scaleX: 0 });
    gsap.set(tick, { scale: 0 });
    let origin = 50;

    k.on(input, 'pointerdown', (e) => {
      const r = input.getBoundingClientRect();
      origin = p.fromClick ? ((e.clientX - r.left) / r.width) * 100 : 50;
    });
    k.on(input, 'focus', () => {
      box.classList.remove('is-bad');
      gsap.fromTo(line, { scaleX: 0, transformOrigin: `${origin}% 50%` }, { scaleX: 1, duration: d(0.5), ease: 'expo.out' });
      origin = 50;
    });
    k.on(input, 'blur', () => {
      gsap.to(line, { scaleX: 0, duration: d(0.4), ease: 'power2.in' });
      const v = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      box.classList.toggle('is-bad', Boolean(v) && !ok);
      msg.textContent = v && !ok ? 'That address is missing something.' : '';
      gsap.to(tick, { scale: ok ? 1 : 0, duration: d(0.5), ease: ok ? 'back.out(3)' : 'power2.in' });
      if (v && !ok && !reducedMotion) gsap.fromTo(box, { x: 0 }, { keyframes: { x: [-p.shake, p.shake, -p.shake / 2, p.shake / 2, 0] }, duration: 0.45 });
    });

    return () => k.destroy();
  },
};
