/** Retract Sheet: dismiss the bottom sheet and it is reeled back down like a tape measure: a fast whip into the bottom edge, a clack, and the page jolts. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Retract Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Self-collapsing', 'Elastic'],
  effect: ['Retracting', 'Recoiling', 'Extending'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Size', 'Position'],
  description: 'A share sheet on a spring reel. It pulls up smoothly from the bottom edge; dismiss it and it is reeled back in like a tape measure, whipping down fast with its rows blurring, then clacking home so the page jolts a little.',
  params: [
    { key: 'whip', label: 'Retract time', group: 'Motion', type: 'range', min: 0.12, max: 0.8, step: 0.04, unit: 's', default: 0.28, live: true },
    { key: 'kick', label: 'Jolt', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 0.6, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rts', `
      <div class="sp-ov__sheet sp-rts__sheet" role="dialog" aria-label="Share">
        <i class="sp-ov__grip"></i>
        ${['Copy link', 'Send by mail', 'Add to board'].map((t) => `<span class="sp-rts__row">${t}</span>`).join('')}
      </div>`, { label: 'Share', at: 'corner', title: 'Moodboard' }));
    const sheet = k.$('.sp-rts__sheet');
    const rows = k.$$('.sp-rts__row');
    const pageEl = k.$('.sp-ov__page');
    gsap.set(sheet, { yPercent: 105 });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline().set(rows, { skewY: 0, y: 0 }).to(sheet, { yPercent: 0, duration: 0.5, ease: 'power3.out' })
      : gsap.timeline()
          .to(rows, { y: '0.6em', skewY: -6, duration: p.whip, ease: 'power2.in', stagger: 0.02 }, 0)
          .to(sheet, { yPercent: 105, duration: p.whip, ease: 'power4.in' }, 0)
          // Clack: the page jolts as the reel hits its stop
          .to(pageEl, { keyframes: { y: [-4, 2, -1, 0].map((n) => n * p.kick) }, duration: 0.3, ease: 'none' }),
    ['Share', 'Dismiss']);
    return () => k.destroy();
  },
};
