/** Fold Dialog: closing the dialog folds it like a letter: bottom half up, then right half over, and the folded square is tucked away. Opening unfolds it the same way back. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Fold Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Folding', 'Unfolding', 'Axial-rotation'],
  purpose: ['Continuity', 'Delight', 'Storytelling'],
  properties: ['Rotation', 'Clip & mask', 'Depth (z)'],
  description: 'A dialog that folds up like a letter. Close it and the bottom half swings up over the top, then the right half folds over the left, showing the plain paper of its back, and the folded square slips away to the corner. Open it and it arrives folded and opens out flat, fold by fold.',
  params: [
    { key: 'fold', label: 'Fold time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Paper back'),
  ],
};

// Quarters: top-left, top-right, bottom-left, bottom-right.
const Q = [[[0, 0], [50, 0], [50, 50], [0, 50]], [[50, 0], [100, 0], [100, 50], [50, 50]], [[0, 50], [50, 50], [50, 100], [0, 100]], [[50, 50], [100, 50], [100, 100], [50, 100]]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const body = `<div class="sp-ov__card sp-fld__card"><span class="sp-ov__kick">Unsaved changes</span><b class="sp-ov__title">Leave this page?</b><span class="sp-ov__text">Your last three edits are not saved yet.</span><span class="sp-ov__actions"><span class="sp-ov__btn sp-ov__btn--ghost">Stay</span><span class="sp-ov__btn">Leave</span></span><i class="sp-fld__back"></i></div>`;
    k.html(scene('sp-fld', `<div class="sp-fld__hold" role="dialog" aria-label="Leave this page?">${body.replace('<i class="sp-fld__back"></i>', '')}<div class="sp-cc__pieces"></div></div>`, { label: 'Leave', title: 'Editor' }));
    const hold = k.$('.sp-fld__hold');
    const real = k.$('.sp-fld__hold > .sp-fld__card');
    const host = k.$('.sp-cc__pieces');
    const q = pieces(host, body, Q).map((b) => b.el);
    q.forEach((el) => gsap.set(el, { transformOrigin: '50% 50%', transformPerspective: 900 }));
    // A quarter shows its blank back while it faces away (an odd number of half-turns).
    const faces = () => q.forEach((el) => {
      const flips = [gsap.getProperty(el, 'rotationX'), gsap.getProperty(el, 'rotationY')].filter((a) => Math.abs(a) > 90).length;
      el.classList.toggle('is-back', flips % 2 === 1);
    });
    const folded = () => gsap.timeline({ onUpdate: faces })
      .to([q[2], q[3]], { rotationX: 180, duration: p.fold, ease: 'power2.inOut' })
      .to([q[1], q[3]], { rotationY: -180, duration: p.fold, ease: 'power2.inOut' })
      .to(hold, { x: '9em', y: '-6em', scale: 0.4, rotation: 12, autoAlpha: 0, duration: p.fold, ease: 'power2.in' });
    gsap.set(hold, { autoAlpha: 0 });

    const flat = () => {
      gsap.set(q, { rotationX: 0, rotationY: 0 });
      gsap.set(hold, { x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1 });
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (reducedMotion) {
        flat();
        gsap.set(hold, { autoAlpha: open ? 1 : 0 });
        return null;
      }
      gsap.set(real, { autoAlpha: 0 });
      gsap.set(host, { autoAlpha: 1 });
      // Opening: build the fold from flat, jump to its folded end, and play it backwards.
      if (open) flat();
      const tl = folded();
      if (open) {
        tl.progress(1).reverse();
        tl.eventCallback('onReverseComplete', () => (gsap.set(real, { autoAlpha: 1 }), gsap.set(host, { autoAlpha: 0 })));
      }
      return tl;
    }, ['Leave', 'Close']);
    return () => k.destroy();
  },
};
