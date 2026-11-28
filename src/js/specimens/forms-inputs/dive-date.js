/** Dive Date: the day you pick leaps up off the calendar and dives head first into the date field above it, landing with a splash ripple, and the field reads the new date. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Dive Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Position-aware', 'Sequential'],
  effect: ['Diving', 'Parabolic-motion', 'Ripple-deformation'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A check-in date picker where the number you choose travels to the field. Pick a day and a copy of its number springs up off the grid, arcs over and dives head first into the date field at the top, turning as it goes. Where it enters, a little ripple spreads across the field, and the field now reads that date.',
  params: [
    { key: 'height', label: 'Leap height', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'time', label: 'Dive time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('div');
    k.html(`
      <div class="sp sp-fi sp-div">
        <div class="sp-div__card">
          <label class="sp-fi__label" for="${id}">Check-in</label>
          <div class="sp-fi__box sp-div__pool"><output class="sp-fi__value" id="${id}">Pick a day</output><i class="sp-div__ring" aria-hidden="true"></i></div>
          <div class="sp-fi__cal sp-div__cal"><b class="sp-fi__month">${MONTHS[10]} 2026</b>${days(2026, 10)}</div>
          <span class="sp-div__air" aria-hidden="true"></span>
        </div>
      </div>`);
    const card = k.$('.sp-div__card');
    const pool = k.$('.sp-div__pool');
    const out = k.$('output');
    const ring = k.$('.sp-div__ring');
    const air = k.$('.sp-div__air');
    k.fit(card);
    gsap.set(ring, { autoAlpha: 0 });
    dayKeys(k, k.$('.sp-div__cal'), (b, d) => {
      pickDay(k.$('.sp-div__cal'), b);
      const text = `${d} ${MONTHS[10]} 2026`;
      if (reducedMotion) return (out.value = text);
      // Positions in the card's own (unscaled) pixels: rects divided by the fit scale, read once per pick
      const cr = card.getBoundingClientRect();
      const sc = cr.width / card.offsetWidth || 1;
      const from = b.getBoundingClientRect();
      const to = pool.getBoundingClientRect();
      const [x0, y0] = [(from.left - cr.left) / sc, (from.top - cr.top) / sc];
      const [x1, y1] = [(to.left - cr.left) / sc + 24, (to.top - cr.top) / sc + to.height / sc / 2 - 8];
      const n = document.createElement('b');
      n.className = 'sp-div__num';
      n.textContent = d;
      air.append(n);
      // A parabola from the cell to the pool: up by `height`, then down head first (rotation follows the descent)
      const s = { u: 0 };
      const H = (parseFloat(getComputedStyle(card).fontSize) || 16) * p.height;
      gsap.timeline({ onComplete: () => n.remove() })
        .to(s, { u: 1, duration: p.time, ease: 'none', onUpdate: () => {
          const u = s.u;
          const x = x0 + (x1 - x0) * u;
          const y = y0 + (y1 - y0) * u - 4 * H * u * (1 - u);
          gsap.set(n, { x, y, rotation: -20 + u * 200, scale: 1 - u * 0.3 });
        } })
        .set(n, { autoAlpha: 0 })
        .call(() => (out.value = text))
        .fromTo(ring, { autoAlpha: 1, scaleX: 0.1, scaleY: 0.1 }, { scaleX: 1, scaleY: 0.5, autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
        .fromTo(out, { y: '0.3em' }, { y: 0, duration: 0.4, ease: 'back.out(3)' }, '<');
    });
    return () => k.destroy();
  },
};
