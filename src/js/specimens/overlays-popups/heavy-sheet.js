/** Heavy Sheet: a bottom sheet that obeys gravity: it is thrown up and slows to a stop at the top like a ball at the peak of its throw, and when closed it drops, speeding up, and lands with a thud. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Heavy Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Physics-driven'],
  effect: ['Gravity-motion', 'Decelerating', 'Accelerating', 'Impact-motion'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position'],
  description: 'A bottom sheet with real weight. Opening throws it up from the bottom edge: it rises fast and slows under gravity to a stop exactly at its open height, like a ball at the top of a throw. Closing lets go: it falls, speeding up the whole way, and lands with a thud that jolts the page.',
  params: [
    { key: 'g', label: 'Gravity', group: 'Motion', type: 'range', min: 20, max: 200, step: 10, unit: 'em/s²', default: 80, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-hvy', `
      <div class="sp-ov__sheet sp-hvy__sheet" role="dialog" aria-label="Order summary"><i class="sp-ov__grip"></i><span class="sp-ov__kick">Order</span>
        <span class="sp-hvy__row"><span>Field notebook</span><b>$18</b></span><span class="sp-hvy__row"><span>Ink, sepia</span><b>$12</b></span><span class="sp-hvy__row sp-hvy__total"><span>Total</span><b>$30</b></span></div>`, { label: 'Checkout', title: 'Cart' }));
    const sheet = k.$('.sp-hvy__sheet');
    const pageEl = k.$('.sp-ov__page');
    gsap.set(sheet, { yPercent: 102 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      // Time to travel the sheet's height under constant gravity: h = g t² / 2. power2 eases are exactly that curve.
      const em = parseFloat(getComputedStyle(sheet).fontSize);
      const t = Math.sqrt((2 * (sheet.offsetHeight / em)) / p.g);
      return open
        ? gsap.timeline().to(sheet, { yPercent: 0, duration: t, ease: 'power2.out' })
        : gsap.timeline()
            .to(sheet, { yPercent: 102, duration: t, ease: 'power2.in' })
            .to(pageEl, { keyframes: { y: [3, -1, 0] }, duration: 0.25, ease: 'none' });
    }, ['Checkout', 'Close']);
    return () => k.destroy();
  },
};
