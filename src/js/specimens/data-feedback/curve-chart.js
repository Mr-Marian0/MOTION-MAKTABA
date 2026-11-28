/** Curve Chart: a smooth line chart built from Bézier curves, with a reading dot that glides along the curve under the pointer (or the arrow keys), carrying a tooltip with the value at that point. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const DATA = [12, 19, 15, 28, 24, 36, 31, 44];

export const meta = {
  title: 'Curve Chart',
  element: 'Charts',
  trigger: ['Cursor move', 'Keyboard', 'In view'],
  behavior: ['Cursor-following', 'Snap-to-path', 'Scroll-triggered'],
  effect: ['Bezier-path-motion', 'Spline-following', 'Sliding'],
  purpose: ['Focus', 'Orientation', 'Feedback'],
  properties: ['Path', 'Position'],
  description: 'A monthly revenue line drawn as a smooth curve of joined Bézier segments, which draws itself in when it comes into view. A reading dot rides on the curve: move the pointer across the chart (or press ←/→) and the dot glides along the actual curved line, not straight between points, with a tooltip showing the month and value nearest to it.',
  params: [
    { key: 'tension', label: 'Curve softness', group: 'Shape', type: 'range', min: 0, max: 0.5, step: 0.05, unit: '', default: 0.3 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Line'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const W = 280, H = 130, n = DATA.length;
    const pts = DATA.map((v, i) => [10 + (i * (W - 20)) / (n - 1), H - 10 - (v / 50) * (H - 20)]);
    // Catmull-Rom → cubic Bézier: control points from neighbours, scaled by the tension
    const d = pts.reduce((acc, [x, y], i) => {
      if (!i) return `M${x} ${y}`;
      const [p0, p1, p2, p3] = [pts[i - 2] || pts[i - 1], pts[i - 1], pts[i], pts[i + 1] || pts[i]];
      const c1 = [p1[0] + (p2[0] - p0[0]) * p.tension, p1[1] + (p2[1] - p0[1]) * p.tension];
      const c2 = [p2[0] - (p3[0] - p1[0]) * p.tension, p2[1] - (p3[1] - p1[1]) * p.tension];
      return `${acc} C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${x} ${y}`;
    }, '');
    k.html(`
      <div class="sp sp-df sp-crc">
        <div class="sp-df__card">
          <span class="sp-df__kick">Revenue (£k)</span>
          <div class="sp-crc__plot" tabindex="0" role="img" aria-label="Revenue by month, ${MONTHS.map((m, i) => `${m} ${DATA[i]}k`).join(', ')}">
            <svg viewBox="0 0 ${W} ${H}"><path class="sp-crc__area" d="${d} L${pts[n - 1][0]} ${H} L${pts[0][0]} ${H} Z"/><path class="sp-crc__line" d="${d}"/><circle class="sp-crc__dot" r="5"/></svg>
            <b class="sp-crc__tip" aria-live="polite"></b>
          </div>
        </div>
      </div>`);
    const plot = k.$('.sp-crc__plot');
    const line = k.$('.sp-crc__line');
    const dot = k.$('.sp-crc__dot');
    const tip = k.$('.sp-crc__tip');
    const len = line.getTotalLength();
    // x → length along the path, by bisection (done once per move; the path is short)
    const atX = (x) => { let a = 0, b = len; for (let i = 0; i < 18; i++) { const m = (a + b) / 2; line.getPointAtLength(m).x < x ? (a = m) : (b = m); } return (a + b) / 2; };
    const s = { l: 0 };
    let PW = 1, PH = 1;
    k.resize(plot, () => { PW = plot.offsetWidth; PH = plot.offsetHeight; });
    gsap.set(tip, { xPercent: -50, yPercent: -170 }); // centred above the dot (GSAP owns the tooltip's transform)
    const place = () => {
      const pt = line.getPointAtLength(s.l);
      gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
      const i = Math.round(((pt.x - 10) / (W - 20)) * (n - 1));
      tip.textContent = `${MONTHS[i]} · £${DATA[i]}k`;
      gsap.set(tip, { x: (pt.x / W) * PW, y: (pt.y / H) * PH });
    };
    const glide = (x) => gsap.to(s, { l: atX(Math.max(10, Math.min(W - 10, x))), duration: reducedMotion ? 0 : 0.35, ease: 'power3.out', onUpdate: place, overwrite: true });
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    k.inView(plot, () => { gsap.to(line, { strokeDashoffset: 0, duration: reducedMotion ? 0 : 1.4, ease: 'power2.inOut' }); glide(pts[n - 1][0]); }, 0.5);
    let box;
    k.on(plot, 'pointerenter', () => (box = plot.getBoundingClientRect()));
    k.on(plot, 'pointermove', (e) => box && glide(((e.clientX - box.left) / box.width) * W));
    let at = n - 1;
    k.on(plot, 'keydown', (e) => { const dd = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!dd) return; e.preventDefault(); at = Math.max(0, Math.min(n - 1, at + dd)); glide(pts[at][0]); });
    return () => k.destroy();
  },
};
