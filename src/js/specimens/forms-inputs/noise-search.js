/** Noise Search: a hand-drawn search bar whose ink outline is alive: while focused it drifts and wavers on smooth Perlin-style noise, like a line drawn on a moving page; at rest it holds still. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Noise Search',
  element: 'Search bar',
  trigger: ['Focus', 'Keyboard'],
  behavior: ['Focus-dependent', 'Procedural', 'Continuous'],
  effect: ['Perlin-noise-motion', 'Wobbling', 'Organic-morphing'],
  purpose: ['Focus', 'Delight', 'Branding'],
  properties: ['Path', 'Shape'],
  description: 'A sketchbook-style search bar with an outline that looks hand-inked. Click into it and the outline comes alive: every point along it wanders on smooth, continuous noise, so the frame breathes and drifts organically instead of jittering. Typing stirs the noise faster for a moment. Leave the field and the line slows and freezes in whatever shape it reached.',
  params: [
    { key: 'amp', label: 'Wander', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '', default: 1.75, live: true },
    { key: 'speed', label: 'Drift speed', group: 'Motion', type: 'range', min: 0.1, max: 1.5, step: 0.05, unit: '', default: 0.45, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Ink'),
  ],
};

/** Smooth 1D value noise with a seeded random table: n(x) is continuous and varies on the scale of 1. */
const noise = (() => {
  const T = Array.from({ length: 256 }, () => Math.random() * 2 - 1);
  return (x) => {
    const i = Math.floor(x), f = x - i;
    const u = f * f * (3 - 2 * f);
    return T[i & 255] * (1 - u) + T[(i + 1) & 255] * u;
  };
})();

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('nos');
    k.html(`
      <div class="sp sp-fi sp-nos">
        <div class="sp-fi__wrap">
          <div class="sp-nos__bar" role="search">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
            <i class="sp-fi__icon" aria-hidden="true">✎</i>
            <input class="sp-fi__input" id="${id}" type="search" placeholder="Search sketches" aria-label="Search sketches" />
          </div>
          <p class="sp-note">Click in to bring the line to life</p>
        </div>
      </div>`);
    const path = k.$('.sp-nos__bar path');
    const input = k.$('input');
    // Perimeter points of the box; each gets its own noise track (offset by its index)
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push([i * 10, 3]);
    for (let i = 1; i <= 3; i++) pts.push([197, 3 + i * 8.5]);
    for (let i = 20; i >= 0; i--) pts.push([i * 10, 37]);
    for (let i = 3; i >= 1; i--) pts.push([3, 3 + i * 8.5]);
    let t = 0, boost = 0, live = false;
    const draw = () => {
      const a = p.amp;
      path.setAttribute('d', `M${pts.map(([x, y], i) => `${(x + noise(t + i * 0.37) * a * 1.6).toFixed(2)} ${(y + noise(t * 1.3 + i * 0.41 + 50) * a).toFixed(2)}`).join(' L')} Z`);
    };
    draw();
    const tick = (time, ms) => {
      boost *= 0.94;
      t += (ms / 1000) * p.speed * (1 + boost * 4);
      draw();
    };
    const run = (on) => {
      if (reducedMotion || on === live) return;
      live = on;
      on ? gsap.ticker.add(tick) : gsap.ticker.remove(tick);
    };
    k.on(input, 'focus', () => run(true));
    k.on(input, 'blur', () => run(false));
    k.on(input, 'input', () => (boost = 1));
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
