/** Leap Search: suggested filters wait under the bar; click one and it takes a running leap up into the search bar, stretching in the air and landing as a filter token. Click a token and it leaps back down. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

const FILTERS = ['Vegan', 'Under 30 min', 'One pot', 'Spicy', 'No oven'];

export const meta = {
  title: 'Leap Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Position-aware', 'Reversible'],
  effect: ['Leaping', 'Stretching', 'Parabolic-motion'],
  purpose: ['Feedback', 'Continuity', 'Affordance'],
  properties: ['Position', 'Scale', 'Layout'],
  description: 'A recipe search with suggested filters lined up below it. Click one (or press Enter on it) and it crouches, then leaps up in a long arc into the bar, stretching out along its flight and squashing as it lands among the active filters. Click an active filter and it leaps back down to its place in the line.',
  params: [
    { key: 'height', label: 'Leap height', group: 'Motion', type: 'range', min: 0.5, max: 5, step: 0.25, unit: 'em', default: 2, live: true },
    { key: 'time', label: 'Air time', group: 'Motion', type: 'range', min: 0.25, max: 1, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Filter'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lep');
    k.html(`
      <div class="sp sp-fi sp-lep">
        <div class="sp-fi__wrap">
          <div class="sp-fi__box sp-lep__bar" role="search">
            <span class="sp-lep__on"></span>
            <input class="sp-fi__input" id="${id}" type="search" placeholder="Search recipes" aria-label="Search recipes" />
          </div>
          <div class="sp-lep__off" aria-label="Suggested filters">${FILTERS.map((f) => `<button type="button" class="sp-fi__chip sp-lep__f" aria-pressed="false">${esc(f)}</button>`).join('')}</div>
        </div>
      </div>`);
    const on = k.$('.sp-lep__on');
    const off = k.$('.sp-lep__off');
    const wrap = k.$('.sp-fi__wrap');
    const em = () => parseFloat(getComputedStyle(wrap).fontSize) || 14;
    // FLIP: note where the chip is, move it to its new home, then fly it from old to new along an arc
    const leap = (chip, home, before = null) => {
      const a = chip.getBoundingClientRect();
      home.insertBefore(chip, before);
      chip.setAttribute('aria-pressed', String(home === on));
      chip.focus();
      if (reducedMotion) return;
      const b = chip.getBoundingClientRect();
      const [dx, dy] = [a.left - b.left, a.top - b.top];
      const H = em() * p.height;
      const s = { u: 0 };
      gsap.timeline()
        .set(chip, { x: dx, y: dy })
        .to(chip, { scaleY: 0.7, scaleX: 1.15, duration: 0.1, transformOrigin: '50% 100%' })
        .to(s, { u: 1, duration: p.time, ease: 'none', onUpdate: () => {
          const u = s.u;
          gsap.set(chip, { x: dx * (1 - u), y: dy * (1 - u) - 4 * H * u * (1 - u), scaleX: 1 + 0.35 * Math.sin(u * Math.PI), scaleY: 1 - 0.15 * Math.sin(u * Math.PI), rotation: (dx < 0 ? 1 : -1) * 12 * Math.sin(u * Math.PI) });
        } })
        .to(chip, { scaleX: 1.2, scaleY: 0.75, duration: 0.07 })
        .to(chip, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' });
    };
    k.on(off, 'click', (e) => { const c = e.target.closest('.sp-lep__f'); if (c) leap(c, on); });
    k.on(on, 'click', (e) => {
      const c = e.target.closest('.sp-lep__f');
      if (!c) return;
      // back to its original slot in the line: before the first suggestion that comes after it in FILTERS
      const i = FILTERS.indexOf(c.textContent);
      leap(c, off, [...off.children].find((x) => FILTERS.indexOf(x.textContent) > i) || null);
    });
    return () => k.destroy();
  },
};
