/** Kaleido Dialog: a celebration dialog that opens out of a kaleidoscope: mirrored wedges of colour turn and bloom outward, revealing the message at the centre. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Kaleido Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Toggle-dependent', 'Synchronized', 'Reversible'],
  effect: ['Kaleidoscopic-motion', 'Spinning', 'Expansion'],
  purpose: ['Delight', 'Feedback', 'Storytelling'],
  properties: ['Rotation', 'Scale', 'Clip & mask', 'Opacity'],
  description: 'A "you did it" dialog seen down a kaleidoscope. A disc of mirrored wedges appears and the pattern inside them turns, every wedge reflecting its neighbour, so the whole disc blooms in perfect symmetry. Then the wedges fan outward and fade, leaving the message in the middle. Hovering the dialog gives it a small twist, like turning the barrel of the scope.',
  params: [
    { key: 'wedges', label: 'Mirrors', group: 'Shape', type: 'range', min: 6, max: 16, step: 2, unit: '', default: 8 },
    { key: 'turn', label: 'Turn', group: 'Motion', type: 'range', min: 45, max: 360, step: 15, unit: '°', default: 180, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.6, max: 2.4, step: 0.1, unit: 's', default: 1.4, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Glass'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.wedges / 2) * 2; // even, so every wedge has a mirrored twin
    // A wedge from the centre to the top edge, half-angle 180/n: tan gives where it meets the edge.
    const t = 50 * Math.tan(Math.PI / n);
    const cut = `polygon(50% 50%, ${50 - t}% 0%, ${50 + t}% 0%)`;
    k.html(scene('sp-kld', `
      <div class="sp-kld__scope" aria-hidden="true">${Array.from({ length: n }, () => `<div class="sp-kld__wedge" style="clip-path:${cut}"><i class="sp-kld__glass"></i></div>`).join('')}</div>
      <div class="sp-ov__card sp-ov__modal sp-kld__dialog" role="dialog" aria-labelledby="kld-t">
        <b class="sp-ov__title" id="kld-t">Streak: 30 days</b>
        <p class="sp-ov__text">A month of daily practice. That is a whole new habit.</p>
        <div class="sp-ov__actions"><button type="button" class="sp-ov__btn">Keep going</button></div>
      </div>`, { label: 'Claim badge', title: 'Practice', kick: 'Habits' }));
    const scope = k.$('.sp-kld__scope');
    const wedges = k.$$('.sp-kld__wedge');
    const glass = k.$$('.sp-kld__glass');
    const dialog = k.$('.sp-kld__dialog');
    // Every wedge is turned to its slot; every other one is mirrored, which is what makes it a kaleidoscope.
    wedges.forEach((w, i) => gsap.set(w, { rotation: (i * 360) / n, scaleX: i % 2 ? -1 : 1 }));
    gsap.set([scope, dialog], { autoAlpha: 0 });
    // All glass turns together; the mirrors turn that one motion into a symmetric bloom.
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) {
        return gsap.timeline()
          .to(dialog, { autoAlpha: 0, scale: 0.8, duration: 0.25 })
          .to(scope, { autoAlpha: 0, duration: 0.2 }, 0);
      }
      gsap.set(dialog, { autoAlpha: 0 });
      return gsap.timeline()
        .fromTo(scope, { autoAlpha: 0, scale: 0.4, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: p.time * 0.4, ease: 'back.out(1.4)' })
        .fromTo(glass, { rotation: 0, scale: 1 }, { rotation: p.turn, scale: 1.25, duration: p.time, ease: 'power2.inOut' }, 0)
        .to(wedges, { scaleX: (i) => (i % 2 ? -2.2 : 2.2), scaleY: 2.2, autoAlpha: 0, duration: p.time * 0.4, ease: 'power2.in' }, p.time * 0.75)
        .fromTo(dialog, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, p.time * 0.85)
        .set(scope, { autoAlpha: 0 })
        .set(wedges, { scaleX: (i) => (i % 2 ? -1 : 1), scaleY: 1, autoAlpha: 1 });
    }, ['Claim badge', 'Close']);
    // Extra: hovering the dialog gives it a small twist, like turning the scope's barrel
    k.on(dialog, 'pointerenter', () => !reducedMotion && gsap.to(dialog, { rotation: 2, duration: 0.3, ease: 'back.out(3)', overwrite: 'auto' }));
    k.on(dialog, 'pointerleave', () => !reducedMotion && gsap.to(dialog, { rotation: 0, duration: 0.3, overwrite: 'auto' }));
    return () => k.destroy();
  },
};
