/** Launch Modal: the release-notes modal launches from the bottom of the page like a rocket off a pad, trailing a smoke column, and coasts to a stop in the middle. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Launch Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Momentum-driven'],
  effect: ['Launching', 'Decelerating', 'Particle-trail', 'Squashing'],
  purpose: ['Delight', 'Branding', 'Focus'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A release-notes modal with a launch sequence. It crouches on a pad at the bottom of the page, squashes as it ignites, then blasts up with a column of smoke trailing below and coasts to a stop in the middle as the smoke clears. Closing drops it back down.',
  params: [
    { key: 'time', label: 'Climb time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-lcm', `
      <i class="sp-lcm__smoke"></i>
      <div class="sp-ov__card sp-ov__modal sp-lcm__modal" role="dialog" aria-label="Version 3.0"><span class="sp-ov__kick">Lift-off</span><b class="sp-ov__title">Version 3.0 is here</b><span class="sp-ov__text">Faster boards, folded booklets and a brand new sketch tool.</span></div>`, { label: 'What’s new', title: 'Changelog' }));
    const modal = k.$('.sp-lcm__modal');
    const smoke = k.$('.sp-lcm__smoke');
    gsap.set([modal, smoke], { autoAlpha: 0 });
    gsap.set(smoke, { scaleY: 0, transformOrigin: '50% 100%' });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(modal, { autoAlpha: 1, y: '16em', scaleX: 1.1, scaleY: 0.8 }, { scaleX: 1, scaleY: 1, duration: 0.25, ease: 'power2.out' })
          // Lift-off: fast up, coasting to a stop as the smoke column rises behind it
          .to(modal, { y: 0, duration: p.time, ease: 'power4.out' })
          .fromTo(smoke, { autoAlpha: 0.9, scaleY: 0 }, { scaleY: 1, duration: p.time * 0.6, ease: 'power2.out' }, '<')
          .to(smoke, { autoAlpha: 0, scaleX: 2.5, duration: p.time, ease: 'power1.out' }, '<0.3')
      : gsap.timeline().to(modal, { y: '16em', autoAlpha: 0, duration: 0.45, ease: 'power3.in' }),
    ['What’s new', 'Close']);
    return () => k.destroy();
  },
};
