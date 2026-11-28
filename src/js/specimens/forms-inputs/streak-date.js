/** Streak Date: swipe or step through months fast and the calendar whips sideways, smearing into velocity streaks that stretch with the speed and snap away as it stops. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, monthBar, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Streak Date',
  element: 'Date picker',
  trigger: ['Click', 'Swipe', 'Drag', 'Keyboard'],
  behavior: ['Velocity-aware', 'Direction-aware', 'Gesture-driven'],
  effect: ['Velocity-streak', 'Motion-smear', 'Sliding'],
  purpose: ['Navigation', 'Continuity', 'Feedback'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A month picker that shows its speed. Press the arrows or swipe the grid and the days whip out sideways and the next month whips in; while moving, the grid stretches along its direction of travel and speed streaks flash across it, longer and brighter the faster it goes, vanishing the instant it settles. Quick repeated taps make it streak harder.',
  params: [
    { key: 'time', label: 'Slide time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    { key: 'smear', label: 'Smear', group: 'Motion', type: 'range', min: 0, max: 0.5, step: 0.05, unit: '', default: 0.25, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Streaks'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    let month = 10;
    k.html(`
      <div class="sp sp-fi sp-stk">
        <div class="sp-fi__cal sp-stk__cal">
          ${monthBar(2026, month)}
          <div class="sp-stk__view"><div class="sp-stk__grid"></div><span class="sp-stk__lines" aria-hidden="true">${'<i></i>'.repeat(7)}</span></div>
        </div>
      </div>`);
    const cal = k.$('.sp-stk__cal');
    const view = k.$('.sp-stk__view');
    const grid = k.$('.sp-stk__grid');
    const label = k.$('.sp-fi__month');
    const lines = k.$$('.sp-stk__lines i');
    k.fit(cal);
    const render = () => { grid.innerHTML = days(2026, month, { picked: month === 10 ? 9 : 0 }); label.textContent = `${MONTHS[month]} 2026`; };
    render();
    gsap.set(lines, { scaleX: 0, transformOrigin: '50% 50%' });
    let last = 0, heat = 0;
    const step = (dir) => {
      month = (month + dir + 12) % 12;
      if (reducedMotion) return render();
      // taps in quick succession heat up the streaks
      const now = performance.now();
      heat = Math.min(1, (now - last < 400 ? heat + 0.35 : 0.4));
      last = now;
      const t = p.time;
      const pull = 1 + p.smear * (1 + heat);
      gsap.killTweensOf([grid, ...lines]);
      gsap.timeline()
        .to(grid, { xPercent: -dir * 110, scaleX: pull, transformOrigin: dir > 0 ? '100% 50%' : '0% 50%', opacity: 0.4, duration: t * 0.45, ease: 'power3.in' })
        .call(render)
        .fromTo(grid, { xPercent: dir * 110, scaleX: pull, opacity: 0.4 }, { xPercent: 0, scaleX: 1, opacity: 1, duration: t * 0.55, ease: 'power3.out' })
        .fromTo(lines, { scaleX: 0, autoAlpha: 0.9 * (0.5 + heat / 2), x: () => `${(Math.random() - 0.5) * 6}em` }, { scaleX: () => (1 + heat * 2) * (0.6 + Math.random() * 0.6), duration: t * 0.35, ease: 'power2.out', stagger: 0.015 }, 0)
        .to(lines, { scaleX: 0, autoAlpha: 0, duration: t * 0.35, ease: 'power2.in' }, t * 0.6);
    };
    k.$$('.sp-fi__nav').forEach((b) => k.on(b, 'click', () => step(Number(b.dataset.step))));
    // Swipe: a horizontal drag of 30px steps the way it went
    let x0 = null;
    k.on(view, 'pointerdown', (e) => (x0 = e.clientX));
    k.on(view, 'pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 30) step(e.clientX < x0 ? 1 : -1); x0 = null; });
    dayKeys(k, grid, (b) => pickDay(grid, b));
    return () => k.destroy();
  },
};
