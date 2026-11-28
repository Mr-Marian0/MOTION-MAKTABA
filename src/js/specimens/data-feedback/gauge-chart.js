/** Gauge Chart: a speedometer-style gauge whose needle hangs like a pendulum: when the reading changes it swings past the new value and back, each swing shorter, until it settles. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Gauge Chart',
  element: 'Charts',
  trigger: ['In view', 'Click', 'Keyboard'],
  behavior: ['State-dependent', 'Physics-driven', 'Oscillating'],
  effect: ['Pendulum-motion', 'Damped-oscillation', 'Swinging'],
  purpose: ['Feedback', 'Progress', 'Hierarchy'],
  properties: ['Rotation', 'Color'],
  description: 'A server-load gauge with a weighted needle. When the reading changes (on view, or press "Refresh"), the needle swings toward the new value like a pendulum given a push: past it, back, past it again by less, until it comes to rest. The arc behind it is green, amber and red, and the number below counts to the new value.',
  params: [
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: '', default: 0.35, live: true },
    { key: 'damp', label: 'Damping', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.25, unit: '', default: 2.5, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Needle'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-gau">
        <div class="sp-df__card">
          <span class="sp-df__kick">Server load</span>
          <svg class="sp-gau__dial" viewBox="0 0 200 115" aria-hidden="true">
            <path d="M20 100 A80 80 0 0 1 100 20" class="sp-gau__ok"/><path d="M100 20 A80 80 0 0 1 156.6 43.4" class="sp-gau__mid"/><path d="M156.6 43.4 A80 80 0 0 1 180 100" class="sp-gau__hot"/>
            <g class="sp-gau__needle"><path d="M100 100 L100 30"/><circle cx="100" cy="100" r="7"/></g>
          </svg>
          <div class="sp-df__row"><b class="sp-df__big" role="meter" aria-label="Server load" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0%</b><button type="button" class="sp-df__btn sp-df__btn--ghost">Refresh</button></div>
        </div>
      </div>`);
    const needle = k.$('.sp-gau__needle');
    const out = k.$('.sp-df__big');
    gsap.set(needle, { svgOrigin: '100 100', rotation: -90 });
    let val = 0;
    const read = (v) => {
      const from = val;
      val = v;
      const ang = (x) => -90 + (x / 100) * 180;
      const c = { n: from };
      gsap.to(c, { n: v, duration: reducedMotion ? 0 : 1, ease: 'power2.out', onUpdate: () => { out.textContent = `${Math.round(c.n)}%`; } });
      out.setAttribute('aria-valuenow', v);
      if (reducedMotion) return gsap.set(needle, { rotation: ang(v) });
      // θ(t) = target − (target − start)·e^(−d·t)·cos(ωt): starts at the old value, swings past the new one, settles.
      // More Swing = less damping per swing.
      const a0 = ang(from), a1 = ang(v);
      const d = p.damp * (1 - p.swing * 0.8);
      const kf = Array.from({ length: 30 }, (_, i) => { const t = (i + 1) * 0.07; return { rotation: a1 - (a1 - a0) * Math.exp(-d * t) * Math.cos(5.5 * t), duration: 0.07, ease: 'none' }; });
      gsap.to(needle, { keyframes: kf, overwrite: true, onComplete: () => gsap.set(needle, { rotation: a1 }) });
    };
    k.inView(k.$('.sp-gau__dial'), () => !val && read(62), 0.5);
    k.on(k.$('.sp-df__btn'), 'click', () => read(10 + Math.round(Math.random() * 85)));
    return () => k.destroy();
  },
};
