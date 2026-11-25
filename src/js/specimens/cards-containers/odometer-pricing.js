/** Odometer Pricing: switching Monthly / Yearly rolls every price digit like an odometer. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Odometer Pricing',
  element: 'Pricing card',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Toggle-dependent', 'Synchronized', 'Staggered', 'Hover-dependent'],
  effect: ['Rolling', 'Sliding', 'Rising', 'Floating'],
  purpose: ['Feedback', 'Hierarchy', 'Focus'],
  properties: ['Position', 'Scale', 'Shadow'],
  description: 'Two price cards with a Monthly / Yearly switch. Every digit rolls to its new value like an odometer, staggered. The featured plan floats a little higher, and hovered cards lift.',
  params: [
    { key: 'prices', label: 'Monthly prices', group: 'Content', type: 'text', default: '9, 24' },
    { key: 'off', label: 'Yearly discount', group: 'Content', type: 'range', min: 0, max: 50, step: 5, unit: '%', default: 20, live: true },
    { key: 'speed', label: 'Roll time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.8, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Featured color'),
  ],
};

const DIGITS = 3;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const prices = labelsOf(p.prices, ['9', '24']).slice(0, 2).map((v) => Math.min(999, Math.abs(parseInt(v, 10) || 0)));
    const col = `<span class="sp-odo__col">${Array.from({ length: 10 }, (_, d) => `<span>${d}</span>`).join('')}</span>`;
    k.html(`
      <div class="sp sp-odo">
        <div class="sp-odo__switch" role="radiogroup" aria-label="Billing">
          <i class="sp-odo__pill"></i>
          <button type="button" role="radio" aria-checked="true">Monthly</button>
          <button type="button" role="radio" aria-checked="false">Yearly</button>
        </div>
        <div class="sp-odo__cards">
          ${prices.map((_, i) => `
            <article class="sp-odo__card ${i ? 'is-featured' : ''}">
              <p class="sp-odo__plan">${i ? 'Studio' : 'Sketch'}</p>
              <p class="sp-odo__price" aria-live="polite"><span class="sp-odo__sr"></span><span aria-hidden="true">$${col.repeat(DIGITS)}</span><small>/mo</small></p>
              <i class="sp-line" style="--w:80%"></i><i class="sp-line" style="--w:60%"></i>
            </article>`).join('')}
        </div>
      </div>`);
    const cards = k.$$('.sp-odo__card');
    const btns = k.$$('.sp-odo__switch button');
    const pill = k.$('.sp-odo__pill');
    let yearly = false;

    const show = (instant) => {
      const t = reducedMotion || instant ? 0 : Number(p.speed);
      cards.forEach((card, c) => {
        const v = Math.round(yearly ? prices[c] * (1 - p.off / 100) : prices[c]);
        const digits = String(v).padStart(DIGITS, ' ').split('');
        card.querySelector('.sp-odo__sr').textContent = `$${v} per month`;
        card.querySelectorAll('.sp-odo__col').forEach((el, i) => {
          const d = digits[i];
          gsap.to(el, { yPercent: d === ' ' ? 0 : -Number(d) * 10, opacity: d === ' ' ? 0 : 1, width: d === ' ' ? 0 : '0.62em', duration: t, delay: t ? (c * DIGITS + i) * 0.05 : 0, ease: 'power3.inOut' });
        });
      });
      btns.forEach((b, i) => b.setAttribute('aria-checked', String(i === Number(yearly))));
      gsap.to(pill, { xPercent: yearly ? 100 : 0, duration: reducedMotion ? 0 : 0.4, ease: 'back.out(1.6)' });
    };
    show(true);

    btns.forEach((b, i) => k.on(b, 'click', () => {
      if (yearly === Boolean(i)) return;
      yearly = Boolean(i);
      show();
    }));
    cards.forEach((card) => {
      k.on(card, 'pointerenter', () => gsap.to(card, { y: '-=8', duration: 0.3, ease: 'power2.out' }));
      k.on(card, 'pointerleave', () => gsap.to(card, { y: card.classList.contains('is-featured') ? -12 : 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }));
    });
    gsap.set(k.$('.is-featured'), { y: -12 });

    return { destroy: () => k.destroy(), update: () => show() };
  },
};
