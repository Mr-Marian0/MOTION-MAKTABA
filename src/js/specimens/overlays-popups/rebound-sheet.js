/** Rebound Sheet: the bottom sheet is thrown up open, slams into its top stop and rebounds, bouncing a few times before it rests; dragging it past the stop rebounds it too. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Rebound Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Drag', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Draggable', 'Bounce-responsive', 'Boundary-aware'],
  effect: ['Rebounding', 'Bouncing', 'Sliding'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Position'],
  description: 'A bottom sheet with a hard stop. Open it and it is thrown up, slams into its top limit and rebounds, bouncing down and up a few times before it rests. Grab the handle and pull it past the stop: let go and it rebounds off the limit the same way.',
  params: [
    { key: 'time', label: 'Throw time', group: 'Motion', type: 'range', min: 0.4, max: 1.6, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rbd', `
      <div class="sp-ov__sheet sp-rbd__sheet" role="dialog" aria-label="Add to board"><i class="sp-ov__grip sp-rbd__grip"></i><span class="sp-ov__kick">Add to board</span>
        ${['Summer', 'Inks', 'Type tests'].map((b) => `<span class="sp-rbd__row">${b}</span>`).join('')}</div>`, { label: 'Add', title: 'Sketch 14' }));
    const sheet = k.$('.sp-rbd__sheet');
    gsap.set(sheet, { yPercent: 105 });
    // bounce.out from below: it reaches the stop at once, then bounces back down off it and settles
    const rebound = (from) => gsap.fromTo(sheet, { yPercent: from }, { yPercent: 0, duration: p.time, ease: 'bounce.out' });
    toggle(k, gsap, { reducedMotion }, (open) => (open ? gsap.timeline().add(rebound(105)) : gsap.timeline().to(sheet, { yPercent: 105, duration: 0.4, ease: 'power2.in' })), ['Add', 'Done']);

    // Pull past the stop with the handle: on release it rebounds off the limit.
    let drag = null;
    const grip = k.$('.sp-rbd__grip');
    k.on(grip, 'pointerdown', (e) => { grip.setPointerCapture(e.pointerId); drag = { y: e.clientY, h: sheet.getBoundingClientRect().height }; });
    k.on(grip, 'pointermove', (e) => drag && gsap.set(sheet, { yPercent: clamp(((e.clientY - drag.y) / drag.h) * 100 * 0.5, -25, 25) }));
    k.on(window, 'pointerup', () => {
      if (!drag) return;
      drag = null;
      const at = gsap.getProperty(sheet, 'yPercent');
      if (reducedMotion) return gsap.set(sheet, { yPercent: 0 });
      // Pulled up past the stop: snap down to it and bounce; pulled down: thrown back up into it
      at < 0 ? gsap.fromTo(sheet, { yPercent: at }, { yPercent: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' }) : rebound(at);
    });
    return () => k.destroy();
  },
};
