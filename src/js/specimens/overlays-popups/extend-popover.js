/** Extend Popover: the share popover extends out of its button like a telescopic arm, section by section, then the options pop up along it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Extend Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Nested', 'Reversible'],
  effect: ['Extending', 'Retracting', 'Rising'],
  purpose: ['Hierarchy', 'Affordance', 'Delight'],
  properties: ['Size', 'Scale', 'Position'],
  description: 'A share popover that extends like a telescopic arm. Click Share and the popover pushes out of the button one segment at a time, each sliding out of the last, then the share options pop up along it. Close it and the segments slide back inside each other.',
  params: [
    { key: 'step', label: 'Step time', group: 'Motion', type: 'range', min: 0.08, max: 0.4, step: 0.02, unit: 's', default: 0.16, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Arm'),
  ],
};

const OPTS = ['Link', 'Mail', 'Post', 'Print'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-ext', `<div class="sp-ext__arm" role="menu">${OPTS.map((o) => `<span class="sp-ext__seg"><button type="button" class="sp-ext__opt" role="menuitem" tabindex="-1">${o}</button></span>`).join('')}</div>`, { label: 'Share', scrim: false, at: 'bottom', title: 'Spring catalogue' }));
    const segs = k.$$('.sp-ext__seg');
    const opts = k.$$('.sp-ext__opt');
    gsap.set(segs, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(opts, { y: '0.6em', autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      opts.forEach((o) => (o.tabIndex = open ? 0 : -1));
      const t = p.step;
      return open
        ? gsap.timeline()
            // Each segment slides out of the one before it
            .to(segs, { scaleX: 1, duration: t, ease: 'power2.out', stagger: t * 0.85 })
            .to(opts, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.5)', stagger: 0.05 }, '-=0.15')
        : gsap.timeline()
            .to(opts, { autoAlpha: 0, duration: 0.12 })
            .to(segs.slice().reverse(), { scaleX: 0, duration: t * 0.8, ease: 'power2.in', stagger: t * 0.6 });
    }, ['Share', 'Close']);
    return () => k.destroy();
  },
};
