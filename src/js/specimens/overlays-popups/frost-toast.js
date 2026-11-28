/** Frost Toast: a timed toast whose countdown freezes while you hover it: frost creeps over it and the timer bar stops; move away and it thaws and carries on. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Frost Toast',
  element: 'Toast',
  trigger: ['Click', 'Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Pausable', 'Resumable', 'Temporary'],
  effect: ['Freezing', 'Decelerating', 'Sliding'],
  purpose: ['Feedback', 'Affordance', 'Focus'],
  properties: ['Color', 'Clip & mask', 'Size'],
  description: 'A timed undo toast that freezes when you need it to. While its timer runs out it is a normal dark toast; point at it (or tab to it) and frost creeps over it from the edges as the countdown bar slows and stops, so it won’t vanish while you read. Move away and it thaws and the timer picks up again.',
  params: [
    { key: 'life', label: 'Time on screen', group: 'Behavior', type: 'range', min: 2, max: 12, step: 0.5, unit: 's', default: 6, live: true },
    { key: 'freeze', label: 'Freeze time', group: 'Motion', type: 'range', min: 0.2, max: 1.5, step: 0.1, unit: 's', default: 0.6, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Frost'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-fzt', `<div class="sp-ov__toast sp-fzt__toast" role="status" tabindex="0"><i></i><span>Message archived</span><span class="sp-fzt__undo">Undo</span><b class="sp-fzt__bar"></b><b class="sp-fzt__frost"></b></div>`, { label: 'Archive', scrim: false, title: 'Inbox' }));
    const toast = k.$('.sp-fzt__toast');
    const bar = k.$('.sp-fzt__bar');
    gsap.set(toast, { autoAlpha: 0, '--f': 0 });
    let clock;
    const ui = toggle(k, gsap, { reducedMotion }, (open) => {
      clock?.kill();
      if (!open) return gsap.timeline().to(toast, { x: '4em', autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
      clock = gsap.fromTo(bar, { scaleX: 1 }, { scaleX: 0, duration: p.life, ease: 'none', onComplete: () => ui.open && ui.set(false) });
      return gsap.timeline().set(toast, { '--f': 0 }).fromTo(toast, { autoAlpha: 1, x: '4em' }, { x: 0, duration: 0.4, ease: 'back.out(1.6)' });
    }, ['Archive', 'Dismiss']);
    // Freeze while pointed at or focused: frost grows, and the countdown slows to a stop
    const freeze = (on) => {
      if (!clock) return;
      gsap.to(toast, { '--f': on ? 1 : 0, duration: reducedMotion ? 0 : p.freeze, ease: 'power1.out', overwrite: 'auto' });
      gsap.to(clock, { timeScale: on ? 0 : 1, duration: reducedMotion ? 0 : p.freeze, overwrite: true });
    };
    [['pointerenter', true], ['pointerleave', false], ['focus', true], ['blur', false]].forEach(([e, on]) => k.on(toast, e, () => freeze(on)));
    return () => { clock?.kill(); k.destroy(); };
  },
};
