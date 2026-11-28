/** Tassel Tip: a chart tooltip that follows the cursor along the line; a little tag hangs from it on a string and swings behind as it moves, still swinging after the tooltip stops. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Tassel Tip',
  element: 'Tooltip',
  trigger: ['Cursor move', 'Hover', 'Keyboard'],
  behavior: ['Pointer-tracking', 'Following', 'Velocity-aware', 'Physics-driven'],
  effect: ['Secondary-motion', 'Swinging', 'Follow-through', 'Damped-oscillation'],
  purpose: ['Delight', 'Focus'],
  properties: ['Position', 'Rotation'],
  description: 'A line-chart tooltip with a tassel. The tooltip glides along the line after the cursor (the primary motion), while a little tag hanging under it on a string swings behind with the speed and keeps swinging after the tooltip stops, settling on its own (the secondary motion). Arrow keys step along the points.',
  params: [
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 0.2, max: 3, step: 0.1, unit: '×', default: 1.2, live: true },
    { key: 'damp', label: 'Settle', group: 'Motion', type: 'range', min: 0.05, max: 0.5, step: 0.05, unit: '', default: 0.15, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Line'),
  ],
};

const PTS = [42, 55, 48, 70, 62, 80, 74, 90];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const d = PTS.map((v, i) => `${(i / (PTS.length - 1)) * 100} ${100 - v}`).join(' L');
    k.html(`
      <div class="sp sp-ov sp-tsl">
        ${page('Visitors', 'Analytics')}
        <div class="sp-tsl__chart" tabindex="0" role="img" aria-label="Visitors this week">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M${d}" /></svg>
          <div class="sp-tsl__tip"><span class="sp-ov__tip sp-tsl__label"></span><i class="sp-tsl__string"><i class="sp-tsl__tag"></i></i></div>
        </div>
      </div>`);
    const chart = k.$('.sp-tsl__chart');
    const tip = k.$('.sp-tsl__tip');
    const label = k.$('.sp-tsl__label');
    const string = k.$('.sp-tsl__string');
    let W = 1;
    let H = 1;
    k.resize(chart, () => ((W = chart.clientWidth), (H = chart.clientHeight), place(cur, true)));
    let cur = 0;
    // The tassel: a pendulum pushed by the tooltip's acceleration (secondary motion), run on the ticker only while it moves.
    const pend = { a: 0, v: 0, lastX: 0, lastV: 0 };
    let ticking = false;
    const tick = (t, dt) => {
      const s = Math.min(dt / 1000, 0.04) || 0.016;
      const x = gsap.getProperty(tip, 'x');
      const vx = (x - pend.lastX) / s;
      const ax = (vx - pend.lastV) / s;
      pend.lastX = x;
      pend.lastV = vx;
      // Damped pendulum hung from a moving point: gravity pulls it back, the support's acceleration kicks it.
      const L = 20; // string length, px
      const acc = -60 * Math.sin(pend.a) - (ax / L) * Math.cos(pend.a) * 0.15 * p.swing - pend.v * p.damp * 20;
      pend.v += acc * s;
      pend.a = clamp(pend.a + pend.v * s, -1.2, 1.2);
      gsap.set(string, { rotation: (pend.a * 180) / Math.PI });
      if (Math.abs(pend.a) < 0.002 && Math.abs(pend.v) < 0.002 && Math.abs(vx) < 1) (ticking = false), gsap.ticker.remove(tick);
    };
    const wake = () => !reducedMotion && !ticking && ((ticking = true), (pend.lastX = gsap.getProperty(tip, 'x')), (pend.lastV = 0), gsap.ticker.add(tick));
    function place(i, instant) {
      cur = i;
      label.textContent = `${DAYS[i]} · ${PTS[i] * 12}`;
      const x = (i / (PTS.length - 1)) * W;
      const y = (1 - PTS[i] / 100) * H;
      gsap.to(tip, { x, y, duration: instant || reducedMotion ? 0 : 0.35, ease: 'power2.out', overwrite: true });
      wake();
    }
    k.on(chart, 'pointermove', (e) => {
      const r = chart.getBoundingClientRect();
      const i = Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * (PTS.length - 1));
      if (i !== cur) place(i);
    });
    k.on(chart, 'keydown', (e) => {
      const dd = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (dd) e.preventDefault(), place(clamp(cur + dd, 0, PTS.length - 1));
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
