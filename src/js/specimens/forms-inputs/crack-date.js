/** Crack Date: fully-booked days are glass: try to pick one and a crack splinters out from where you pressed, the cell shudders, and the crack heals over a moment later. Free days pick normally. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, monthBar, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Crack Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Conditional', 'Randomized'],
  effect: ['Fracturing', 'Shattering', 'Shaking'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Path', 'Position', 'Opacity'],
  description: 'A booking calendar where sold-out days look like frosted glass. Press one and it fractures: crack lines splinter outward from the middle of the cell, it gives a short shudder and a note explains it is booked. A moment later the cracks fade and the cell is whole again. Free days just get picked.',
  params: [
    { key: 'rays', label: 'Cracks', group: 'Shape', type: 'range', min: 3, max: 8, step: 1, unit: '', default: 5 },
    { key: 'heal', label: 'Heals after', group: 'Behavior', type: 'range', min: 0.5, max: 4, step: 0.5, unit: 's', default: 1.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Pick'),
  ],
};

const BOOKED = [5, 6, 12, 13, 19, 26, 27];

/** Random crack lines from the centre of a 0..100 box: each ray zig-zags out, with a short branch. */
function crack(n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.8;
    let [x, y] = [50, 50];
    const pts = [[x, y]];
    for (let s = 1; s <= 3; s++) {
      const r = s * 18;
      const j = a + (Math.random() - 0.5) * 0.6;
      pts.push([50 + Math.cos(j) * r, 50 + Math.sin(j) * r]);
    }
    const [bx, by] = pts[1];
    const b = a + (Math.random() < 0.5 ? 0.9 : -0.9);
    return `M${pts.map((q) => q.join(' ')).join(' L')} M${bx} ${by} L${bx + Math.cos(b) * 16} ${by + Math.sin(b) * 16}`;
  }).join(' ');
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-crk">
        <div class="sp-fi__cal sp-crk__cal">
          ${monthBar(2026, 10)}
          <div class="sp-crk__grid">${days(2026, 10, { picked: 20 })}</div>
          <small class="sp-fi__msg sp-crk__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const cal = k.$('.sp-crk__cal');
    const grid = k.$('.sp-crk__grid');
    const msg = k.$('.sp-crk__msg');
    k.fit(cal);
    // Booked days stay focusable and clickable (so they can react), but say they are unavailable
    BOOKED.forEach((d) => {
      const b = grid.querySelector(`[data-day="${d}"]`);
      b.classList.add('is-booked');
      b.setAttribute('aria-disabled', 'true');
      b.setAttribute('aria-label', `${d} ${MONTHS[10]}, booked`);
    });
    dayKeys(k, grid, (b, d) => {
      if (!b.classList.contains('is-booked')) {
        pickDay(grid, b);
        msg.textContent = `${d} ${MONTHS[10]} it is.`;
        return;
      }
      msg.textContent = `The ${d}th is fully booked.`;
      if (reducedMotion) return;
      b.querySelector('svg')?.remove();
      b.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${crack(Math.round(p.rays))}" pathLength="1" /></svg>`);
      const path = b.querySelector('path');
      gsap.timeline()
        .fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.18, ease: 'power4.out' })
        .fromTo(b, { x: 0 }, { keyframes: { x: [-3, 3, -2, 1, 0] }, duration: 0.3, ease: 'none' }, 0)
        .to(path, { autoAlpha: 0, duration: 0.5, delay: p.heal, onComplete: () => path.parentNode?.remove() });
    });
    return () => k.destroy();
  },
};
