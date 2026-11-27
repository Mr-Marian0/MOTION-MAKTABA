/** Freeze Plan: freezing the subscription ices the card over: frost and crystals creep in from the corners while its live usage chart slows down and stops. Thaw reverses it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from './_shape.js';

export const meta = {
  title: 'Freeze Plan',
  element: 'Pricing card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'State-dependent', 'Pausable', 'Auto-playing'],
  effect: ['Freezing', 'Crystallization', 'Decelerating', 'Shaking'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Color', 'Clip & mask', 'Path', 'Opacity'],
  description: 'A plan card with a live usage chart. "Freeze plan" ices it over: frost creeps in from the corners, crystals branch across the surface, and the chart and counter slow to a stop as if frozen in place, ending with a shiver. Thaw melts the frost and everything starts moving again.',
  params: [
    { key: 'time', label: 'Freeze time', group: 'Motion', type: 'range', min: 0.6, max: 4, step: 0.2, unit: 's', default: 1.8, live: true },
    { key: 'frost', label: 'Frost cover', group: 'Shape', type: 'range', min: 0.3, max: 1, step: 0.05, unit: '', default: 0.75, live: true },
    tone('#2f4a6b'),
  ],
};

/** Branching ice from a corner (x, y) heading at angle a, as one path in 0–100 units. */
function crystal(r, x, y, a) {
  let d = '';
  const arm = (px, py, ang, len, depth) => {
    const [ex, ey] = [px + Math.cos(ang) * len, py + Math.sin(ang) * len];
    d += `M${px.toFixed(1)} ${py.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    if (depth > 2) return;
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const [bx, by] = [px + (ex - px) * t, py + (ey - py) * t];
      arm(bx, by, ang + (i % 2 ? 1 : -1) * (0.9 + r() * 0.3), len * (0.35 - depth * 0.06), depth + 1);
    }
  };
  arm(x, y, a, 26 + r() * 10, 0);
  return d;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(13);
    const ice = [[0, 0, 0.8], [100, 0, 2.3], [100, 100, -2.3], [0, 100, -0.8]].map(([x, y, a]) => crystal(r, x, y, a));
    k.html(`
      <div class="sp sp-cc sp-frz">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-frz__card">
            <div class="sp-cc__row"><span class="sp-cc__kick">Team plan · $24/mo</span><span class="sp-frz__state" aria-live="polite">Live</span></div>
            <b class="sp-cc__big sp-frz__count">1,284</b>
            <span class="sp-cc__text">API calls today</span>
            <span class="sp-frz__chart">${Array.from({ length: 12 }, () => '<i></i>').join('')}</span>
            <i class="sp-frz__frost"></i>
            <svg class="sp-frz__ice" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${ice.map((d) => `<path d="${d}" pathLength="1" />`).join('')}</svg>
          </article>
        </div>
        <button type="button" class="sp-cc__btn sp-frz__btn" aria-pressed="false">Freeze plan</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-frz__card');
    const bars = k.$$('.sp-frz__chart i');
    const count = k.$('.sp-frz__count');
    const state = k.$('.sp-frz__state');
    const ice2 = k.$$('.sp-frz__ice path');
    const btn = k.$('.sp-frz__btn');
    k.fit(wrap, 0.86);
    gsap.set(card, { '--f': 0 });
    gsap.set(ice2, { strokeDasharray: 1, strokeDashoffset: 1 });

    // The live part: bars bob and the counter ticks. Freezing slows this timeline to a stop.
    let calls = 1284;
    const live = gsap.timeline({ repeat: -1 });
    bars.forEach((b, i) => live.to(b, { scaleY: 0.3 + Math.random() * 0.7, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, i * 0.08));
    [0, 0.35, 0.7, 1.05].forEach((t) => live.add(() => (count.textContent = (calls += 1 + Math.round(Math.random() * 3)).toLocaleString('en')), t));
    if (reducedMotion) live.pause();

    k.on(btn, 'click', () => {
      const frozen = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(frozen));
      btn.textContent = frozen ? 'Thaw' : 'Freeze plan';
      state.textContent = frozen ? 'Frozen' : 'Live';
      const dur = reducedMotion ? 0 : p.time;
      gsap.to(card, { '--f': frozen ? p.frost : 0, duration: dur, ease: frozen ? 'power1.out' : 'power2.in', overwrite: 'auto' });
      gsap.to(ice2, { strokeDashoffset: frozen ? 0 : 1, duration: dur * 0.9, stagger: dur * 0.05, ease: frozen ? 'power2.out' : 'power2.in', delay: frozen ? dur * 0.1 : 0 });
      if (!reducedMotion) gsap.to(live, { timeScale: frozen ? 0 : 1, duration: frozen ? dur : 0.6, ease: 'power2.out', delay: frozen ? 0 : dur * 0.6 });
      if (frozen && !reducedMotion) gsap.fromTo(card, { x: 0 }, { keyframes: { x: [-2, 2, -1, 1, 0] }, duration: 0.3, delay: dur, ease: 'none' });
    });

    return () => { live.kill(); k.destroy(); };
  },
};
