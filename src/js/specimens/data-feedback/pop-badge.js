/** Pop Badge: the count rolls to its new number and the badge pops; past the max it reads "99+"; a "New" tag shimmers once. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Counting Badge',
  element: 'Badges',
  trigger: ['Click', 'State change'],
  behavior: ['State-dependent', 'Event-driven', 'Reactive'],
  effect: ['Rolling', 'Bouncing', 'Shimmering', 'Expansion'],
  purpose: ['Feedback', 'Focus'],
  properties: ['Scale', 'Position', 'Size'],
  description: 'An inbox with a count badge. New mail rolls the number up like a counter and the badge pops; past the maximum it shows "99+". The badge appears with a spring from zero and vanishes when you clear it. A "New" tag shimmers once.',
  params: [
    { key: 'max', label: 'Max shown', group: 'Content', type: 'range', min: 9, max: 99, step: 1, default: 9, live: true },
    { key: 'add', label: 'Per click', group: 'Content', type: 'range', min: 1, max: 5, step: 1, default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Badge color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-badge">
        <div class="sp-badge__inbox">
          <span class="sp-badge__icon" aria-hidden="true">✉</span>
          <b class="sp-badge__count" aria-live="polite"><span class="sp-badge__num">0</span></b>
        </div>
        <div class="sp-badge__btns">
          <button type="button" class="sp-badge__btn" data-add>+ New mail</button>
          <button type="button" class="sp-badge__btn" data-clear>Clear</button>
        </div>
        <span class="sp-badge__new">New</span>
      </div>`);
    const badge = k.$('.sp-badge__count');
    const num = k.$('.sp-badge__num');
    const d = (t) => (reducedMotion ? 0 : t);
    let n = 0;
    gsap.set(badge, { scale: 0 });

    const show = (old) => {
      const label = n > p.max ? `${p.max}+` : String(n);
      badge.setAttribute('aria-label', `${n} unread`);
      if (!old && n) gsap.fromTo(badge, { scale: 0 }, { scale: 1, duration: d(0.6), ease: 'elastic.out(1, 0.45)' });
      else if (!n) return gsap.to(badge, { scale: 0, duration: d(0.3), ease: 'back.in(2)' });
      else gsap.fromTo(badge, { scale: 1.35 }, { scale: 1, duration: d(0.5), ease: 'elastic.out(1, 0.4)' });
      // Roll: old number slides up and out, new one comes up from below.
      gsap.timeline()
        .to(num, { yPercent: -100, opacity: 0, duration: d(0.15), ease: 'power2.in' })
        .add(() => (num.textContent = label))
        .fromTo(num, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: d(0.25), ease: 'back.out(2)' });
    };
    k.on(k.$('[data-add]'), 'click', () => {
      const old = n;
      n += Number(p.add);
      show(old);
      if (!reducedMotion) gsap.fromTo(k.$('.sp-badge__icon'), { rotation: 0 }, { keyframes: { rotation: [-14, 10, -5, 0] }, duration: 0.5 });
    });
    k.on(k.$('[data-clear]'), 'click', () => n && ((n = 0), show(1)));
    k.inView(k.$('.sp-badge__new'), () => k.$('.sp-badge__new').classList.add('is-shine'));

    return { destroy: () => k.destroy(), update: () => n && show(n) };
  },
};
