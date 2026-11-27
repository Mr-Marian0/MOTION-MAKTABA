/** Gear Slider: the thumb is a cog that rolls along the track as you drag, and coasts on its own spin after you let go. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Gear Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard', 'Hover'],
  behavior: ['Draggable', 'Clamped', 'Velocity-aware', 'Momentum-driven'],
  effect: ['Rolling', 'Spinning', 'Gear-motion', 'Inertial-motion'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Rotation', 'Position', 'Opacity'],
  description: 'The thumb is a cog. Dragging rolls it along the track, spinning by exactly the distance it travels, while a value tag rises above it. Let go mid-swipe and the cog keeps spinning in place before it winds down.',
  params: [
    { key: 'ratio', label: 'Spin ratio', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'coast', label: 'Coast', group: 'Motion', type: 'range', min: 0, max: 2, step: 0.1, unit: 's', default: 1.2, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 0 },
    tone('#111111', 'tone', '--sp-accent', 'Gear'),
  ],
};

/** A cog outline with a center hole (even-odd), in a -13…13 box. */
function cog(n = 8, R = 12, r = 9, hole = 3) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = Math.PI / n;
    [[r, -0.6], [R, -0.35], [R, 0.35], [r, 0.6]].forEach(([rad, f]) => pts.push(`${(Math.cos(a + w * f) * rad).toFixed(2)} ${(Math.sin(a + w * f) * rad).toFixed(2)}`));
  }
  return `M${pts.join(' L')}Z M${hole} 0 A${hole} ${hole} 0 1 0 ${-hole} 0 A${hole} ${hole} 0 1 0 ${hole} 0Z`;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-gear">
        <div class="sp-gear__rail">
          <i class="sp-gear__track"></i><i class="sp-gear__fill"></i>
          <div class="sp-gear__thumb" role="slider" tabindex="0" aria-label="Amount" aria-valuemin="0" aria-valuemax="100">
            <b class="sp-gear__tag"></b>
            <svg viewBox="-13 -13 26 26" aria-hidden="true"><path d="${cog()}"/></svg>
          </div>
        </div>
        <p class="sp-note">Drag the cog · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-gear__rail');
    const fill = k.$('.sp-gear__fill');
    const thumb = k.$('.sp-gear__thumb');
    const svg = k.$('.sp-gear__thumb svg');
    const tag = k.$('.sp-gear__tag');
    const s = k.track({ v: Number(p.value), rot: 0 });
    const key = k.track({ v: 0 }); // keyboard steps glide through this so the cog still rolls
    let spin = 0; // deg per ms, smoothed
    let lastT = 0;
    let dragging = false;

    const draw = () => {
      thumb.style.left = `${s.v}%`;
      fill.style.width = `${s.v}%`;
      gsap.set(svg, { rotation: s.rot });
      tag.textContent = Math.round(s.v);
      thumb.setAttribute('aria-valuenow', Math.round(s.v));
    };
    // Roll: the cog turns by the arc length it travels (distance / radius).
    const roll = (v) => {
      const dx = ((v - s.v) / 100) * rail.offsetWidth;
      const deg = (dx / (svg.clientWidth / 2)) * (180 / Math.PI) * Number(p.ratio);
      const now = performance.now();
      spin = spin * 0.6 + (deg / Math.max(8, now - lastT)) * 0.4;
      lastT = now;
      s.v = v;
      s.rot += deg;
      draw();
    };
    draw();

    const move = (e) => {
      const r = rail.getBoundingClientRect();
      roll(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      thumb.classList.remove('is-grab');
      if (reducedMotion || !Number(p.coast)) return;
      const extra = clamp(spin * 450 * Number(p.coast), -900, 900);
      gsap.to(s, { rot: s.rot + extra, duration: Number(p.coast), ease: 'power3.out', onUpdate: draw });
    };
    k.on(rail, 'pointerdown', (e) => {
      rail.setPointerCapture(e.pointerId);
      dragging = true;
      spin = 0;
      lastT = performance.now();
      gsap.killTweensOf(s);
      thumb.classList.add('is-grab');
      move(e);
    });
    k.on(rail, 'pointermove', (e) => dragging && move(e));
    k.on(rail, 'pointerup', release);
    k.on(rail, 'pointercancel', release);
    k.on(thumb, 'keydown', (e) => {
      const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
      if (!step) return;
      e.preventDefault();
      key.v = s.v;
      gsap.to(key, { v: clamp(s.v + step, 0, 100), duration: reducedMotion ? 0 : 0.25, ease: 'power2.out', overwrite: true, onUpdate: () => roll(key.v) });
    });

    return () => k.destroy();
  },
};
