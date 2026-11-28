/** Recoil Dialog: a "delete forever" dialog with a kick. Pressing Delete fires it: the button punches in and the whole dialog is knocked back by the recoil before it collapses. Clicking outside makes it flinch back instead of closing. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Recoil Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Elastic', 'Conditional'],
  effect: ['Recoil-motion', 'Recoiling', 'Contracting', 'Shaking'],
  purpose: ['Feedback', 'Focus'],
  properties: ['Position', 'Scale'],
  description: 'A "delete forever" dialog that pushes back. Press Delete and it fires like a stamp: the button punches in, the whole dialog is knocked back by the recoil, then it collapses away. Click outside it and it refuses to go, flinching back with a small recoil instead of closing.',
  params: [
    { key: 'kick', label: 'Kick', group: 'Motion', type: 'range', min: 0.02, max: 0.15, step: 0.01, unit: '×', default: 0.07, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Danger'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rcl', `<div class="sp-ov__card sp-ov__modal sp-rcl__dialog" role="alertdialog" aria-label="Delete forever?"><b class="sp-ov__title">Delete forever?</b><span class="sp-ov__text">“Old sketches” and its 48 pins will be gone.</span><span class="sp-ov__actions"><button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-rcl__keep">Keep</button><button type="button" class="sp-ov__btn sp-rcl__del">Delete</button></span></div>`, { label: 'Delete', title: 'Old sketches' }));
    const dialog = k.$('.sp-rcl__dialog');
    const del = k.$('.sp-rcl__del');
    const scrim = k.$('.sp-ov__scrim');
    gsap.set(dialog, { autoAlpha: 0 });
    const ui = toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline().fromTo(dialog, { autoAlpha: 1, scale: 0.9 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
      : gsap.timeline().to(dialog, { scale: 0.9, autoAlpha: 0, duration: 0.2 }),
    ['Delete', 'Close']);
    k.on(k.$('.sp-rcl__keep'), 'click', () => ui.set(false));
    k.on(del, 'click', () => {
      if (reducedMotion) return ui.set(false);
      gsap.timeline()
        // Fire: the button punches in, the dialog is knocked back and shudders…
        .to(del, { scale: 0.85, duration: 0.06, ease: 'power4.out' })
        .to(dialog, { scale: 1 - p.kick, y: '0.4em', duration: 0.08, ease: 'power4.out' }, '<')
        .to(del, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
        .to(dialog, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '<')
        // …then it collapses away
        .add(() => ui.set(false), '-=0.1');
    });
    // Clicking outside doesn't close a destructive dialog: it flinches back instead.
    k.on(scrim, 'click', (e) => {
      e.stopImmediatePropagation();
      if (!reducedMotion) gsap.fromTo(dialog, { scale: 1 }, { keyframes: { scale: [1 - p.kick * 0.6, 1.01, 1] }, duration: 0.35 });
    }, { capture: true });
    return () => k.destroy();
  },
};
