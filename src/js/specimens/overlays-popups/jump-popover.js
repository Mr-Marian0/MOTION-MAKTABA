/** Jump Popover: the help popover crouches inside its button and jumps out in an arc, stretching in the air and landing in place with a squash; closing jumps it back in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Jump Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Elastic', 'Reversible'],
  effect: ['Jumping', 'Squashing', 'Stretching', 'Anticipation-motion'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Position', 'Scale'],
  description: 'A help popover with a spring in its step. Click the "?" and the button squats, then the popover jumps out of it in a high arc, stretching tall in mid-air, and lands in its spot with a squash and a little settle. Closing jumps it back into the button.',
  params: [
    { key: 'height', label: 'Jump height', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 'em', default: 4, live: true },
    { key: 'time', label: 'Air time', group: 'Motion', type: 'range', min: 0.25, max: 1, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-jmp', `<div class="sp-ov__card sp-ov__pop sp-jmp__pop" role="dialog" aria-label="Help"><b class="sp-ov__title">Need a hand?</b><span class="sp-ov__text">Drag sketches onto a board, or press N for a new one.</span></div>`, { label: '?', scrim: false, at: 'bottom', title: 'Boards' }));
    const pop = k.$('.sp-jmp__pop');
    const btn = k.$('.sp-ov__open');
    gsap.set(pop, { autoAlpha: 0, transformOrigin: '50% 100%' });
    // Start/end of the jump: the popover shrunk into the button, offset down-left of its own spot
    const home = { x: '-6em', y: '6em', scale: 0.2 };
    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = p.time;
      return open
        ? gsap.timeline()
            .to(btn, { scaleY: 0.75, scaleX: 1.15, duration: 0.12, ease: 'power2.out' })
            .to(btn, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
            .fromTo(pop, { ...home, autoAlpha: 1 }, { x: 0, scale: 1, duration: t, ease: 'none' }, '<')
            .to(pop, { keyframes: { y: [`${-p.height}em`, '0em'], scaleY: [1.15, 1], scaleX: [0.9, 1], easeEach: 'sine.inOut' }, duration: t }, '<')
            .to(pop, { scaleY: 0.82, scaleX: 1.1, duration: 0.08 })
            .to(pop, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.45)' })
        : gsap.timeline()
            .to(pop, { scaleY: 0.85, scaleX: 1.08, duration: 0.1 })
            .to(pop, { ...home, duration: t * 0.8, ease: 'power2.in' })
            .to(pop, { keyframes: { y: [`${-p.height * 0.6}em`, '6em'] }, duration: t * 0.8, ease: 'none' }, '<')
            .set(pop, { autoAlpha: 0 });
    }, ['?', '×']);
    return () => k.destroy();
  },
};
