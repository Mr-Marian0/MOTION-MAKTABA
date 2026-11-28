/** Free-fall Toasts: a stack of notifications; "Clear all" unhooks them one by one and each free-falls off the bottom of the page, tumbling and speeding up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Free-fall Toasts',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Gravity-driven', 'Staggered', 'Randomized', 'Queue-based'],
  effect: ['Free-fall', 'Tumbling', 'Rising'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A pile of notification toasts. "Notify" stacks three of them in the corner; "Clear all" lets go of them from the bottom up: each tips on one corner, then drops off the bottom of the page in free fall, tumbling and speeding up.',
  params: [
    { key: 'tumble', label: 'Tumble', group: 'Motion', type: 'range', min: 0, max: 180, step: 15, unit: '°', default: 60, live: true },
    { key: 'gap', label: 'Gap between drops', group: 'Motion', type: 'range', min: 0, max: 0.4, step: 0.02, unit: 's', default: 0.12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Dot'),
  ],
};

const MSGS = ['Bo replied to your sketch', 'Export finished', '2 new followers'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-fft', `<div class="sp-fft__stack" role="status">${MSGS.map((m) => `<div class="sp-ov__toast sp-fft__toast"><i></i><span>${m}</span></div>`).join('')}</div>`, { label: 'Notify', scrim: false, title: 'Activity' }));
    const toasts = k.$$('.sp-fft__toast');
    gsap.set(toasts, { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      const tl = gsap.timeline();
      if (open) return tl.fromTo(toasts, { autoAlpha: 0, x: '4em', y: 0, rotation: 0 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'back.out(1.6)', stagger: 0.12 });
      toasts.slice().reverse().forEach((t, i) => {
        const dir = Math.random() < 0.5 ? -1 : 1;
        tl.to(t, { rotation: dir * 6, transformOrigin: dir < 0 ? '100% 0%' : '0% 0%', duration: 0.12 }, i * p.gap)
          .to(t, { y: '22em', rotation: dir * p.tumble, x: `${dir * 1.5}em`, duration: 0.85, ease: 'power2.in' }, '>');
      });
      return tl.set(toasts, { autoAlpha: 0 });
    }, ['Notify', 'Clear all']);
    return () => k.destroy();
  },
};
