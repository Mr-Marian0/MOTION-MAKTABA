/** Grip Slider: a thick bar with a small square handle that swells while you hold it, revealing the value inside. */
import { kit, clamp, slider } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Grip Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Clamped', 'Activation-dependent', 'Elastic'],
  effect: ['Expansion', 'Contracting', 'Overshoot-motion'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Size', 'Scale', 'Opacity'],
  description: 'A thick bar with a small square handle. Press and hold and the handle swells a little, showing the value inside; let go and it springs back to its small size.',
  params: [
    { key: 'grow', label: 'Expand', group: 'Motion', type: 'range', min: 1.1, max: 2.6, step: 0.1, unit: '×', default: 1.8, live: true },
    { key: 'show', label: 'Show value while held', group: 'Content', type: 'toggle', default: true, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 6 },
    tone('#111111', 'tone', '--sp-accent', 'Bar'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-grip">
        <div class="sp-grip__rail">
          <i class="sp-grip__bar"></i>
          <div class="sp-grip__thumb" role="slider" tabindex="0" aria-label="Amount" aria-valuemin="0" aria-valuemax="100"><b class="sp-grip__val"></b></div>
        </div>
        <p class="sp-note">Press and hold the bar · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-grip__rail');
    const thumb = k.$('.sp-grip__thumb');
    const val = k.$('.sp-grip__val');
    let v = Number(p.value);
    let shrink;
    const d = (t) => (reducedMotion ? 0 : t);

    const set = (x) => {
      v = x;
      thumb.style.left = `${v}%`;
      val.textContent = Math.round(v);
      thumb.setAttribute('aria-valuenow', Math.round(v));
    };
    const hold = (on) => {
      const g = Number(p.grow);
      gsap.to(thumb, on
        ? { width: `${1.1 * g}em`, height: `${2.1 + (g - 1) * 0.4}em`, duration: d(0.35), ease: 'back.out(2.5)', overwrite: 'auto' }
        : { width: '1.1em', height: '2.1em', duration: d(0.7), ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      gsap.to(val, { opacity: on && p.show ? 1 : 0, duration: d(0.2) });
    };
    set(v);

    slider(k, rail, thumb, {
      start: () => hold(true),
      move: set,
      end: () => hold(false),
      key: (dir) => {
        set(clamp(v + dir * 5, 0, 100));
        hold(true);
        shrink?.kill();
        shrink = gsap.delayedCall(0.7, () => hold(false));
      },
    });

    return () => (shrink?.kill(), k.destroy());
  },
};
