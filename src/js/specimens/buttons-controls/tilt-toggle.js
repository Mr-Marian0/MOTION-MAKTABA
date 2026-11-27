/** Tilt Toggle: after a short pause the track tips like a see-saw and the knob rolls down to the low end. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Tilt Toggle',
  element: 'Toggle',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Sequential', 'Reversible'],
  effect: ['Rotating', 'Sliding', 'Falling', 'Rebounding', 'Squashing'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Rotation', 'Position', 'Scale', 'Color'],
  description: 'A switch that tips like a see-saw. After a short hesitation the track tilts toward the new side, the knob falls into that corner with a little bounce, and the track levels out again.',
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Gravity' },
    { key: 'angle', label: 'Tilt angle', group: 'Motion', type: 'range', min: 10, max: 45, step: 1, unit: '°', default: 30, live: true },
    { key: 'delay', label: 'Delay before tilt', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.05, unit: 's', default: 0.3, live: true },
    { key: 'speed', label: 'Fall time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-toggle sp-tilt">
        <button type="button" role="switch" aria-checked="false" class="sp-toggle__btn">
          <span class="sp-toggle__track"><i class="sp-toggle__knob"></i></span>
          <span>${esc(p.label)}</span>
        </button>
        <p class="sp-note">Click or press space</p>
      </div>`);
    const btn = k.$('.sp-toggle__btn');
    const knob = k.$('.sp-toggle__knob');
    const track = k.$('.sp-toggle__track');
    let busy = false;

    k.on(btn, 'click', () => {
      if (busy) return;
      const on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(on));
      const x = on ? track.clientWidth - knob.offsetWidth - knob.offsetLeft * 2 : 0;
      if (reducedMotion) return gsap.set(knob, { x });
      busy = true;
      const dir = on ? 1 : -1;
      const t = Number(p.speed);
      gsap.timeline({ onComplete: () => (busy = false) })
        // Hesitate: a small lean the wrong way during the delay.
        .to(track, { rotation: -dir * 3, duration: Number(p.delay), ease: 'sine.inOut' })
        .to(track, { rotation: dir * Number(p.angle), duration: t * 0.8, ease: 'power2.inOut' })
        .to(knob, { x, duration: t, ease: 'power2.in' }, `-=${t * 0.25}`)
        .to(knob, { scaleX: 0.72, scaleY: 1.22, duration: t * 0.15, transformOrigin: on ? 'right center' : 'left center', ease: 'power1.out' })
        .to(knob, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
        .to(knob, { x: x - dir * 4, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' }, '<')
        .to(track, { rotation: 0, duration: t * 1.1, ease: 'back.out(2.2)' }, '<0.1');
    });

    return () => k.destroy();
  },
};
