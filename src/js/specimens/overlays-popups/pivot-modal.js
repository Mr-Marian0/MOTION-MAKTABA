/** Pivot Modal: the modal swings in on an off-centre pivot outside itself, like a card on a rotating arm: it sweeps round in a wide arc and lands upright in the middle. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Pivot Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Anchored', 'Reversible'],
  effect: ['Eccentric-rotation', 'Rotating', 'Overshoot-motion'],
  purpose: ['Continuity', 'Delight', 'Focus'],
  properties: ['Rotation', 'Position'],
  description: 'A modal mounted on an invisible arm. Its pivot sits well outside it, off to one side of the page, so it does not spin on the spot but sweeps round in a wide arc, overshoots a touch and settles upright in the middle. Closing swings it on round and out the other way.',
  params: [
    { key: 'pivot', label: 'Pivot', group: 'Shape', type: 'choice', options: ['Bottom left', 'Top left', 'Bottom right'], default: 'Bottom left', live: true },
    { key: 'arm', label: 'Arm length', group: 'Shape', type: 'range', min: 50, max: 250, step: 25, unit: '%', default: 150, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-pvt', `<div class="sp-ov__card sp-ov__modal sp-pvt__modal" role="dialog" aria-label="Invite"><span class="sp-ov__kick">Team</span><b class="sp-ov__title">Invite a collaborator</b><span class="sp-ov__text">They can comment and pin to every board.</span><span class="sp-ov__actions"><span class="sp-ov__btn">Send invite</span></span></div>`, { label: 'Invite', title: 'Team' }));
    const modal = k.$('.sp-pvt__modal');
    gsap.set(modal, { autoAlpha: 0 });
    const origin = () => {
      const arm = p.arm;
      return { 'Bottom left': `${-arm}% ${100 + arm}%`, 'Top left': `${-arm}% ${-arm}%`, 'Bottom right': `${100 + arm}% ${100 + arm}%` }[p.pivot];
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      const dir = p.pivot === 'Bottom right' ? -1 : 1;
      gsap.set(modal, { transformOrigin: origin() });
      return open
        ? gsap.timeline().fromTo(modal, { autoAlpha: 1, rotation: -70 * dir }, { rotation: 0, duration: 0.9, ease: 'back.out(1.3)' })
        : gsap.timeline().to(modal, { rotation: 70 * dir, duration: 0.6, ease: 'power2.in' }).set(modal, { autoAlpha: 0 });
    }, ['Invite', 'Close']);
    return () => k.destroy();
  },
};
