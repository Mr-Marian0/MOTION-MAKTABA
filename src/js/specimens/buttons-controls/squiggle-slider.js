/** Squiggle Slider: the line behind the thumb is straight, the line ahead is a loose squiggle that pulls taut as you near the end. */
import { kit, clamp, slider } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Squiggle Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Clamped', 'Position-aware', 'Looping'],
  effect: ['Wave-deformation', 'Traveling-wave', 'Stretching', 'Damped-oscillation'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Path', 'Position'],
  description: 'A slider drawn like a loose string. Behind the thumb the line is straight; ahead of it the line squiggles, and the squiggle pulls taut as you drag toward the end until the whole line is straight. Let go and the slack part wobbles.',
  params: [
    { key: 'loop', label: 'Loop the squiggle', group: 'Behavior', type: 'toggle', default: true, live: true },
    { key: 'amp', label: 'Squiggle size', group: 'Shape', type: 'range', min: 1, max: 8, step: 0.5, default: 4.5, live: true },
    { key: 'speed', label: 'Loop speed', group: 'Motion', type: 'range', min: 0.2, max: 3, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 20 },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-squig">
        <div class="sp-squig__rail">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path class="sp-squig__line"/></svg>
          <div class="sp-squig__thumb" role="slider" tabindex="0" aria-label="Amount" aria-valuemin="0" aria-valuemax="100"><b class="sp-squig__tag"></b></div>
        </div>
        <p class="sp-note">Drag to the end · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-squig__rail');
    const line = k.$('.sp-squig__line');
    const thumb = k.$('.sp-squig__thumb');
    const tag = k.$('.sp-squig__tag');
    const s = k.track({ v: Number(p.value), ph: 0, kick: 0 });

    const draw = () => {
      const slack = 1 - (s.v / 100) ** 2; // taut at the end
      const amp = Number(p.amp) * slack * (1 + s.kick);
      const pts = [];
      for (let x = 0; x <= 100; x += 1) {
        // Ramp in from the thumb so the straight and wavy parts join smoothly.
        const ramp = x <= s.v ? 0 : 1 - Math.exp(-(x - s.v) / 3);
        const y = 10 + amp * ramp * (0.7 * Math.sin(x * 0.45 - s.ph) + 0.3 * Math.sin(x * 0.17 + 1 - s.ph * 0.6));
        pts.push(`${x} ${y.toFixed(2)}`);
      }
      line.setAttribute('d', `M${pts.join(' L')}`);
      thumb.style.left = `${s.v}%`;
      tag.textContent = Math.round(s.v);
      thumb.setAttribute('aria-valuenow', Math.round(s.v));
    };
    const tick = (_, dt) => {
      if (!p.loop) return;
      s.ph += dt * 0.004 * Number(p.speed);
      draw();
    };
    draw();
    if (!reducedMotion) gsap.ticker.add(tick);

    const set = (v) => ((s.v = v), draw());
    slider(k, rail, thumb, {
      move: set,
      end: () => !reducedMotion && gsap.fromTo(s, { kick: 0.6 }, { kick: 0, duration: 1.1, ease: 'elastic.out(1, 0.3)', onUpdate: draw }),
      key: (d) => gsap.to(s, { v: clamp(s.v + d * 5, 0, 100), duration: reducedMotion ? 0 : 0.25, overwrite: 'auto', onUpdate: draw }),
    });

    return () => (gsap.ticker.remove(tick), k.destroy());
  },
};
