/** Repel Chart: a crowded scatter plot whose points shy away from the pointer, opening a clear patch around it so the point you are nearest stands alone with its label; they drift back when you move on. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from '../cards-containers/_shape.js';

export const meta = {
  title: 'Repel Chart',
  element: 'Charts',
  trigger: ['Cursor move', 'Hover', 'Keyboard'],
  behavior: ['Repelled', 'Proximity-aware', 'Elastic'],
  effect: ['Repulsion-motion', 'Scattering', 'Spring-motion'],
  purpose: ['Focus', 'Hierarchy', 'Orientation'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A busy scatter plot of 40 products (price against rating) that clears a space for you. As the pointer moves over the plot, points within reach are pushed away from it, harder the closer they are, leaving a clear ring with only the nearest point inside it, enlarged and labelled. Move on and they spring back. Focus the plot and ←/→ step through the points in price order.',
  params: [
    { key: 'reach', label: 'Reach', group: 'Shape', type: 'range', min: 10, max: 60, step: 2, unit: 'px', default: 34, live: true },
    { key: 'push', label: 'Push', group: 'Motion', type: 'range', min: 4, max: 40, step: 1, unit: 'px', default: 18, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Picked'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(11);
    const DATA = Array.from({ length: 40 }, (_, i) => ({ name: `Item ${i + 1}`, price: Math.round(8 + r() * 90), rating: +(2.5 + r() * 2.5).toFixed(1) })).sort((a, b) => a.price - b.price);
    k.html(`
      <div class="sp sp-df sp-rpc">
        <div class="sp-df__card">
          <span class="sp-df__kick">Price vs rating</span>
          <div class="sp-rpc__plot" tabindex="0" aria-label="Scatter plot of 40 products; arrow keys step through them">
            ${DATA.map((d) => `<i class="sp-rpc__pt" style="left:${d.price}%;top:${100 - ((d.rating - 2.5) / 2.5) * 100}%"></i>`).join('')}
            <b class="sp-rpc__tip" aria-live="polite"></b>
          </div>
          <div class="sp-df__row"><small>£ cheap</small><small>dear £</small></div>
        </div>
      </div>`);
    const plot = k.$('.sp-rpc__plot');
    const ptsEl = k.$$('.sp-rpc__pt');
    const tip = k.$('.sp-rpc__tip');
    let C = [];
    k.resize(plot, () => (C = ptsEl.map((el) => [el.offsetLeft, el.offsetTop])));
    const mv = ptsEl.map((el) => ['x', 'y', 'scaleX', 'scaleY'].map((pr) => gsap.quickTo(el, pr, { duration: 0.35, ease: 'power3.out' })));
    gsap.set(tip, { autoAlpha: 0, xPercent: -50, yPercent: -140 });
    const look = (px, py, pick) => {
      let best = pick ?? -1, bd = 1e9;
      if (pick === undefined) C.forEach(([x, y], i) => { const d = Math.hypot(x - px, y - py); if (d < bd) bd = d, best = i; });
      ptsEl.forEach((el, i) => {
        el.classList.toggle('is-on', i === best);
        if (reducedMotion) return;
        if (i === best) { mv[i][0](0); mv[i][1](0); mv[i][2](1.8); mv[i][3](1.8); return; }
        const dx = C[i][0] - px, dy = C[i][1] - py, d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / p.reach);
        mv[i][0]((dx / d) * f * p.push); mv[i][1]((dy / d) * f * p.push); mv[i][2](1 - f * 0.3); mv[i][3](1 - f * 0.3);
      });
      const d = DATA[best];
      tip.textContent = `£${d.price} · ★ ${d.rating}`;
      gsap.set(tip, { x: C[best][0], y: C[best][1], autoAlpha: 1 });
    };
    let box, at = 0;
    k.on(plot, 'pointerenter', () => (box = plot.getBoundingClientRect()));
    k.on(plot, 'pointermove', (e) => box && look(e.clientX - box.left, e.clientY - box.top));
    const calm = () => { box = null; ptsEl.forEach((el) => el.classList.remove('is-on')); gsap.to(ptsEl, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: true }); gsap.to(tip, { autoAlpha: 0, duration: 0.2 }); };
    k.on(plot, 'pointerleave', calm);
    k.on(plot, 'blur', calm);
    k.on(plot, 'keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!d) return; e.preventDefault(); at = Math.max(0, Math.min(DATA.length - 1, at + d)); look(...C[at], at); });
    return () => k.destroy();
  },
};
