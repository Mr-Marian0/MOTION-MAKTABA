/** Hop Date: the selection ring is a little jumper: pick a new day and it crouches, jumps over the calendar in an arc and lands on the new date with a squash. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Hop Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Position-aware', 'Elastic', 'Event-driven'],
  effect: ['Jumping', 'Parabolic-motion', 'Squashing'],
  purpose: ['Feedback', 'Continuity', 'Orientation'],
  properties: ['Position', 'Scale'],
  description: 'A calendar whose selection marker hops. Choose another day and the ring crouches (squashing down), springs up, sails over the grid in an arc whose height grows with the distance, and lands on the new date, squashing on impact before standing up again. Arrow keys move focus; Enter or Space makes it jump.',
  params: [
    { key: 'height', label: 'Jump height', group: 'Motion', type: 'range', min: 0.5, max: 5, step: 0.25, unit: 'em', default: 2, live: true },
    { key: 'time', label: 'Air time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Jumper'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-hop">
        <div class="sp-fi__cal sp-hop__cal">
          <b class="sp-fi__month">${MONTHS[10]} 2026</b>
          <div class="sp-hop__grid">${days(2026, 10, { picked: 9 })}<i class="sp-hop__ring" aria-hidden="true"></i></div>
        </div>
      </div>`);
    const cal = k.$('.sp-hop__cal');
    const grid = k.$('.sp-hop__grid');
    const ring = k.$('.sp-hop__ring');
    k.fit(cal);
    // Cell offsets are layout reads, done once per jump (and on resize), never per frame
    const spot = (b) => [b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2];
    let at = grid.querySelector('[aria-pressed="true"]');
    k.resize(grid, () => { const [x, y] = spot(at); gsap.set(ring, { x, y }); });
    const em = () => parseFloat(getComputedStyle(grid).fontSize) || 14;
    dayKeys(k, grid, (b) => {
      if (b === at) return;
      const [[x0, y0], [x1, y1]] = [spot(at), spot(b)];
      at = b;
      pickDay(grid, b);
      if (reducedMotion) return gsap.set(ring, { x: x1, y: y1 });
      const H = em() * p.height + Math.hypot(x1 - x0, y1 - y0) * 0.25;
      const s = { u: 0 };
      gsap.timeline()
        .to(ring, { scaleX: 1.3, scaleY: 0.7, duration: 0.1, ease: 'power2.out', transformOrigin: '50% 100%' })
        .to(s, { u: 1, duration: p.time, ease: 'none', onStart: () => gsap.set(ring, { scaleX: 0.85, scaleY: 1.2 }), onUpdate: () => gsap.set(ring, { x: x0 + (x1 - x0) * s.u, y: y0 + (y1 - y0) * s.u - 4 * H * s.u * (1 - s.u) }) })
        .to(ring, { scaleX: 1.35, scaleY: 0.65, duration: 0.08, ease: 'power2.in' })
        .to(ring, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
    return () => k.destroy();
  },
};
