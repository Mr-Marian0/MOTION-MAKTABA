/** Build Dialog: the confirm dialog is built from plain shapes (a sheet, a warning disc, title and text bars, two pills) that fly in and lock together, then its words appear. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Build Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Randomized', 'Reversible'],
  effect: ['Shape-assembly', 'Spinning', 'Shape-disassembly'],
  purpose: ['Storytelling', 'Delight', 'Hierarchy'],
  properties: ['Shape', 'Position', 'Rotation', 'Scale'],
  description: 'A confirm dialog that builds itself. Its parts start as plain shapes (a sheet, a warning disc, a title bar, text bars, two pills) that spin in from around the page and lock into place, then the real words fade in over them. Closing takes it apart the same way.',
  params: [
    { key: 'scatter', label: 'Scatter', group: 'Layout', type: 'range', min: 4, max: 18, step: 1, unit: 'em', default: 12, live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0.02, max: 0.2, step: 0.01, unit: 's', default: 0.07, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Warning'),
  ],
};

// [class, left, top, width, height] in em, inside a 20 × 11em dialog
const PARTS = [['sheet', 0, 0, 20, 11], ['disc', 1.3, 1.3, 2.4, 2.4], ['bar bar--title', 4.6, 1.5, 11, 1.4], ['bar', 4.6, 3.8, 13.5, 0.6], ['bar', 4.6, 5, 10, 0.6], ['pill pill--ghost', 6.6, 8, 5.6, 1.9], ['pill', 12.8, 8, 5.6, 1.9]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-bld', `
      <div class="sp-bld__box" role="dialog" aria-label="Delete board?">
        ${PARTS.map(([c, x, y, w, h]) => `<i class="sp-bld__part ${c.split(' ').map((s) => `sp-bld__${s.replace('--', '-')}`).join(' ')}" style="left:${x}em;top:${y}em;width:${w}em;height:${h}em"></i>`).join('')}
        <span class="sp-bld__word sp-bld__w1"><b>!</b></span>
        <span class="sp-bld__word sp-bld__w2"><b class="sp-ov__title">Delete board?</b></span>
        <span class="sp-bld__word sp-bld__w3"><span class="sp-ov__text">All 24 pins go too. This can’t be undone.</span></span>
        <span class="sp-bld__word sp-bld__w4">Keep</span><span class="sp-bld__word sp-bld__w5">Delete</span>
      </div>`, { label: 'Delete', title: 'Board settings' }));
    const parts = k.$$('.sp-bld__part');
    const words = k.$$('.sp-bld__word');
    const bars = k.$$('.sp-bld__bar');
    gsap.set([...parts, ...words], { autoAlpha: 0 });
    const r = () => (Math.random() - 0.5) * 2;
    const away = () => ({ x: () => `${r() * p.scatter}em`, y: () => `${r() * p.scatter * 0.6}em`, rotation: () => r() * 200, scale: 0.4, autoAlpha: 0 });

    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .set(bars, { autoAlpha: 1 })
          .fromTo(parts, away(), { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.5)', stagger: p.stagger })
          .to(bars, { autoAlpha: 0, duration: 0.2 }, '-=0.1')
          .fromTo(words, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, '<')
      : gsap.timeline()
          .to(words, { autoAlpha: 0, duration: 0.15 })
          .to(parts, { ...away(), duration: 0.5, ease: 'power2.in', stagger: { each: p.stagger * 0.5, from: 'end' } }),
    ['Delete', 'Cancel']);
    return () => k.destroy();
  },
};
