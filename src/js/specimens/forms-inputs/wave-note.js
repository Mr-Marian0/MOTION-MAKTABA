/** Wave Note: under the note runs a pen-line that rides a sine wave while you type: the faster you write, the higher and quicker the wave; stop and it settles flat. A dot travels the wave like the nib. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wave Note',
  element: 'Textarea',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['Velocity-aware', 'Reactive', 'Continuous'],
  effect: ['Sinusoidal-motion', 'Wave-path-motion', 'Damped-oscillation'],
  purpose: ['Feedback', 'Delight', 'Progress'],
  properties: ['Path', 'Position'],
  description: 'A journal box with a living underline. As you type, the line beneath the box starts to ripple in a sine wave and a nib-dot rides along it, left to right in a loop. Type faster and the waves grow taller and quicker; pause and they calm down to a flat line again. The character count rides with the dot.',
  params: [
    { key: 'amp', label: 'Wave height', group: 'Motion', type: 'range', min: 2, max: 14, step: 1, unit: 'px', default: 8, live: true },
    { key: 'waves', label: 'Waves', group: 'Shape', type: 'range', min: 1, max: 6, step: 0.5, unit: '', default: 3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wav');
    k.html(`
      <div class="sp sp-fi sp-wav">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Today I noticed…</label>
          <textarea class="sp-fi__area sp-wav__area" id="${id}" placeholder="the light on the stairs"></textarea>
          <div class="sp-wav__line" aria-hidden="true"><svg preserveAspectRatio="none" viewBox="0 -20 200 40"><path /></svg><i class="sp-wav__nib"></i></div>
          <small class="sp-fi__hint" aria-live="polite"><b class="sp-wav__n">0</b> characters</small>
        </div>
      </div>`);
    const area = k.$('.sp-wav__area');
    const path = k.$('.sp-wav__line path');
    const nib = k.$('.sp-wav__nib');
    const n = k.$('.sp-wav__n');
    let W = 1;
    k.resize(k.$('.sp-wav__line'), () => (W = k.$('.sp-wav__line').offsetWidth));
    // energy rises with each keystroke and decays; the ticker only runs while there is any
    const s = { e: 0, ph: 0, at: 0 };
    const y = (x) => Math.sin((x / 200) * p.waves * Math.PI * 2 - s.ph) * p.amp * s.e;
    const draw = () => {
      path.setAttribute('d', `M${Array.from({ length: 41 }, (_, i) => `${i * 5} ${y(i * 5).toFixed(2)}`).join(' L')}`);
      gsap.set(nib, { x: s.at * W, y: y(s.at * 200) });
    };
    let running = false;
    const tick = (t, dt) => {
      s.e *= Math.pow(0.35, dt / 1000);
      s.ph += (dt / 1000) * (3 + 6 * s.e);
      s.at = (s.at + (dt / 1000) * (0.15 + 0.35 * s.e)) % 1;
      draw();
      if (s.e < 0.01) { s.e = 0; draw(); gsap.ticker.remove(tick); running = false; }
    };
    draw();
    k.on(area, 'input', () => {
      n.textContent = area.value.length;
      if (reducedMotion) return;
      s.e = Math.min(1, s.e + 0.22);
      if (!running) running = true, gsap.ticker.add(tick);
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
