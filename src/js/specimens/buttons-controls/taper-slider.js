/** Taper Slider: the black wedge ahead of the thumb shrinks as you drag right, leaving a thin line behind. */
import { kit, clamp, slider } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Taper Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Clamped', 'Position-aware', 'Elastic'],
  effect: ['Tapering', 'Contracting', 'Wobbling'],
  purpose: ['Feedback', 'Progress'],
  properties: ['Shape', 'Size', 'Position'],
  description: 'A volume-style wedge. Behind the round thumb is a thin line; ahead of it is a black wedge that gets shorter and thinner the further right you drag, until it is gone at the end. On release the wedge wobbles like jelly.',
  params: [
    { key: 'shrink', label: 'Shrink', group: 'Shape', type: 'range', min: 0, max: 1, step: 0.05, default: 0.8, live: true },
    { key: 'height', label: 'Wedge height', group: 'Shape', type: 'range', min: 4, max: 10, step: 0.5, default: 9, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 8 },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-taper">
        <div class="sp-taper__rail">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
            <path class="sp-taper__line"/><polygon class="sp-taper__wedge"/>
          </svg>
          <div class="sp-taper__thumb" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <p class="sp-note">Drag right · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-taper__rail');
    const line = k.$('.sp-taper__line');
    const wedge = k.$('.sp-taper__wedge');
    const thumb = k.$('.sp-taper__thumb');
    const s = k.track({ v: Number(p.value), jig: 0 });

    const draw = () => {
      const f = 1 - (s.v / 100) * Number(p.shrink); // the wedge's end shrinks as v grows
      const hR = Number(p.height) * f * (1 + s.jig);
      const h0 = Math.min(1.2, hR);
      wedge.setAttribute('points', `${s.v},${10 - h0} 100,${10 - hR} 100,${10 + hR} ${s.v},${10 + h0}`);
      line.setAttribute('d', `M0 10 H${s.v}`);
      thumb.style.left = `${s.v}%`;
      thumb.setAttribute('aria-valuenow', Math.round(s.v));
    };
    draw();

    slider(k, rail, thumb, {
      start: () => gsap.to(thumb, { scale: 1.15, duration: 0.2 }),
      move: (v) => ((s.v = v), draw()),
      end: () => {
        gsap.to(thumb, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
        if (!reducedMotion) gsap.fromTo(s, { jig: 0.25 }, { jig: 0, duration: 0.9, ease: 'elastic.out(1.2, 0.3)', onUpdate: draw });
      },
      key: (d) => gsap.to(s, { v: clamp(s.v + d * 5, 0, 100), duration: reducedMotion ? 0 : 0.25, overwrite: 'auto', onUpdate: draw }),
    });

    return () => k.destroy();
  },
};
