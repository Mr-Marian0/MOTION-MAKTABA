/** Route Date: a date-range picker that draws your trip: pick a start and an end, and a route draws itself day by day through the calendar from one to the other, with a little traveller riding along it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys } from './_fi.js';

export const meta = {
  title: 'Route Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'State-dependent', 'Position-aware'],
  effect: ['Path-following', 'Spline-following', 'Curved-path-motion'],
  purpose: ['Orientation', 'Feedback', 'Storytelling'],
  properties: ['Path', 'Position'],
  description: 'A trip calendar where the range is a journey. Pick a start day, then an end day: a route draws itself underneath the dates through every day in between (along each week row, curving down to the next row at the end of the week) and a small marker travels along it from the first day to the last, lighting the days up as it passes.',
  params: [
    { key: 'speed', label: 'Days per second', group: 'Motion', type: 'range', min: 4, max: 30, step: 1, unit: '', default: 12, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Route'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-rte">
        <div class="sp-fi__cal sp-rte__cal">
          <b class="sp-fi__month">${MONTHS[10]} 2026</b>
          <div class="sp-rte__grid">${days(2026, 10)}<svg class="sp-rte__map" aria-hidden="true"><path class="sp-rte__route" /></svg><i class="sp-rte__mark" aria-hidden="true"></i></div>
          <small class="sp-fi__msg" aria-live="polite">Pick the first day of the trip</small>
        </div>
      </div>`);
    const cal = k.$('.sp-rte__cal');
    const grid = k.$('.sp-rte__grid');
    const svg = k.$('.sp-rte__map');
    const route = k.$('.sp-rte__route');
    const mark = k.$('.sp-rte__mark');
    const msg = k.$('.sp-fi__msg');
    const cells = k.$$('.sp-fi__day');
    k.fit(cal);
    gsap.set(mark, { autoAlpha: 0 });
    let start = 0, tl;
    const centre = (d) => { const b = cells[d - 1]; return [b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2]; };
    // A smooth path through the centres of days a..b: straight along a week, a curve over to the next row
    const pathFor = (a, b) => {
      const pts = Array.from({ length: b - a + 1 }, (_, i) => centre(a + i));
      return pts.reduce((d, [x, y], i) => {
        if (!i) return `M${x} ${y}`;
        const [px, py] = pts[i - 1];
        return py === y ? `${d} L${x} ${y}` : `${d} C${px + 18} ${py}, ${x - 18} ${y}, ${x} ${y}`;
      }, '');
    };
    const mark1 = (d, cls, on) => cells[d - 1].classList.toggle(cls, on);
    dayKeys(k, grid, (b, d) => {
      tl?.kill();
      cells.forEach((c) => c.classList.remove('is-in', 'is-end') || c.setAttribute('aria-pressed', 'false'));
      if (!start || d <= start) {
        start = d;
        route.setAttribute('d', '');
        gsap.set(mark, { autoAlpha: 0 });
        mark1(d, 'is-end', true);
        b.setAttribute('aria-pressed', 'true');
        msg.textContent = `From ${d} ${MONTHS[10]}. Now pick the last day`;
        return;
      }
      const [a, z] = [start, d];
      start = 0;
      svg.setAttribute('width', grid.offsetWidth);
      svg.setAttribute('height', grid.offsetHeight);
      route.setAttribute('d', pathFor(a, z));
      [a, z].forEach((x) => { mark1(x, 'is-end', true); cells[x - 1].setAttribute('aria-pressed', 'true'); });
      msg.textContent = `${z - a + 1} days: ${a}–${z} ${MONTHS[10]}`;
      const len = route.getTotalLength();
      const n = z - a;
      if (reducedMotion) { for (let i = a; i <= z; i++) mark1(i, 'is-in', true); return; }
      // The marker rides the drawn tip of the route; each day lights up as the marker passes it
      const s = { t: 0 };
      tl = gsap.timeline()
        .set(route, { strokeDasharray: len, strokeDashoffset: len })
        .set(mark, { autoAlpha: 1 })
        .to(s, { t: 1, duration: Math.max(0.4, n / p.speed), ease: 'power1.inOut', onUpdate: () => {
          const pt = route.getPointAtLength(s.t * len);
          gsap.set(mark, { x: pt.x, y: pt.y });
          gsap.set(route, { strokeDashoffset: len * (1 - s.t) });
          const lit = a + Math.floor(s.t * n + 0.001);
          for (let i = a; i <= lit; i++) mark1(i, 'is-in', true);
        } })
        .to(mark, { scale: 1.6, autoAlpha: 0, duration: 0.35 });
    });
    return () => k.destroy();
  },
};
