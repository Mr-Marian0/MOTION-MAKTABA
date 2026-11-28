/** Swirl Loader: particles swirl around a centre like stirred tea: inner ones circle fast, outer ones slow, all drifting slowly inward and respawning at the rim, so the swirl never stops pulling in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Swirl Loader',
  element: 'Loader',
  trigger: ['Load', 'Idle', 'Hover'],
  behavior: ['Looping', 'Attracted', 'Continuous'],
  effect: ['Swirl-motion', 'Spiraling', 'Convergence'],
  purpose: ['Progress', 'Delight', 'Branding'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'A "brewing your report" loader made of tea leaves stirred in a cup. Dozens of specks circle the centre, the inner ones fast and the outer ones slow, like a liquid that has just been stirred; each spirals gradually inward, shrinking, and when it reaches the middle it reappears at the rim. Hovering gives it a fresh stir so everything speeds up and then settles back.',
  params: [
    { key: 'specks', label: 'Specks', group: 'Shape', type: 'range', min: 12, max: 60, step: 2, unit: '', default: 36 },
    { key: 'speed', label: 'Swirl speed', group: 'Motion', type: 'range', min: 0.3, max: 3, step: 0.1, unit: '×', default: 1, live: true },
    tone('#6b4423', 'tone', '--sp-accent', 'Leaves'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.specks * (lite ? 0.5 : 1));
    k.html(`
      <div class="sp sp-df sp-swl">
        <div class="sp-swl__cup" role="status" aria-label="Brewing your report">${'<i></i>'.repeat(n)}</div>
        <small class="sp-df__kick">Brewing your report…</small>
      </div>`);
    const cup = k.$('.sp-swl__cup');
    const specks = k.$$('.sp-swl__cup i');
    let R = 50;
    k.resize(cup, () => (R = cup.offsetWidth / 2 - 6));
    const st = specks.map(() => ({ a: Math.random() * Math.PI * 2, r: 0.15 + Math.random() * 0.85 }));
    const s = { stir: 1 };
    const draw = () => specks.forEach((el, i) => {
      const q = st[i];
      gsap.set(el, { x: Math.cos(q.a) * q.r * R, y: Math.sin(q.a) * q.r * R, scale: 0.4 + q.r * 0.8, opacity: 0.35 + q.r * 0.65 });
    });
    const tick = (t, ms) => {
      const dt = ms / 1000;
      st.forEach((q) => {
        q.a += (dt * p.speed * s.stir * 2.2) / Math.max(0.15, q.r); // faster near the centre
        q.r -= dt * 0.06 * p.speed;
        if (q.r < 0.08) { q.r = 1; q.a = Math.random() * Math.PI * 2; }
      });
      draw();
    };
    if (reducedMotion) draw(); else gsap.ticker.add(tick);
    k.on(cup, 'pointerenter', () => !reducedMotion && gsap.fromTo(s, { stir: 3 }, { stir: 1, duration: 2.5, ease: 'power2.out' }));
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
