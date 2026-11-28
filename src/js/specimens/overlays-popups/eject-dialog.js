/** Eject Dialog: the receipt dialog is ejected from a slot like a ticket from a machine: a whirr, then it is pushed out sharply, flutters and settles. Closing feeds it back in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Eject Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Ejecting', 'Wobbling', 'Vibrating'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Position', 'Clip & mask', 'Rotation'],
  description: 'A payment receipt that comes out like a ticket from a machine. A slot appears, the machine whirrs, and the receipt is pushed out of it in jerks, then given a final sharp push that leaves it fluttering before it settles. Closing feeds it back into the slot.',
  params: [
    { key: 'kick', label: 'Final push', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.25, unit: '', default: 2.5, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Machine'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-ejd', `
      <div class="sp-ejd__machine"><i class="sp-ejd__slot"></i>
        <div class="sp-ejd__well"><div class="sp-ov__card sp-ejd__ticket" role="dialog" aria-label="Receipt"><span class="sp-ov__kick">Paid · 27 Nov</span><b class="sp-ov__title">$48.00</b><span class="sp-ov__text">Quilted cushion · card ending 4242</span><span class="sp-ejd__zig"></span></div></div>
      </div>`, { label: 'Pay', title: 'Checkout' }));
    const machine = k.$('.sp-ejd__machine');
    const ticket = k.$('.sp-ejd__ticket');
    gsap.set(machine, { autoAlpha: 0 });
    gsap.set(ticket, { yPercent: -102 });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(machine, { autoAlpha: 0, y: '-1em' }, { autoAlpha: 1, y: 0, duration: 0.25 })
          .to(machine, { keyframes: { x: [-1, 1, -1, 1, 0] }, duration: 0.3, ease: 'none' })
          // Fed out in jerks, then pushed the last stretch
          .to(ticket, { yPercent: -75, duration: 0.15, ease: 'steps(3)' })
          .to(ticket, { yPercent: -50, duration: 0.15, ease: 'steps(3)' }, '+=0.08')
          .to(ticket, { yPercent: 0, duration: 0.45, ease: `back.out(${p.kick})` }, '+=0.08')
          .to(ticket, { keyframes: { rotation: [2, -1.5, 1, 0] }, transformOrigin: '50% 0%', duration: 0.6 }, '<0.1')
      : gsap.timeline().to(ticket, { yPercent: -102, rotation: 0, duration: 0.5, ease: 'power2.in' }).to(machine, { autoAlpha: 0, duration: 0.2 }),
    ['Pay', 'Done']);
    return () => k.destroy();
  },
};
