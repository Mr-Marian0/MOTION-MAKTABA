/** Slide Date: months slide in from the side you move toward; the picked day pops into a stamp. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Sliding Calendar',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Direction-aware', 'Selection-dependent', 'Keyboard-controlled'],
  effect: ['Sliding', 'Bouncing', 'Expansion'],
  purpose: ['Orientation', 'Feedback', 'Continuity'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A month calendar. The next or previous month slides in from the side you moved toward while the old one slides out. Picking a day pops a stamp onto it. Arrow keys move day by day across months.',
  params: [
    { key: 'weekStart', label: 'Week starts', group: 'Layout', type: 'choice', options: ['Mon', 'Sun'], default: 'Mon' },
    { key: 'speed', label: 'Slide time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Stamp color'),
  ],
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const first = p.weekStart === 'Sun' ? 0 : 1;
    const head = [...DAYS.slice(first), ...DAYS.slice(0, first)];
    k.html(`
      <div class="sp sp-cal">
        <div class="sp-cal__card">
          <div class="sp-cal__top">
            <button type="button" class="sp-cal__nav" data-step="-1" aria-label="Previous month">←</button>
            <b class="sp-cal__title" aria-live="polite"></b>
            <button type="button" class="sp-cal__nav" data-step="1" aria-label="Next month">→</button>
          </div>
          <div class="sp-cal__head" aria-hidden="true">${head.map((d) => `<span>${d[0]}</span>`).join('')}</div>
          <div class="sp-cal__view"></div>
        </div>
      </div>`);
    const title = k.$('.sp-cal__title');
    const view = k.$('.sp-cal__view');
    const today = new Date();
    let month = new Date(today.getFullYear(), today.getMonth(), 1);
    let picked = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const same = (a, b) => a.toDateString() === b.toDateString();
    const t = () => (reducedMotion ? 0 : Number(p.speed));

    const build = () => {
      const g = document.createElement('div');
      g.className = 'sp-cal__grid';
      const lead = (month.getDay() - first + 7) % 7;
      const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      g.innerHTML = '<i></i>'.repeat(lead) + Array.from({ length: count }, (_, i) => {
        const day = new Date(month.getFullYear(), month.getMonth(), i + 1);
        const on = same(day, picked);
        return `<button type="button" class="sp-cal__day ${same(day, today) ? 'is-today' : ''}" data-d="${i + 1}" aria-pressed="${on}" tabindex="${on ? 0 : -1}" aria-label="${day.toDateString()}">${i + 1}</button>`;
      }).join('');
      title.textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      return g;
    };
    const go = (step, focusDay) => {
      const old = view.firstElementChild;
      month = new Date(month.getFullYear(), month.getMonth() + step, 1);
      const g = build();
      view.append(g);
      gsap.fromTo(g, { xPercent: step * 100, opacity: 0 }, { xPercent: 0, opacity: 1, duration: t(), ease: 'power3.out' });
      gsap.to(old, { xPercent: -step * 100, opacity: 0, duration: t(), ease: 'power3.out', onComplete: () => old.remove() });
      if (focusDay) g.querySelector(`[data-d="${focusDay}"]`)?.focus({ preventScroll: true });
    };
    view.replaceChildren(build());

    k.$$('.sp-cal__nav').forEach((b) => k.on(b, 'click', () => go(Number(b.dataset.step))));
    k.on(view, 'click', (e) => {
      const b = e.target.closest('.sp-cal__day');
      if (!b) return;
      picked = new Date(month.getFullYear(), month.getMonth(), Number(b.dataset.d));
      view.querySelectorAll('.sp-cal__day').forEach((x) => (x.setAttribute('aria-pressed', String(x === b)), (x.tabIndex = x === b ? 0 : -1)));
      gsap.fromTo(b, { scale: 0.6, rotation: -12 }, { scale: 1, rotation: 0, duration: reducedMotion ? 0 : 0.6, ease: 'elastic.out(1, 0.45)' });
    });
    k.on(view, 'keydown', (e) => {
      const b = e.target.closest('.sp-cal__day');
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[e.key];
      if (!b || !step) return;
      e.preventDefault();
      const day = new Date(month.getFullYear(), month.getMonth(), Number(b.dataset.d) + step);
      if (day.getMonth() !== month.getMonth()) return go(Math.sign(step), day.getDate());
      b.tabIndex = -1;
      const next = view.lastElementChild.querySelector(`[data-d="${day.getDate()}"]`);
      next.tabIndex = 0;
      next.focus({ preventScroll: true });
    });

    return () => k.destroy();
  },
};
