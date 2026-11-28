/** Rocket Popover: the "what's new" popover is propelled up out of its button on a puff of exhaust, overshoots, and settles in place. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Rocket Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Physics-driven', 'Reversible'],
  effect: ['Propelling', 'Accelerating', 'Particle-trail', 'Overshoot-motion'],
  purpose: ['Delight', 'Hierarchy', 'Feedback'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A "what\'s new" popover with a bit of thrust. Click and it rumbles in the button, then is propelled straight up on a puff of exhaust, overshoots its spot and drops back to settle. Closing pulls it back down into the button.',
  params: [
    { key: 'thrust', label: 'Thrust', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.25, unit: 'em', default: 1.5, live: true },
    { key: 'puffs', label: 'Puffs', group: 'Shape', type: 'range', min: 0, max: 10, step: 1, unit: '', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rkp', `
      <div class="sp-rkp__puffs" aria-hidden="true"></div>
      <div class="sp-ov__card sp-ov__pop sp-rkp__pop" role="dialog" aria-label="What’s new"><span class="sp-ov__kick">New in 2.4</span><b class="sp-ov__title">Fold boards into booklets</b><span class="sp-ov__text">Share a whole board as one link.</span></div>`, { label: 'What’s new', scrim: false, at: 'bottom', title: 'Boards' }));
    const pop = k.$('.sp-rkp__pop');
    const puffs = k.$('.sp-rkp__puffs');
    gsap.set(pop, { autoAlpha: 0, transformOrigin: '20% 100%' });
    const puff = () => {
      for (let i = 0; i < p.puffs; i++) {
        const el = document.createElement('i');
        puffs.append(el);
        gsap.fromTo(el, { x: 0, y: 0, scale: 0.3, autoAlpha: 0.9 }, { x: `${(i - p.puffs / 2) * 0.8}em`, y: `${0.4 + Math.random()}em`, scale: 1.3 + Math.random(), autoAlpha: 0, duration: 0.8, ease: 'power2.out', onComplete: () => el.remove() });
      }
    };
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(pop, { autoAlpha: 1, y: '6em', scale: 0.3 }, { keyframes: { x: [-2, 2, -1, 1, 0] }, duration: 0.25, ease: 'none' })
          .add(puff)
          // Propelled up, faster and faster, past its spot…
          .to(pop, { y: `${-p.thrust}em`, scale: 1, duration: 0.4, ease: 'power3.in' })
          // …then it falls back and settles
          .to(pop, { y: 0, duration: 0.5, ease: 'bounce.out' })
      : gsap.timeline().to(pop, { y: '6em', scale: 0.3, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }),
    ['What’s new', 'Close']);
    return () => k.destroy();
  },
};
