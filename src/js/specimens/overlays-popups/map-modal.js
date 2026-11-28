/** Map Modal: the trail map opens like a folded paper map: one panel swings out from the folded stack, then the next, until the whole map lies flat with its route drawn in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Map Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Nested', 'Reversible'],
  effect: ['Unfolding', 'Folding', 'Axial-rotation'],
  purpose: ['Storytelling', 'Continuity', 'Focus'],
  properties: ['Rotation', 'Depth (z)', 'Path'],
  description: 'A trail map that opens like the real thing. It arrives as a narrow folded stack, then unfolds panel by panel, each one swinging out on its crease from behind the last, until the map lies flat and the route draws itself across it. Closing folds it back up concertina-style.',
  params: [
    { key: 'panels', label: 'Panels', group: 'Shape', type: 'range', min: 2, max: 5, step: 1, unit: '', default: 4 },
    { key: 'step', label: 'Step time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Land'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.panels);
    const w = 22 / n;
    // Nested panels: each hangs off the right edge of the one before, so unfolding one carries the rest.
    const nest = (i) => (i >= n ? '' : `<div class="sp-map__panel" style="width:${w}em${i ? ';left:100%' : ''}"><div class="sp-map__face"><i class="sp-map__land" style="translate:${-i * w}em 0"></i></div>${nest(i + 1)}</div>`);
    k.html(scene('sp-map', `
      <div class="sp-map__modal" role="dialog" aria-label="Trail map">
        <div class="sp-map__sheet">${nest(0)}</div>
        <svg class="sp-map__route" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path d="M6 40 C 20 10, 35 45, 50 25 S 80 5, 94 18" pathLength="1" /></svg>
        <span class="sp-map__label">Ridge Loop · 12 km</span>
      </div>`, { label: 'Open map', title: 'Trails' }));
    const modal = k.$('.sp-map__modal');
    const panels = k.$$('.sp-map__panel');
    const route = k.$('.sp-map__route path');
    const label = k.$('.sp-map__label');
    gsap.set(panels, { transformPerspective: 1000, transformOrigin: '0% 50%' });
    gsap.set(panels.slice(1), { rotationY: (i) => (i % 2 ? 178 : -178) });
    gsap.set(route, { strokeDasharray: '1 2', strokeDashoffset: 1 });
    gsap.set([modal, label], { autoAlpha: 0 });

    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = p.step;
      const tl = gsap.timeline();
      if (open) {
        tl.fromTo(modal, { autoAlpha: 0, y: '1em', scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' });
        panels.slice(1).forEach((pn) => tl.to(pn, { rotationY: 0, duration: t, ease: 'power2.out' }));
        tl.to(route, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }).to(label, { autoAlpha: 1, duration: 0.3 }, '-=0.3');
      } else {
        tl.to([route, label], { strokeDashoffset: 1, autoAlpha: 0, duration: 0.2 });
        panels.slice(1).reverse().forEach((pn, i, arr) => tl.to(pn, { rotationY: (arr.length - 1 - i) % 2 ? 178 : -178, duration: t * 0.8, ease: 'power2.in' }));
        tl.to(modal, { autoAlpha: 0, scale: 0.9, duration: 0.25 });
      }
      return tl;
    }, ['Open map', 'Fold up']);
    return () => k.destroy();
  },
};
