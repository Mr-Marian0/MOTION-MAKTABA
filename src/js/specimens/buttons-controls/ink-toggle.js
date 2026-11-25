/** Ink Toggle: the knob stretches like a drop while it travels and squashes when it lands. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink Toggle',
  element: 'Toggle',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Reversible'],
  effect: ['Sliding', 'Stretching', 'Squashing', 'Overshoot-motion'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Position', 'Scale', 'Color'],
  description: 'A switch whose knob stretches into a drop as it slides across, then squashes and settles. The track fills with ink when it is on.',
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Night mode' },
    { key: 'stretch', label: 'Stretch', group: 'Motion', type: 'range', min: 1, max: 2, step: 0.05, unit: '×', default: 1.5, live: true },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-toggle">
        <button type="button" role="switch" aria-checked="false" class="sp-toggle__btn">
          <span class="sp-toggle__track"><i class="sp-toggle__knob"></i></span>
          <span>${esc(p.label)}</span>
        </button>
        <p class="sp-note">Click or press space</p>
      </div>`);
    const btn = k.$('button');
    const knob = k.$('.sp-toggle__knob');
    const track = k.$('.sp-toggle__track');

    k.on(btn, 'click', () => {
      const on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(on));
      const x = on ? track.clientWidth - knob.offsetWidth - knob.offsetLeft * 2 : 0;
      const t = reducedMotion ? 0 : Number(p.speed);
      gsap.to(knob, { x, duration: t, ease: 'power3.inOut' });
      gsap.to(knob, {
        keyframes: { scaleX: [1, Number(p.stretch), 0.8, 1], scaleY: [1, 0.8, 1.15, 1] },
        transformOrigin: on ? 'right center' : 'left center',
        duration: t * 1.4, ease: 'none',
      });
    });

    return () => k.destroy();
  },
};
