/** Rope Slider: the track sags like a rope under the thumb while you drag, then springs taut. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Rope Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Constrained', 'Clamped', 'Velocity-aware', 'Elastic'],
  effect: ['Rope-motion', 'Wave-deformation', 'Damped-oscillation', 'Rotating'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Path', 'Position', 'Rotation'],
  description: 'A slider strung like a rope. It sags under the thumb while you hold it, the value tag tilts with your speed, and on release the rope snaps taut and wobbles.',
  params: [
    { key: 'sag', label: 'Sag', group: 'Shape', type: 'range', min: 0, max: 14, step: 1, default: 8, live: true },
    { key: 'tilt', label: 'Tag tilt', group: 'Motion', type: 'range', min: 0, max: 40, step: 1, unit: '°', default: 20, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 40 },
    tone('#111111', 'tone', '--sp-accent', 'Rope'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-rope">
        <div class="sp-rope__rail">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path/></svg>
          <div class="sp-rope__thumb" role="slider" tabindex="0" aria-label="Amount" aria-valuemin="0" aria-valuemax="100"><b></b></div>
        </div>
        <p class="sp-note">Drag the knot · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-rope__rail');
    const path = k.$('path');
    const thumb = k.$('[role="slider"]');
    const tag = k.$('b');
    const s = k.track({ v: Number(p.value), sag: 0 });

    const draw = () => {
      const x = s.v;
      const y = 15 + s.sag;
      path.setAttribute('d', `M0 15 Q${x / 2} ${y} ${x} ${y} Q${(x + 100) / 2} ${y} 100 15`);
      gsap.set(thumb, { left: `${x}%`, top: `${(y / 30) * 100}%` });
      tag.textContent = Math.round(x);
      thumb.setAttribute('aria-valuenow', Math.round(x));
    };
    draw();

    let last = 0;
    let dragging = false;
    const move = (e) => {
      const r = rail.getBoundingClientRect();
      const v = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
      gsap.to(tag, { rotation: clamp((v - last) * 4, -1, 1) * p.tilt, duration: 0.3, overwrite: true });
      gsap.to(tag, { rotation: 0, duration: 0.6, delay: 0.15, ease: 'elastic.out(1, 0.4)' });
      last = s.v = v;
      draw();
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      gsap.to(s, { sag: 0, duration: reducedMotion ? 0 : 0.9, ease: 'elastic.out(1, 0.3)', onUpdate: draw });
    };
    k.on(rail, 'pointermove', (e) => dragging && move(e));
    k.on(rail, 'pointerdown', (e) => {
      rail.setPointerCapture(e.pointerId);
      dragging = true;
      last = s.v;
      gsap.to(s, { sag: Number(p.sag), duration: reducedMotion ? 0 : 0.25, onUpdate: draw });
      move(e);
    });
    k.on(rail, 'pointerup', release);
    k.on(rail, 'pointercancel', release);
    k.on(thumb, 'keydown', (e) => {
      const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
      if (!step) return;
      e.preventDefault();
      s.v = clamp(s.v + step, 0, 100);
      draw();
    });

    return () => k.destroy();
  },
};
