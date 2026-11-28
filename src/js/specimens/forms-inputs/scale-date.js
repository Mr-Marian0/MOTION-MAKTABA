/** Scale Date: tap the month name and the day grid shrinks away into its own cell of a year view; pick another month and the picker scales back up out of that cell. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Scale Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Hierarchical', 'Position-aware', 'Reversible'],
  effect: ['Scaling', 'Contracting', 'Expansion'],
  purpose: ['Orientation', 'Navigation', 'Hierarchy'],
  properties: ['Scale', 'Opacity'],
  description: 'A date picker with a zoom. Tap the month title and the day grid shrinks down into the exact spot where that month sits in a 12-month grid, which grows in around it, so you can see where you are in the year. Choose another month and the view scales back up out of that month\'s cell into its days.',
  params: [
    { key: 'time', label: 'Zoom time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Pick'),
  ],
};

const YEAR = 2026;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    let month = 10, picked = 18;
    k.html(`
      <div class="sp sp-fi sp-scd">
        <div class="sp-fi__cal sp-scd__cal">
          <div class="sp-fi__bar"><button type="button" class="sp-scd__title" aria-expanded="false"><b class="sp-fi__month" aria-live="polite"></b> ▾</button><span class="sp-fi__hint">${YEAR}</span></div>
          <div class="sp-scd__view">
            <div class="sp-scd__days"></div>
            <div class="sp-scd__months">${MONTHS.map((m, i) => `<button type="button" class="sp-scd__m" data-m="${i}">${m.slice(0, 3)}</button>`).join('')}</div>
          </div>
        </div>
      </div>`);
    const cal = k.$('.sp-scd__cal');
    const title = k.$('.sp-scd__title');
    const label = k.$('.sp-fi__month');
    const dayView = k.$('.sp-scd__days');
    const monthView = k.$('.sp-scd__months');
    const cells = k.$$('.sp-scd__m');
    k.fit(cal);
    const render = () => {
      dayView.innerHTML = days(YEAR, month, { picked: month === 10 ? picked : 0 });
      label.textContent = MONTHS[month];
      cells.forEach((c, i) => c.setAttribute('aria-current', String(i === month)));
    };
    render();
    // Where month m's cell sits in the 4 × 3 year grid, as a transform origin for the day view
    const origin = (m) => `${((m % 4) + 0.5) * 25}% ${(Math.floor(m / 4) + 0.5) * 33.3}%`;
    // Both views keep their size (visibility, not display), so the card never jumps in height
    gsap.set(monthView, { autoAlpha: 0 });
    let tl;
    const zoom = (out) => {
      tl?.kill();
      title.setAttribute('aria-expanded', String(out));
      const t = p.time;
      tl = out
        ? gsap.timeline()
            .fromTo(dayView, { scale: 1, autoAlpha: 1, transformOrigin: origin(month) }, { scale: 0.22, autoAlpha: 0, duration: t, ease: 'power3.inOut' }, 0)
            .fromTo(monthView, { scale: 3.5, autoAlpha: 0, transformOrigin: origin(month) }, { scale: 1, autoAlpha: 1, duration: t, ease: 'power3.inOut' }, 0)
        : gsap.timeline()
            .fromTo(dayView, { scale: 0.22, autoAlpha: 0, transformOrigin: origin(month) }, { scale: 1, autoAlpha: 1, duration: t, ease: 'power3.inOut' }, 0)
            .fromTo(monthView, { scale: 1, autoAlpha: 1, transformOrigin: origin(month) }, { scale: 3.5, autoAlpha: 0, duration: t, ease: 'power3.inOut' }, 0);
      tl.progress(reducedMotion ? 1 : 0.001);
      (out ? cells[month] : dayView.querySelector('[tabindex="0"]'))?.focus();
    };
    k.on(title, 'click', () => zoom(title.getAttribute('aria-expanded') !== 'true'));
    cells.forEach((c, i) => k.on(c, 'click', () => { month = i; render(); zoom(false); }));
    dayKeys(k, dayView, (b, d) => {
      picked = d;
      pickDay(dayView, b);
      // Extra: the picked day gives a little scale pop
      if (!reducedMotion) gsap.fromTo(b, { scale: 0.6 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    });
    return () => k.destroy();
  },
};
