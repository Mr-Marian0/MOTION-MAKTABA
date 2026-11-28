/** Buzz Toast: an incoming-call toast that vibrates like a phone on a table: short fast buzzes in bursts, with a pause between, until you answer or dismiss it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Buzz Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Periodic', 'Intermittent'],
  effect: ['Vibrating', 'Jittering', 'Sliding'],
  purpose: ['Feedback', 'Focus'],
  properties: ['Position', 'Rotation'],
  description: 'An incoming-call toast that buzzes like a phone on a table. It slides in, then vibrates in short, fast bursts (a few millimetres side to side and a hair of twist) with a pause between bursts, just like a ringing phone, until you answer or dismiss it.',
  params: [
    { key: 'amp', label: 'Buzz size', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'px', default: 3, live: true },
    { key: 'gap', label: 'Pause between', group: 'Behavior', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Answer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-bzz', `<div class="sp-ov__toast sp-bzz__toast" role="alert"><i></i><span><b>Mei Tanaka</b> is calling</span><span class="sp-bzz__answer">Answer</span></div>`, { label: 'Ring', scrim: false, title: 'Studio' }));
    const toast = k.$('.sp-bzz__toast');
    gsap.set(toast, { autoAlpha: 0 });
    let buzz;
    toggle(k, gsap, { reducedMotion }, (open) => {
      buzz?.kill();
      if (!open) return gsap.timeline().to(toast, { x: '4em', autoAlpha: 0, duration: 0.3 });
      const tl = gsap.timeline().fromTo(toast, { autoAlpha: 1, x: '4em', rotation: 0 }, { x: 0, duration: 0.35, ease: 'power3.out' });
      if (reducedMotion) return tl;
      // A burst: fast, tiny alternating shakes (the timeline repeats with a pause, like a ringing phone)
      const shakes = Array.from({ length: 12 }, (_, i) => (i % 2 ? -1 : 1) * p.amp * (1 - i / 14));
      buzz = gsap.timeline({ repeat: -1, repeatDelay: p.gap, delay: 0.4 })
        .to(toast, { keyframes: { x: [...shakes, 0], rotation: [...shakes.map((v) => v * 0.3), 0] }, duration: 0.45, ease: 'none' });
      return tl;
    }, ['Ring', 'Decline']);
    return () => { buzz?.kill(); k.destroy(); };
  },
};
