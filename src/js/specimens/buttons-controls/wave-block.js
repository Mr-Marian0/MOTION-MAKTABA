/** Wave Block: a square icon button that keeps stretching upward and waving like seaweed, its base pinned to the ground. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wave Block',
  element: 'Icon button',
  trigger: ['Load', 'Hover', 'Click'],
  behavior: ['Looping', 'Continuous', 'Anchored', 'Hover-dependent'],
  effect: ['Stretching', 'Wave-deformation', 'Swaying', 'Squashing'],
  purpose: ['Decoration', 'Delight', 'Affordance'],
  properties: ['Shape', 'Size', 'Shadow'],
  description: 'A square that loops: it stretches up and a wave runs through its sides while the base stays stuck to its shadow. Hover to excite it; click to make it crouch and shoot up.',
  params: [
    { key: 'height', label: 'Stretch (Y)', group: 'Motion', type: 'range', min: 0, max: 1.2, step: 0.05, unit: '×', default: 0.6, live: true },
    { key: 'wave', label: 'Wave', group: 'Motion', type: 'range', min: 0, max: 14, step: 1, default: 6, live: true },
    { key: 'speed', label: 'Loop time', group: 'Motion', type: 'range', min: 0.6, max: 4, step: 0.1, unit: 's', default: 1.8, live: true },
    tone('#2f4a6b'),
  ],
};

const N = 14; // points per side
const BASE = 186; // ground line in the SVG
const SIDE = 50; // resting square size

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-wave">
        <button type="button" class="sp-wave__btn" aria-label="Wave">
          <svg viewBox="0 0 100 200" aria-hidden="true">
            <ellipse class="sp-wave__shadow" cx="50" cy="${BASE + 3}" rx="32" ry="4.5"/>
            <ellipse class="sp-wave__ring" cx="50" cy="${BASE + 3}" rx="30" ry="5"/>
            <path class="sp-wave__body"/>
            <path class="sp-wave__icon" d="M-8 4 L0 -4 L8 4"/>
          </svg>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-wave__btn');
    const body = k.$('.sp-wave__body');
    const icon = k.$('.sp-wave__icon');
    const shadow = k.$('.sp-wave__shadow');
    const ring = k.$('.sp-wave__ring');
    const st = k.track({ boost: 0, excite: 0 });
    let t = 0;

    const draw = () => {
      const ph = (t / Number(p.speed)) * Math.PI * 2;
      const s = (1 - Math.cos(ph)) / 2; // 0 → 1 → 0 each loop
      const amp = Number(p.wave) * (1 + st.excite);
      const h = SIDE * Math.max(0.55, 1 + Number(p.height) * s * (1 + st.excite * 0.3) + st.boost);
      const hwTop = (SIDE / 2) * (SIDE / h) ** 0.35; // the top thins as it stretches
      // The wave grows with height, so the bottom (f = 0) never moves.
      const dx = (f) => amp * f * Math.sin(f * Math.PI * 1.6 - ph * 1.5);
      const L = [];
      const R = [];
      for (let i = 0; i <= N; i++) {
        const f = i / N;
        const y = (BASE - h * f).toFixed(2);
        const hw = SIDE / 2 + (hwTop - SIDE / 2) * f;
        L.push(`${(50 - hw + dx(f)).toFixed(2)} ${y}`);
        R.unshift(`${(50 + hw + dx(f)).toFixed(2)} ${y}`);
      }
      body.setAttribute('d', `M${L.join(' L')} L${R.join(' L')} Z`);
      icon.setAttribute('transform', `translate(${(50 + dx(0.8)).toFixed(2)} ${(BASE - h + 16).toFixed(2)})`);
      shadow.setAttribute('rx', (32 + 3 * s + st.boost * 6).toFixed(2));
    };
    const tick = (_, dt) => {
      t += (dt / 1000) * (1 + st.excite * 0.6);
      draw();
    };
    if (reducedMotion) draw();
    else gsap.ticker.add(tick);

    k.on(btn, 'pointerenter', () => gsap.to(st, { excite: 1, duration: 0.5 }));
    k.on(btn, 'pointerleave', () => gsap.to(st, { excite: 0, duration: 0.8 }));
    k.on(btn, 'click', () => {
      if (reducedMotion) return;
      gsap.timeline()
        .to(st, { boost: -0.3, duration: 0.12, ease: 'power2.out' })
        .to(st, { boost: 0.5, duration: 0.25, ease: 'power2.out' })
        .to(st, { boost: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
      gsap.fromTo(ring, { attr: { rx: 30, ry: 5 }, opacity: 0.7 }, { attr: { rx: 62, ry: 10 }, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power2.out' });
    });

    return () => (gsap.ticker.remove(tick), k.destroy());
  },
};
