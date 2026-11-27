/** Tangram Widget: a daily-puzzle widget whose square face is made of the seven tangram shapes; "Take apart" pulls the square into its shapes. */
import { kit } from '../_kit.js';
import { TONES } from '../_params.js';
import { centroid } from './_pieces.js';
import { poly } from './_shape.js';

export const meta = {
  title: 'Tangram Widget',
  element: 'Widget',
  trigger: ['Click', 'Hover', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Reversible', 'Spring-driven'],
  effect: ['Shape-disassembly', 'Spinning', 'Shape-assembly', 'Springing'],
  purpose: ['Delight', 'Storytelling'],
  properties: ['Shape', 'Position', 'Rotation', 'Clip & mask'],
  description: 'A daily-puzzle widget whose face is a square made of the seven tangram shapes. "Take apart" splits the square: each shape slides out from the middle and turns on its own centre. Hover a loose shape to nudge it; "Put together" springs them home.',
  params: [
    { key: 'spread', label: 'Spread', group: 'Layout', type: 'range', min: 1, max: 5, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'spin', label: 'Spin', group: 'Motion', type: 'range', min: 0, max: 180, step: 15, unit: '°', default: 90, live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0, max: 0.2, step: 0.02, unit: 's', default: 0.06, live: true },
  ],
};

// The classic seven pieces of a 4 × 4 square.
const TANS = [
  [[0, 0], [4, 0], [2, 2]],
  [[0, 0], [2, 2], [0, 4]],
  [[4, 2], [4, 4], [2, 4]],
  [[2, 2], [3, 1], [4, 2], [3, 3]],
  [[3, 1], [4, 0], [4, 2]],
  [[1, 3], [2, 2], [3, 3]],
  [[0, 4], [1, 3], [3, 3], [2, 4]],
].map((t) => t.map(([x, y]) => [x * 25, y * 25]));

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-tan">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-tan__card">
            <div class="sp-cc__row"><span class="sp-cc__kick">Daily puzzle</span><span class="sp-cc__kick">No. 42</span></div>
            <div class="sp-tan__board">${TANS.map((t, i) => {
              const [cx, cy] = centroid(t);
              return `<i class="sp-tan__piece" style="clip-path:${poly(t)};transform-origin:${cx}% ${cy}%;background:${TONES[i % TONES.length].value}"></i>`;
            }).join('')}</div>
            <button type="button" class="sp-cc__btn sp-tan__btn" aria-pressed="false">Take apart</button>
          </article>
        </div>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const parts = k.$$('.sp-tan__piece');
    const btn = k.$('.sp-tan__btn');
    k.fit(wrap, 0.86);
    const d = (t) => (reducedMotion ? 0 : t);
    let apart = false;
    const dirs = TANS.map((t) => {
      const [cx, cy] = centroid(t);
      const len = Math.hypot(cx - 50, cy - 50) || 1;
      return [(cx - 50) / len, (cy - 50) / len];
    });

    k.on(btn, 'click', () => {
      apart = !apart;
      btn.setAttribute('aria-pressed', String(apart));
      btn.textContent = apart ? 'Put together' : 'Take apart';
      parts.forEach((el, i) => gsap.to(el, {
        x: apart ? `${dirs[i][0] * p.spread}em` : 0,
        y: apart ? `${dirs[i][1] * p.spread}em` : 0,
        rotation: apart ? (i % 2 ? 1 : -1) * p.spin : 0,
        duration: d(apart ? 0.7 : 0.9),
        delay: d(i * p.stagger),
        ease: apart ? 'back.out(1.6)' : 'elastic.out(1, 0.55)',
      }));
    });
    // Loose pieces wiggle when you point at them.
    parts.forEach((el) => k.on(el, 'pointerenter', () => apart && !reducedMotion && gsap.fromTo(el, { scale: 1 }, { keyframes: { scale: [1.08, 0.97, 1] }, duration: 0.4 })));

    return () => k.destroy();
  },
};
