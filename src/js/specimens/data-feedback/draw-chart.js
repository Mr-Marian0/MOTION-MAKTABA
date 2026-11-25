/** Ink Chart: the line draws itself in, points pop, the line morphs between datasets and a crosshair reads values. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink Line Chart',
  element: 'Charts',
  trigger: ['In view', 'Click', 'Cursor move'],
  behavior: ['Visibility-dependent', 'Pointer-tracking', 'Staggered', 'State-dependent'],
  effect: ['Path-following', 'Morphing', 'Bouncing', 'Sliding'],
  purpose: ['Progress', 'Focus', 'Continuity'],
  properties: ['Path', 'Position', 'Scale'],
  description: 'A line chart drawn in ink. The line draws itself in and the points pop when it comes into view. Switching the year morphs the line into the new data instead of redrawing it. Move over it to read any month.',
  params: [
    { key: 'draw', label: 'Draw time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'curve', label: 'Smooth curve', group: 'Shape', type: 'toggle', default: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Line color'),
  ],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const DATA = { 2025: [12, 18, 15, 26, 22, 31, 28, 36], 2026: [20, 16, 27, 24, 35, 30, 41, 38] };
const W = 300, H = 140, PAD = 16;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const xs = MONTHS.map((_, i) => PAD + (i * (W - PAD * 2)) / (MONTHS.length - 1));
    const y = (v) => H - PAD - (v / 45) * (H - PAD * 2);
    // Always the same commands for every dataset, so GSAP can morph the path string.
    const pathOf = (vals) => vals.map((v, i) => {
      if (!i) return `M${xs[0]} ${y(v)}`;
      if (!p.curve) return `L${xs[i]} ${y(v)}`;
      const cx = (xs[i - 1] + xs[i]) / 2;
      return `C${cx} ${y(vals[i - 1])} ${cx} ${y(v)} ${xs[i]} ${y(v)}`;
    }).join(' ');
    let year = '2025';
    k.html(`
      <div class="sp sp-chart">
        <div class="sp-chart__years" role="radiogroup" aria-label="Year">
          ${Object.keys(DATA).map((yr) => `<button type="button" role="radio" class="sp-chart__year" aria-checked="${yr === year}">${yr}</button>`).join('')}
        </div>
        <svg class="sp-chart__svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Prints sold per month">
          ${[0, 1, 2, 3].map((i) => `<line class="sp-chart__grid" x1="${PAD}" x2="${W - PAD}" y1="${PAD + i * ((H - PAD * 2) / 3)}" y2="${PAD + i * ((H - PAD * 2) / 3)}"/>`).join('')}
          <line class="sp-chart__cross" y1="${PAD}" y2="${H - PAD}"/>
          <path class="sp-chart__line" d="${pathOf(DATA[year])}"/>
          ${xs.map((x, i) => `<circle class="sp-chart__pt" cx="${x}" cy="${y(DATA[year][i])}" r="3.5"/>`).join('')}
        </svg>
        <output class="sp-chart__read" aria-live="polite">Hover the chart</output>
      </div>`);
    const svg = k.$('.sp-chart__svg');
    const line = k.$('.sp-chart__line');
    const pts = k.$$('.sp-chart__pt');
    const cross = k.$('.sp-chart__cross');
    const read = k.$('.sp-chart__read');
    const len = line.getTotalLength();

    k.inView(svg, () => {
      if (reducedMotion) return;
      gsap.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: Number(p.draw), ease: 'power2.inOut', onComplete: () => gsap.set(line, { strokeDasharray: 'none' }) });
      gsap.fromTo(pts, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: Number(p.draw) / pts.length });
    });
    k.$$('.sp-chart__year').forEach((b) => k.on(b, 'click', () => {
      year = b.textContent;
      k.$$('.sp-chart__year').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      const t = reducedMotion ? 0 : 0.8;
      gsap.to(line, { attr: { d: pathOf(DATA[year]) }, duration: t, ease: 'power3.inOut' });
      pts.forEach((pt, i) => gsap.to(pt, { attr: { cy: y(DATA[year][i]) }, duration: t, ease: 'power3.inOut', delay: i * 0.03 }));
    }));
    k.on(svg, 'pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const i = clamp(Math.round(((x - PAD) / (W - PAD * 2)) * (MONTHS.length - 1)), 0, MONTHS.length - 1);
      gsap.to(cross, { attr: { x1: xs[i], x2: xs[i] }, opacity: 1, duration: 0.25 });
      pts.forEach((pt, j) => pt.classList.toggle('is-on', j === i));
      read.textContent = `${MONTHS[i]} ${year}: ${DATA[year][i]} prints`;
    });
    k.on(svg, 'pointerleave', () => gsap.to(cross, { opacity: 0, duration: 0.3 }));

    return () => k.destroy();
  },
};
