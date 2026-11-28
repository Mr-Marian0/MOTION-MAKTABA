/** Gift Popover: the daily-reward popover pops up wrapped like a present: the bow unties, the ribbon slips off, and the paper peels open to the reward inside. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Gift Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Unwrapping', 'Axial-rotation', 'Sliding', 'Bouncing'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Rotation', 'Position', 'Scale'],
  description: 'A daily-reward popover that arrives gift-wrapped. It bounces up from the button as a little parcel; the bow spins loose, the ribbon slides off, and the two halves of the wrapping paper peel open like doors to show the reward. Closing just pops it shut.',
  params: [
    { key: 'time', label: 'Unwrap time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ribbon'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-gft', `
      <div class="sp-ov__pop sp-gft__pop" role="dialog" aria-label="Daily reward">
        <div class="sp-ov__card sp-gft__reward"><span class="sp-ov__kick">Daily reward</span><b class="sp-ov__title">+50 ink drops</b><span class="sp-ov__text">Come back tomorrow for more.</span></div>
        <i class="sp-gft__paper sp-gft__paper--l"></i><i class="sp-gft__paper sp-gft__paper--r"></i>
        <i class="sp-gft__ribbon"></i><i class="sp-gft__bow"></i>
      </div>`, { label: 'Claim gift', scrim: false, at: 'bottom', title: 'Rewards' }));
    const pop = k.$('.sp-gft__pop');
    const [pl, pr] = k.$$('.sp-gft__paper');
    const ribbon = k.$('.sp-gft__ribbon');
    const bow = k.$('.sp-gft__bow');
    gsap.set(pop, { autoAlpha: 0, transformOrigin: '20% 100%' });
    gsap.set(pl, { transformOrigin: '0% 50%', transformPerspective: 600 });
    gsap.set(pr, { transformOrigin: '100% 50%', transformPerspective: 600 });

    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = p.time;
      return open
        ? gsap.timeline()
            .set([pl, pr, ribbon, bow], { rotationY: 0, rotation: 0, x: 0, scale: 1, autoAlpha: 1 })
            .fromTo(pop, { autoAlpha: 1, y: '2em', scale: 0.4 }, { y: 0, scale: 1, duration: 0.5, ease: 'back.out(2.5)' })
            .to(bow, { rotation: 300, scale: 0, duration: t * 0.3, ease: 'back.in(2)' })
            .to(ribbon, { x: '18em', duration: t * 0.3, ease: 'power2.in' }, '<0.1')
            .to(ribbon, { autoAlpha: 0, duration: t * 0.12 }, `<${t * 0.18}`)
            .to(pl, { rotationY: -160, autoAlpha: 0, duration: t * 0.5, ease: 'power2.inOut' })
            .to(pr, { rotationY: 160, autoAlpha: 0, duration: t * 0.5, ease: 'power2.inOut' }, '<0.08')
        : gsap.timeline().to(pop, { scale: 0.6, y: '1em', autoAlpha: 0, duration: 0.25, ease: 'back.in(2)' });
    }, ['Claim gift', 'Close']);
    return () => k.destroy();
  },
};
