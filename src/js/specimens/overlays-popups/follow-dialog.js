/** Follow Dialog: the dialog swoops in and stops, but its parts don't stop at once: the bookmark ribbon, the text and the buttons carry on a little and settle after it, one after another. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Follow Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Hierarchical', 'Elastic'],
  effect: ['Follow-through', 'Overshoot-motion', 'Swinging', 'Sliding'],
  purpose: ['Continuity', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Rotation'],
  description: 'A dialog that shows follow-through. It sweeps in from the left and stops in the middle, but its loose parts keep going for a moment: the title, the text and the buttons each slide on past and settle back one after another, and the bookmark ribbon hanging from the top swings before it hangs still.',
  params: [
    { key: 'carry', label: 'Carry-on', group: 'Motion', type: 'range', min: 0.3, max: 3, step: 0.1, unit: 'em', default: 1.2, live: true },
    { key: 'lag', label: 'Lag between parts', group: 'Motion', type: 'range', min: 0.02, max: 0.2, step: 0.01, unit: 's', default: 0.07, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ribbon'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-fol', `
      <div class="sp-ov__card sp-ov__modal sp-fol__dialog" role="dialog" aria-label="Chapter 2">
        <i class="sp-fol__ribbon"></i>
        <span class="sp-ov__kick sp-fol__part">Chapter 2</span><b class="sp-ov__title sp-fol__part">The Fold</b>
        <span class="sp-ov__text sp-fol__part">Pick up where you left off, page 48.</span>
        <span class="sp-ov__actions sp-fol__part"><span class="sp-ov__btn sp-ov__btn--ghost">Later</span><span class="sp-ov__btn">Read</span></span>
      </div>`, { label: 'Continue', title: 'Library' }));
    const dialog = k.$('.sp-fol__dialog');
    const parts = k.$$('.sp-fol__part');
    const ribbon = k.$('.sp-fol__ribbon');
    gsap.set(dialog, { autoAlpha: 0 });
    gsap.set(ribbon, { transformOrigin: '50% 0%' });
    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = 0.5;
      return open
        ? gsap.timeline()
            .fromTo(dialog, { autoAlpha: 1, x: '-22em' }, { x: 0, duration: t, ease: 'power3.out' })
            // The parts lag behind on the way in, then carry on past and settle (follow-through)
            .fromTo(parts, { x: '-3em' }, { keyframes: { x: [`${p.carry}em`, '0em'], easeEach: 'power2.out' }, duration: t + 0.4, stagger: p.lag }, 0)
            .fromTo(ribbon, { rotation: 35 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.25)' }, t * 0.7)
        : gsap.timeline().to(dialog, { x: '22em', autoAlpha: 0, duration: 0.35, ease: 'power2.in' }).to(parts, { x: '-1em', duration: 0.3, stagger: p.lag }, 0);
    }, ['Continue', 'Close']);
    return () => k.destroy();
  },
};
