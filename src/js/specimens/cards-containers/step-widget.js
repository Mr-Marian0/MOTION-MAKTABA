/** Step Widget: live numbers roll up, the ring sweeps toward the goal, today's bar grows. Pauses on hover. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Step Counter',
  element: 'Widget',
  trigger: ['Load', 'State change', 'Hover'],
  behavior: ['Time-driven', 'Auto-playing', 'Event-driven', 'Hover-dependent'],
  effect: ['Rolling', 'Sweeping', 'Rising', 'Pulsating'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Path', 'Size', 'Typography'],
  description: 'A daily step widget that updates itself. The number counts up, the ring sweeps toward the goal and today\'s bar grows. Reaching the goal makes the ring pulse. Hover to pause.',
  params: [
    { key: 'every', label: 'Update every', group: 'Behavior', type: 'range', min: 1, max: 6, step: 0.5, unit: 's', default: 2.5, live: true },
    { key: 'goal', label: 'Daily goal', group: 'Content', type: 'range', min: 4000, max: 12000, step: 500, default: 8000, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Ring color'),
  ],
};

const WEEK = [62, 80, 45, 90, 70, 55];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-steps">
        <article class="sp-steps__card">
          <svg class="sp-steps__ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42" pathLength="100"/></svg>
          <p class="sp-steps__num"><b aria-live="polite">0</b><small>steps today</small></p>
          <div class="sp-steps__week" aria-hidden="true">${[...WEEK, 0].map((h) => `<i style="height:${h}%"></i>`).join('')}</div>
        </article>
        <p class="sp-note">Live · hover to pause</p>
      </div>`);
    const arc = k.$$('circle')[1];
    const num = k.$('.sp-steps__num b');
    const today = k.$('.sp-steps__week i:last-child');
    const card = k.$('.sp-steps__card');
    const s = k.track({ v: 0 });
    let paused = false;
    gsap.set(arc, { strokeDasharray: 100, strokeDashoffset: 100 });

    const tick = () => {
      if (paused) return;
      const goal = Number(p.goal);
      const next = s.v >= goal ? 0 : Math.min(goal, s.v + gsap.utils.random(400, 1600, 10));
      const t = reducedMotion ? 0 : 1.1;
      const pct = next / goal;
      gsap.to(s, { v: next, duration: t, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(s.v).toLocaleString()) });
      gsap.to(arc, { strokeDashoffset: 100 - pct * 100, duration: t, ease: 'power2.out' });
      gsap.to(today, { height: `${pct * 100}%`, duration: t, ease: 'back.out(1.6)' });
      if (next === goal && !reducedMotion) gsap.fromTo(card, { scale: 1 }, { scale: 1.05, yoyo: true, repeat: 3, duration: 0.18, delay: t });
    };
    tick();
    let timer;
    const loop = () => (timer = setTimeout(() => (tick(), loop()), p.every * 1000));
    loop();
    k.on(card, 'pointerenter', () => (paused = true));
    k.on(card, 'pointerleave', () => (paused = false));

    return () => (clearTimeout(timer), k.destroy());
  },
};
