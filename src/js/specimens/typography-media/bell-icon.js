/** Bell Icon: a notification bell that rings like a real one: when something arrives it swings hard one way, then back, each swing smaller, the clapper lagging behind, until it hangs still; the badge counts up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Bell Icon',
  element: 'Icon',
  trigger: ['Click', 'Keyboard', 'Idle'],
  behavior: ['Event-driven', 'Physics-driven', 'Oscillating'],
  effect: ['Damped-oscillation', 'Swinging', 'Pendulum-motion'],
  purpose: ['Feedback', 'Focus'],
  properties: ['Rotation'],
  description: 'A notifications bell that swings properly. When a notification comes in (press "Ping", or wait for one every few seconds) the bell swings out hard to one side and back, each swing a little smaller than the last as it loses energy, and the clapper inside swings a beat behind the bell. The count badge pops up by one. Opening the bell clears the count.',
  params: [
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 8, max: 45, step: 1, unit: '°', default: 28, live: true },
    { key: 'damp', label: 'Damping', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.1, unit: '', default: 1.6, live: true },
    { key: 'auto', label: 'Ping every', group: 'Behavior', type: 'range', min: 0, max: 10, step: 1, unit: 's', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Badge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-bel">
        <button type="button" class="sp-tm__icon sp-bel__tile" aria-label="Notifications, 0 new">
          <svg viewBox="0 0 24 24" aria-hidden="true"><g class="sp-bel__bell"><path d="M6 16 C6 10 7 6 12 6 C17 6 18 10 18 16 L19.5 17.5 H4.5 Z"/><path d="M12 4 V6"/><circle class="sp-bel__clap" cx="12" cy="19.5" r="1.6"/></g></svg>
          <b class="sp-bel__badge" aria-hidden="true">0</b>
        </button>
        <button type="button" class="sp-tm__btn sp-tm__btn--ghost sp-bel__ping">Ping</button>
      </div>`);
    const tile = k.$('.sp-bel__tile');
    const bell = k.$('.sp-bel__bell');
    const clap = k.$('.sp-bel__clap');
    const badge = k.$('.sp-bel__badge');
    gsap.set(bell, { svgOrigin: '12 4' });
    gsap.set(clap, { svgOrigin: '12 8' });
    gsap.set(badge, { scale: 0 });
    let n = 0, timer;
    // θ(t) = A·e^(−damp·t)·sin(ωt): sampled into keyframes so GSAP plays it
    const ring = () => {
      if (reducedMotion) return;
      const kf = (lag, amp) => Array.from({ length: 24 }, (_, i) => { const t = (i + 1) * 0.06; return { rotation: amp * Math.exp(-p.damp * t) * Math.sin(14 * (t - lag)), duration: 0.06, ease: 'none' }; });
      gsap.to(bell, { keyframes: kf(0, p.swing), overwrite: true, onComplete: () => gsap.set(bell, { rotation: 0 }) });
      gsap.to(clap, { keyframes: kf(0.05, -p.swing * 0.6), overwrite: true, onComplete: () => gsap.set(clap, { rotation: 0 }) });
    };
    const ping = () => {
      n += 1;
      badge.textContent = n;
      tile.setAttribute('aria-label', `Notifications, ${n} new`);
      gsap.fromTo(badge, { scale: n === 1 ? 0 : 1.4 }, { scale: 1, duration: reducedMotion ? 0 : 0.4, ease: 'back.out(3)' });
      ring();
      schedule();
    };
    const schedule = () => { timer?.kill(); if (p.auto) timer = gsap.delayedCall(p.auto, ping); };
    k.on(k.$('.sp-bel__ping'), 'click', ping);
    k.on(tile, 'click', () => { n = 0; tile.setAttribute('aria-label', 'Notifications, 0 new'); gsap.to(badge, { scale: 0, duration: 0.2 }); schedule(); });
    schedule();
    return () => { timer?.kill(); k.destroy(); };
  },
};
