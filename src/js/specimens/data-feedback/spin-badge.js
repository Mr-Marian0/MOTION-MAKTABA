/** Spin Badge: a points badge whose number is a slot-machine reel: when points are added the digits spin fast and decelerate, each digit stopping a beat after the one to its left, landing on the new total with a click. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Spin Badge',
  element: 'Badges',
  trigger: ['Click', 'Keyboard', 'State change'],
  behavior: ['State-dependent', 'Sequential', 'Momentum-driven'],
  effect: ['Decelerating', 'Rolling', 'Snapping'],
  purpose: ['Feedback', 'Delight', 'Progress'],
  properties: ['Position', 'Typography'],
  description: 'A loyalty-points badge with digits on spinning reels. Earn points and every digit reel spins at speed and then decelerates, coasting slower and slower until it clicks onto its new number; the reels stop one after another from left to right, the last one taking longest, and the badge gives a small bump when the final digit lands.',
  params: [
    { key: 'time', label: 'Spin time', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'turns', label: 'Extra spins', group: 'Motion', type: 'range', min: 0, max: 5, step: 1, unit: '', default: 2, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Badge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const D = 4;
    let total = 1280;
    const strip = Array.from({ length: 10 * 7 }, (_, i) => `<span>${i % 10}</span>`).join('');
    k.html(`
      <div class="sp sp-df sp-spb">
        <div class="sp-spb__badge" role="status" aria-live="polite" aria-label="${total} points"><span class="sp-spb__reels" aria-hidden="true">${Array.from({ length: D }, () => `<span class="sp-spb__reel"><span class="sp-spb__strip">${strip}</span></span>`).join('')}</span><small>pts</small></div>
        <div class="sp-df__row"><button type="button" class="sp-df__btn" data-add="25">+25</button><button type="button" class="sp-df__btn" data-add="480">+480</button></div>
      </div>`);
    const reels = k.$('.sp-spb__reels');
    const strips = k.$$('.sp-spb__strip');
    const badge = k.$('.sp-spb__badge');
    let DH = 20;
    const digits = (v) => String(v).padStart(D, '0').slice(-D).split('').map(Number);
    // The strip is 0–9 seven times. A reel rests on row d (first cycle). To change from digit a to b it spins
    // from row a down to row 10·(turns+1) + b, which shows the same digit b, then jumps back to row b unseen.
    const cur = strips.map(() => 0);
    const show = (now) => digits(total).forEach((d, i) => {
      const a = cur[i];
      cur[i] = d;
      if (now || reducedMotion || a === d) return gsap.set(strips[i], { y: -d * DH });
      const target = 10 * (Math.round(p.turns) + 1) + d; // ≤ 69 for up to 5 extra spins
      gsap.fromTo(strips[i], { y: -a * DH }, { y: -target * DH, duration: p.time * (0.6 + i * 0.15), ease: 'power3.out', overwrite: true, onComplete: () => gsap.set(strips[i], { y: -d * DH }) });
    });
    k.resize(reels, () => { DH = strips[0].firstElementChild.offsetHeight; show(true); });
    k.$$('[data-add]').forEach((b) => k.on(b, 'click', () => {
      total = Math.min(9999, total + Number(b.dataset.add));
      badge.setAttribute('aria-label', `${total} points`);
      show(false);
      if (!reducedMotion) gsap.fromTo(badge, { scale: 1 }, { keyframes: { scale: [1.12, 1] }, duration: 0.3, delay: p.time * (0.6 + (D - 1) * 0.15) - 0.1 });
    }));
    return () => k.destroy();
  },
};
