/** Magnet Popover: open it and specks scattered across the page are pulled toward the button like iron filings to a magnet, gather into the popover's outline, and it appears where they meet. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Magnet Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Attracted', 'Staggered', 'Randomized'],
  effect: ['Attraction-motion', 'Convergence', 'Repulsion-motion'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A popover summoned like iron filings. Open it and specks scattered all over the page are drawn toward it, speeding up as they close in, and gather along the popover\'s outline; the popover then fills in where they meet. Closing repels the specks back out across the page.',
  params: [
    { key: 'count', label: 'Specks', group: 'Shape', type: 'range', min: 12, max: 60, step: 4, unit: '', default: 32 },
    { key: 'time', label: 'Pull time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Specks'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.count);
    k.html(scene('sp-mag', `
      <div class="sp-mag__field" aria-hidden="true">${'<i></i>'.repeat(n)}</div>
      <div class="sp-ov__card sp-ov__pop sp-mag__pop" role="dialog" aria-label="Pinned"><span class="sp-ov__kick">Pinned</span><b class="sp-ov__title">3 boards need you</b><span class="sp-ov__text">Comments waiting on Summer, Inks and Type.</span></div>`, { label: 'Pinned', scrim: false, at: 'bottom', title: 'Dashboard' }));
    const pop = k.$('.sp-mag__pop');
    const field = k.$('.sp-mag__field');
    const specks = k.$$('.sp-mag__field i');
    gsap.set(pop, { autoAlpha: 0 });
    // Each speck's home on the page (random) and its target on the popover's outline (both px, field-relative).
    const outline = (i) => {
      const [x0, y0, w, h] = [pop.offsetLeft, pop.offsetTop, pop.offsetWidth, pop.offsetHeight];
      const u = (i / n) * 2 * (w + h);
      return u < w ? [x0 + u, y0] : u < w + h ? [x0 + w, y0 + u - w] : u < 2 * w + h ? [x0 + w - (u - w - h), y0 + h] : [x0, y0 + h - (u - 2 * w - h)];
    };
    const scatter = () => specks.forEach((s) => gsap.set(s, { x: Math.random() * field.offsetWidth, y: Math.random() * field.offsetHeight, autoAlpha: 0.6, scale: 1 }));
    scatter();
    toggle(k, gsap, { reducedMotion }, (open) => {
      const tl = gsap.timeline();
      if (open) {
        // Pulled in: speeding up as they close in (power3.in), the farther ones arriving last
        specks.forEach((s, i) => {
          const [x, y] = outline(i);
          tl.to(s, { x, y, autoAlpha: 1, duration: p.time * (0.6 + Math.random() * 0.4), ease: 'power3.in' }, 0);
        });
        tl.fromTo(pop, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.3 }).to(specks, { autoAlpha: 0, scale: 0.3, duration: 0.25 }, '<');
      } else {
        tl.to(pop, { autoAlpha: 0, duration: 0.15 });
        specks.forEach((s) => tl.to(s, { x: Math.random() * field.offsetWidth, y: Math.random() * field.offsetHeight, autoAlpha: 0.6, scale: 1, duration: p.time * 0.8, ease: 'power3.out' }, 0.1));
      }
      return tl;
    }, ['Pinned', 'Close']);
    return () => k.destroy();
  },
};
