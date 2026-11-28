/** Tag Date: a wall calendar with a ribbon bookmark and a hanging price tag: flip to another month and the calendar swings sideways, and the bookmark and tag swing after it as secondary motion, settling a beat later. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, monthBar, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Tag Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Direction-aware', 'Hierarchical', 'Physics-driven'],
  effect: ['Secondary-motion', 'Pendulum-motion', 'Swaying'],
  purpose: ['Continuity', 'Delight', 'Orientation'],
  properties: ['Rotation', 'Position'],
  description: 'A hanging wall calendar for booking a stay. Move to the next or previous month and the calendar body sways a little that way and back (the primary motion), while the ribbon bookmark and a "from £68" tag hanging off its edge are flung the other way and swing on as pendulums, settling only after the calendar has. Picking a day gives the tag a small knock too.',
  params: [
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 5, max: 40, step: 1, unit: '°', default: 22, live: true },
    { key: 'damp', label: 'Settle', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: '', default: 0.2, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ribbon'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    let month = 10;
    k.html(`
      <div class="sp sp-fi sp-tgd">
        <div class="sp-tgd__hang">
          <i class="sp-tgd__nail" aria-hidden="true"></i>
          <div class="sp-fi__cal sp-tgd__cal">
            ${monthBar(2026, month)}
            <div class="sp-tgd__grid"></div>
            <i class="sp-tgd__ribbon" aria-hidden="true"></i>
            <span class="sp-tgd__tag" aria-hidden="true"><i></i><b>from £68</b></span>
          </div>
        </div>
      </div>`);
    const hang = k.$('.sp-tgd__hang');
    const cal = k.$('.sp-tgd__cal');
    const grid = k.$('.sp-tgd__grid');
    const label = k.$('.sp-fi__month');
    const ribbon = k.$('.sp-tgd__ribbon');
    const tag = k.$('.sp-tgd__tag');
    k.fit(hang);
    gsap.set(cal, { transformOrigin: '50% -1.2em' });
    gsap.set(ribbon, { transformOrigin: '50% 0%' });
    gsap.set(tag, { transformOrigin: '0% 0%' });
    const render = () => {
      grid.innerHTML = days(2026, month, { picked: month === 10 ? 21 : 0 });
      label.textContent = `${MONTHS[month]} 2026`;
    };
    render();
    // Secondary motion: the hangers are thrown opposite the body's swing, then ring down slower than it does
    const knock = (el, amt) => gsap.fromTo(el, { rotation: amt }, { rotation: 0, duration: 2.4, ease: `elastic.out(1, ${p.damp})`, overwrite: true });
    k.$$('.sp-fi__nav').forEach((b) => k.on(b, 'click', () => {
      const dir = Number(b.dataset.step);
      month = Math.min(11, Math.max(0, month + dir));
      render();
      if (reducedMotion) return;
      gsap.timeline()
        .to(cal, { rotation: dir * 3, duration: 0.18, ease: 'power2.out' })
        .to(cal, { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      gsap.delayedCall(0.12, () => { knock(ribbon, -dir * p.swing); knock(tag, -dir * p.swing * 1.2); });
    }));
    dayKeys(k, grid, (b) => { pickDay(grid, b); if (!reducedMotion) knock(tag, p.swing * 0.4); });
    return () => k.destroy();
  },
};
