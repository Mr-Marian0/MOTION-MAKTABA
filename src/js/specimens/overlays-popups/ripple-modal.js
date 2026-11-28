/** Ripple Modal: pressing the button sends a wave out across the page in rings, the page lines lifting as each ring passes under them, and the modal rises where the wave crosses the centre. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Ripple Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Position-aware', 'Cascading', 'Staggered'],
  effect: ['Wave-propagation', 'Ripple-deformation', 'Traveling-wave', 'Rising'],
  purpose: ['Continuity', 'Feedback', 'Delight'],
  properties: ['Scale', 'Position', 'Opacity'],
  description: 'A modal carried in on a wave. Press the button and rings spread out from it across the page like a stone dropped in water; every line of page content bobs up as the wave front reaches it, in order of distance, and the modal rises up in the middle as the wave passes through.',
  params: [
    { key: 'speed', label: 'Wave speed', group: 'Motion', type: 'range', min: 10, max: 80, step: 5, unit: 'em/s', default: 35, live: true },
    { key: 'lift', label: 'Lift', group: 'Motion', type: 'range', min: 0.1, max: 1, step: 0.05, unit: 'em', default: 0.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Rings'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rpl', `
      <div class="sp-rpl__rings" aria-hidden="true">${'<i></i>'.repeat(3)}</div>
      <div class="sp-ov__card sp-ov__modal sp-rpl__modal" role="dialog" aria-label="Subscribed"><span class="sp-ov__kick">Subscribed</span><b class="sp-ov__title">You’re on the list</b><span class="sp-ov__text">First letter lands on Sunday.</span></div>`, { label: 'Subscribe', title: 'Newsletter', scrim: false }));
    const root = k.$('.sp-ov');
    const btn = k.$('.sp-ov__open');
    const rings = k.$$('.sp-rpl__rings i');
    const modal = k.$('.sp-rpl__modal');
    const lines = k.$$('.sp-ov__page > *');
    gsap.set([modal, ...rings], { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) return gsap.timeline().to(modal, { autoAlpha: 0, y: '1em', duration: 0.3 });
      const em = parseFloat(getComputedStyle(root).fontSize);
      const o = [btn.offsetLeft + btn.offsetWidth / 2, btn.offsetTop + btn.offsetHeight / 2];
      const reach = Math.hypot(root.offsetWidth, root.offsetHeight) / em; // em to the far corner
      const dist = (el) => Math.hypot(el.offsetLeft + el.offsetWidth / 2 - o[0], el.offsetTop + el.offsetHeight / 2 - o[1]) / em;
      const tl = gsap.timeline();
      // Rings are full size and scale up from nothing (transform only, no layout per frame)
      rings.forEach((r, i) => tl.fromTo(r, { left: o[0], top: o[1], width: `${reach * 2}em`, height: `${reach * 2}em`, scale: 0, autoAlpha: 0.8 }, { scale: 1, autoAlpha: 0, duration: reach / p.speed, ease: 'none' }, i * 0.15));
      // Each page line bobs when the wave front reaches it
      lines.forEach((l) => tl.fromTo(l, { y: 0 }, { keyframes: { y: [`${-p.lift}em`, '0em'] }, duration: 0.45, ease: 'sine.inOut' }, dist(l) / p.speed));
      const mid = Math.hypot(root.offsetWidth / 2 - o[0], root.offsetHeight / 2 - o[1]) / em;
      return tl.fromTo(modal, { autoAlpha: 1, y: '1.5em', scale: 0.9 }, { y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' }, mid / p.speed);
    }, ['Subscribe', 'Close']);
    return () => k.destroy();
  },
};
