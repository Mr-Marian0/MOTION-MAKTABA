/** Melt Modal: closing the modal turns it to liquid: it loses its shape, runs down in drips and drains off the bottom of the page. Opening pours it back up and it sets. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Melt Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Reversible'],
  effect: ['Liquefaction', 'Melting', 'Liquid-morphing', 'Solidification'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Shape', 'Scale', 'Position'],
  description: 'A modal that liquefies when you close it. Its text fades, the box goes soft, drips run out of its bottom edge and merge, and the whole thing slumps and drains off the bottom of the page. Opening pours the liquid back up, and it sets into a firm modal before the text appears.',
  params: [
    { key: 'time', label: 'Melt time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Liquid'),
  ],
};

const DRIPS = [[12, 1.6, 0.8], [30, 1, 0.5], [46, 2, 1], [64, 1.2, 0.6], [82, 1.7, 0.9]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('mlm');
    k.html(scene('sp-mlm', `
      <svg class="sp-mlm__defs" aria-hidden="true"><filter id="${id}" x="-20%" y="-20%" width="140%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation="7" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" /></filter></svg>
      <div class="sp-mlm__modal" role="dialog" aria-label="Welcome">
        <div class="sp-mlm__goo"><i class="sp-mlm__body"></i>${DRIPS.map(([x, w]) => `<i class="sp-mlm__drip" style="left:${x}%;width:${w}em"></i>`).join('')}</div>
        <div class="sp-mlm__copy"><span class="sp-ov__kick">Welcome back</span><b class="sp-ov__title">3 new comments</b><span class="sp-ov__text">On your board “Ink & Water”.</span></div>
      </div>`, { label: 'Open', title: 'Home' }));
    const modal = k.$('.sp-mlm__modal');
    const goo = k.$('.sp-mlm__goo');
    const body = k.$('.sp-mlm__body');
    const drips = k.$$('.sp-mlm__drip');
    const copy = k.$('.sp-mlm__copy');
    gsap.set(modal, { autoAlpha: 0 });
    gsap.set(drips, { scaleY: 0 });
    gsap.set(body, { transformOrigin: '50% 100%' });
    const liquid = (on) => (goo.style.filter = on ? `url(#${id})` : '');

    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = p.time;
      liquid(true);
      return open
        ? gsap.timeline({ onComplete: () => liquid(false) })
            .set(modal, { autoAlpha: 1, y: 0 })
            .set(copy, { autoAlpha: 0 })
            .fromTo(body, { scaleY: 0.15, scaleX: 1.3, y: '6em' }, { scaleY: 1, scaleX: 1, y: 0, duration: t * 0.6, ease: 'back.out(1.4)' })
            .to(drips, { scaleY: 0, duration: t * 0.3 }, 0)
            .to(copy, { autoAlpha: 1, duration: 0.3 })
        : gsap.timeline()
            .to(copy, { autoAlpha: 0, duration: 0.2 })
            .to(drips, { scaleY: (i) => DRIPS[i][2], duration: t * 0.5, ease: 'power1.in', stagger: { each: 0.05, from: 'random' } })
            .to(body, { scaleY: 0.2, scaleX: 1.2, duration: t * 0.5, ease: 'power2.in' }, '-=0.2')
            .to(modal, { y: '12em', autoAlpha: 0, duration: t * 0.4, ease: 'power2.in' });
    }, ['Open', 'Close']);
    return () => k.destroy();
  },
};
