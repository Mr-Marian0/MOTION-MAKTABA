/** Spring Date: each day is mounted on a spring: picking one presses it down and lets it go, so it springs up proud of the calendar, bobbing on its spring before it settles as the chosen day. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Spring Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Spring-driven', 'Elastic', 'Event-driven'],
  effect: ['Springing', 'Spring-motion', 'Underdamped-motion'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Scale', 'Position', 'Shadow'],
  description: 'An appointment calendar where every date sits on a spring. Press a day and it is pushed down into the page, then released: it springs up above the others with a growing shadow beneath, bounces a few times on its spring and comes to rest raised, as the picked date. The previous pick springs back down flat. Hovering a day compresses it slightly.',
  params: [
    { key: 'stiff', label: 'Springiness', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: '', default: 0.3, live: true },
    { key: 'pop', label: 'Pop', group: 'Motion', type: 'range', min: 1.05, max: 1.6, step: 0.05, unit: '×', default: 1.25, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-spr">
        <div class="sp-fi__cal sp-spr__cal">
          <b class="sp-fi__month">${MONTHS[10]} 2026 · choose a day</b>
          <div class="sp-spr__grid">${days(2026, 10, { picked: 12 })}</div>
        </div>
      </div>`);
    const cal = k.$('.sp-spr__cal');
    const grid = k.$('.sp-spr__grid');
    k.fit(cal);
    let at = grid.querySelector('[aria-pressed="true"]');
    const up = (b) => gsap.set(b, { scale: 1.12, y: '-0.15em', boxShadow: '0 0.35em 0.4em -0.15em rgb(17 17 17 / 0.4)' });
    up(at);
    dayKeys(k, grid, (b) => {
      if (b === at) return;
      const prev = at;
      at = b;
      pickDay(grid, b);
      if (reducedMotion) { gsap.set(prev, { scale: 1, y: 0, boxShadow: 'none' }); return up(b); }
      gsap.to(prev, { scale: 1, y: 0, boxShadow: '0 0 0 0 rgb(17 17 17 / 0)', duration: 0.6, ease: `elastic.out(1, ${p.stiff + 0.2})`, overwrite: true });
      gsap.killTweensOf(b);
      gsap.timeline()
        .to(b, { scale: 0.82, y: '0.1em', duration: 0.1, ease: 'power2.in' })
        // released: the elastic amplitude (Pop) sets how far past its rest it springs
        .to(b, { scale: 1.12, y: '-0.15em', boxShadow: '0 0.35em 0.4em -0.15em rgb(17 17 17 / 0.4)', duration: 1.2, ease: `elastic.out(${p.pop}, ${p.stiff})` });
    });
    // Extra: hover presses a day a little way down on its spring
    k.on(grid, 'pointerover', (e) => {
      const b = e.target.closest('.sp-fi__day');
      if (!b || b === at || reducedMotion) return;
      gsap.fromTo(b, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)', overwrite: true });
    });
    return () => k.destroy();
  },
};
