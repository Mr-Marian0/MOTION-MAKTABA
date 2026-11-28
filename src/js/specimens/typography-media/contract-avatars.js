/** Contract Avatars: a team stack that breathes in and out with attention: hover or focus fans the faces apart with names; leave and they contract back into a tight overlapping stack, the last one first. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { face, NAMES } from './_tm.js';

export const meta = {
  title: 'Contract Avatars',
  element: 'Avatar',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Staggered', 'Reversible'],
  effect: ['Contracting', 'Expansion', 'Overshoot-motion'],
  purpose: ['Hierarchy', 'Orientation'],
  properties: ['Position', 'Spacing', 'Opacity'],
  description: 'An "on this project" avatar stack. At rest the five faces contract into a tight overlapping pile with a count. Point at it (or tab to it) and they spread out to full spacing with their names underneath; move away and they contract again, the furthest face sliding in first and each one tucking under its neighbour with a small overshoot.',
  params: [
    { key: 'gap', label: 'Spread', group: 'Shape', type: 'range', min: 2.4, max: 4.4, step: 0.1, unit: 'em', default: 3.6, live: true },
    { key: 'tight', label: 'Overlap', group: 'Shape', type: 'range', min: 0.6, max: 2, step: 0.1, unit: 'em', default: 1.1, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Count'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-cav">
        <span class="sp-tm__kick">On this project</span>
        <div class="sp-cav__stack" tabindex="0" aria-label="5 people: ${NAMES.join(', ')}">
          ${NAMES.map((n, i) => `<span class="sp-cav__p">${face(i)}<small>${n.split(' ')[0]}</small></span>`).join('')}
          <b class="sp-cav__count" aria-hidden="true">5</b>
        </div>
      </div>`);
    const stack = k.$('.sp-cav__stack');
    const people = k.$$('.sp-cav__p');
    const names = k.$$('.sp-cav__p small');
    const count = k.$('.sp-cav__count');
    const place = (open, d = 1) => {
      const t = reducedMotion ? 0 : d;
      people.forEach((el, i) => gsap.to(el, { x: `${i * (open ? p.gap : p.tight)}em`, duration: (open ? 0.5 : 0.45) * t, ease: open ? 'back.out(1.7)' : 'back.out(2.4)', delay: (open ? i : people.length - 1 - i) * 0.04 * t, overwrite: true }));
      gsap.to(names, { autoAlpha: open ? 1 : 0, y: open ? 0 : '-0.3em', duration: 0.25 * t, stagger: 0.03 * t, overwrite: true });
      gsap.to(count, { x: `${(people.length - 1) * (open ? p.gap : p.tight) + 3.2}em`, autoAlpha: open ? 0 : 1, duration: 0.4 * t, overwrite: true });
    };
    place(false, 0);
    ['pointerenter', 'focus'].forEach((ev) => k.on(stack, ev, () => place(true)));
    ['pointerleave', 'blur'].forEach((ev) => k.on(stack, ev, () => stack.matches(':hover, :focus') || place(false)));
    return () => k.destroy();
  },
};
