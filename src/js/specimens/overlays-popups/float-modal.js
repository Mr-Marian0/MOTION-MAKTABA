/** Float Modal: the modal lifts off the page as if weightless and keeps floating while it is open, rising and turning a touch over its fading shadow. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Float Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Floating', 'Continuous', 'Reversible'],
  effect: ['Floating', 'Levitation', 'Bobbing'],
  purpose: ['Focus', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Rotation', 'Shadow'],
  description: 'A modal that seems to weigh nothing. It peels up off the page, its shadow spreading and fading beneath it, and while it stays open it keeps floating: rising and sinking a little, turning ever so slightly. Closing settles it back down flat before it disappears.',
  params: [
    { key: 'lift', label: 'Float height', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'period', label: 'Float cycle', group: 'Motion', type: 'range', min: 1.5, max: 6, step: 0.5, unit: 's', default: 3 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-flm', `
      <i class="sp-flm__shadow"></i>
      <div class="sp-ov__card sp-ov__modal sp-flm__modal" role="dialog" aria-label="Take a break"><span class="sp-ov__kick">Focus timer</span><b class="sp-ov__title">Take a breather</b><span class="sp-ov__text">You’ve been sketching for 50 minutes. Five minutes away from the page?</span></div>`, { label: 'Break', title: 'Studio' }));
    const modal = k.$('.sp-flm__modal');
    const shadow = k.$('.sp-flm__shadow');
    gsap.set([modal, shadow], { autoAlpha: 0 });
    let drift;
    toggle(k, gsap, { reducedMotion }, (open) => {
      drift?.kill();
      if (!open) return gsap.timeline().to(modal, { y: 0, rotation: 0, scale: 0.96, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }).to(shadow, { autoAlpha: 0, scale: 1, duration: 0.3 }, 0);
      return gsap.timeline({ onComplete: () => {
        if (reducedMotion) return;
        drift = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: p.period / 2 } })
          .to(modal, { y: `${-p.lift * 1.6}em`, rotation: 0.8 })
          .to(shadow, { scale: 0.85, autoAlpha: 0.35 }, '<');
      } })
        .fromTo(modal, { autoAlpha: 1, y: 0, scale: 0.96 }, { y: `${-p.lift}em`, scale: 1, duration: 0.7, ease: 'power2.out' })
        .fromTo(shadow, { autoAlpha: 0.8, scale: 1 }, { autoAlpha: 0.5, scale: 0.92, duration: 0.7 }, '<');
    }, ['Break', 'Back to work']);
    return () => { drift?.kill(); k.destroy(); };
  },
};
