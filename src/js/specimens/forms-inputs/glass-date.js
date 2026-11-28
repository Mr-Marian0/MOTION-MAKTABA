/** Glass Date: a glass lens glides over the calendar with your pointer or focus: the day under it is magnified, and the days around it bend outward as if seen through the curved edge of the glass. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Glass Date',
  element: 'Date picker',
  trigger: ['Hover', 'Cursor move', 'Keyboard', 'Click'],
  behavior: ['Cursor-following', 'Proximity-aware', 'Focus-dependent'],
  effect: ['Refraction-motion', 'Optical-warping', 'Bulging'],
  purpose: ['Focus', 'Affordance', 'Delight'],
  properties: ['Scale', 'Position'],
  description: 'A calendar with a magnifying glass. A clear lens follows the day you point at (or tab to), and everything is seen through it: the day under the centre swells, and the neighbouring days are pushed outward and slightly enlarged, falling off with distance, the way a lens bends what is near its rim. Click or press Enter to pick the magnified day.',
  params: [
    { key: 'mag', label: 'Magnification', group: 'Motion', type: 'range', min: 1.1, max: 2, step: 0.05, unit: '×', default: 1.55, live: true },
    { key: 'bend', label: 'Edge bend', group: 'Motion', type: 'range', min: 0, max: 0.6, step: 0.05, unit: 'em', default: 0.3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-gls">
        <div class="sp-fi__cal sp-gls__cal">
          <b class="sp-fi__month">${MONTHS[10]} 2026</b>
          <div class="sp-gls__grid">${days(2026, 10, { picked: 13 })}<i class="sp-gls__lens" aria-hidden="true"></i></div>
        </div>
      </div>`);
    const cal = k.$('.sp-gls__cal');
    const grid = k.$('.sp-gls__grid');
    const lens = k.$('.sp-gls__lens');
    const cells = k.$$('.sp-fi__day');
    k.fit(cal);
    // Cell centres and the em size are measured on resize; a lens move only does arithmetic
    let C = [], E = 14;
    k.resize(grid, () => {
      C = cells.map((b) => [b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2]);
      E = parseFloat(getComputedStyle(grid).fontSize) || 14;
    });
    gsap.set(lens, { autoAlpha: 0, scale: 0.6 });
    const lx = gsap.quickTo(lens, 'x', { duration: 0.25, ease: 'power3.out' });
    const ly = gsap.quickTo(lens, 'y', { duration: 0.25, ease: 'power3.out' });
    let at = -1;
    const look = (i) => {
      if (i === at) return;
      at = i;
      if (i < 0) {
        gsap.to(lens, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
        return gsap.to(cells, { x: 0, y: 0, scale: 1, duration: reducedMotion ? 0 : 0.3, overwrite: true });
      }
      const [cx, cy] = C[i];
      if (reducedMotion) { gsap.set(lens, { x: cx, y: cy, autoAlpha: 1, scale: 1 }); }
      else { lx(cx); ly(cy); gsap.to(lens, { autoAlpha: 1, scale: 1, duration: 0.2 }); }
      const R = E * 2.6; // lens radius
      cells.forEach((b, j) => {
        const [x, y] = C[j];
        const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
        if (j === i) return gsap.to(b, { x: 0, y: 0, scale: p.mag, duration: reducedMotion ? 0 : 0.25, overwrite: true });
        // inside the rim: pushed out along the radius and enlarged, both falling off towards the rim
        const f = Math.max(0, 1 - d / R);
        const push = p.bend * E * f * 2;
        gsap.to(b, { x: d ? (dx / d) * push : 0, y: d ? (dy / d) * push : 0, scale: 1 + (p.mag - 1) * f * 0.6, duration: reducedMotion ? 0 : 0.25, overwrite: true });
      });
    };
    k.on(grid, 'pointerover', (e) => { const b = e.target.closest('.sp-fi__day'); if (b) look(cells.indexOf(b)); });
    k.on(grid, 'pointerleave', () => look(-1));
    k.on(grid, 'focusin', (e) => { const b = e.target.closest('.sp-fi__day'); if (b) look(cells.indexOf(b)); });
    k.on(grid, 'focusout', (e) => !grid.contains(e.relatedTarget) && look(-1));
    dayKeys(k, grid, (b) => pickDay(grid, b));
    return () => k.destroy();
  },
};
