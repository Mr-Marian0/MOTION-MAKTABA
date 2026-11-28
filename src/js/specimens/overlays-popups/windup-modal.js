/** Windup Modal: before the modal shoots out, it winds up: the button draws back and squashes, holds a beat, then the modal is flung out of it to the centre, overshooting a touch. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Windup Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Elastic'],
  effect: ['Anticipation-motion', 'Overshoot-motion', 'Squashing'],
  purpose: ['Delight', 'Affordance', 'Continuity'],
  properties: ['Scale', 'Position', 'Rotation'],
  description: 'A modal with a wind-up, the classic animation principle. Press the button and it first draws back and squashes, as if gathering itself, holds for a beat, then the modal is flung out of it and overshoots slightly into the centre. Closing snaps it back into the button.',
  params: [
    { key: 'windup', label: 'Wind-up', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    { key: 'hold', label: 'Hold', group: 'Motion', type: 'range', min: 0, max: 0.5, step: 0.05, unit: 's', default: 0.12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-wnd', `<div class="sp-ov__card sp-ov__modal sp-wnd__modal" role="dialog" aria-label="Invite friends"><span class="sp-ov__kick">Share the joy</span><b class="sp-ov__title">Invite three friends</b><span class="sp-ov__text">You both get a free notebook.</span></div>`, { label: 'Invite', title: 'Rewards' }));
    const modal = k.$('.sp-wnd__modal');
    const btn = k.$('.sp-ov__open');
    gsap.set(modal, { autoAlpha: 0 });
    // Where the button is, relative to the modal's centre (layout px), so the modal can leave from it.
    const fromBtn = () => ({ x: btn.offsetLeft + btn.offsetWidth / 2 - (modal.offsetLeft), y: btn.offsetTop + btn.offsetHeight / 2 - (modal.offsetTop) });
    toggle(k, gsap, { reducedMotion }, (open) => {
      const o = fromBtn();
      return open
        ? gsap.timeline()
            // Anticipation: draw back and squash…
            .to(btn, { x: '0.8em', y: '-0.4em', scaleX: 1.15, scaleY: 0.8, rotation: 8, duration: p.windup, ease: 'power2.out' })
            .to({}, { duration: p.hold })
            // …then release: the button springs back as the modal flies out
            .to(btn, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
            .fromTo(modal, { autoAlpha: 1, x: o.x, y: o.y, scale: 0.1 }, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)' }, '<')
        : gsap.timeline().to(modal, { x: o.x, y: o.y, scale: 0.1, autoAlpha: 0, duration: 0.3, ease: 'power3.in' });
    }, ['Invite', 'Close']);
    return () => k.destroy();
  },
};
