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
    { key: 'layout', label: 'Direction', group: 'Layout', type: 'choice', options: ['Horizontal', 'Vertical'], default: 'Horizontal' },
    { key: 'stretch', label: 'Stretch', group: 'Motion', type: 'range', min: 1, max: 2, step: 0.05, unit: '×', default: 1.5, live: true },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#111111'),
  ],
  variants: { Vertical: { layout: 'Vertical' } },
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const v = p.layout === 'Vertical';
    k.html(`
      <div class="sp sp-toggle${v ? ' sp-toggle--v' : ''}">
        <button type="button" role="switch" aria-checked="false" class="sp-toggle__btn">
          <span class="sp-toggle__track"><i class="sp-toggle__knob"></i></span>
          <span>${esc(p.label)}</span>
        </button>
        <p class="sp-note">Click or press space</p>
      </div>`);
    const btn = k.$('button');
    const knob = k.$('.sp-toggle__knob');
    const track = k.$('.sp-toggle__track');
    // Vertical: the knob rises to switch on; the stretch runs along Y.
    const [along, across] = v ? ['scaleY', 'scaleX'] : ['scaleX', 'scaleY'];

    k.on(btn, 'click', () => {
      const on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(on));
      const travel = (v ? track.clientHeight - knob.offsetHeight : track.clientWidth - knob.offsetWidth) - knob.offsetLeft * 2;
      const t = reducedMotion ? 0 : Number(p.speed);
      gsap.to(knob, { [v ? 'y' : 'x']: on ? travel * (v ? -1 : 1) : 0, duration: t, ease: 'power3.inOut' });
      gsap.to(knob, {
        keyframes: { [along]: [1, Number(p.stretch), 0.8, 1], [across]: [1, 0.8, 1.15, 1] },
        transformOrigin: v ? (on ? 'center top' : 'center bottom') : on ? 'right center' : 'left center',
        duration: t * 1.4, ease: 'none',
      });
    });

    return () => k.destroy();
  },
};
