/** Skid Toast: the toast shoots in from the side too fast, skids to a stop tilted on its leading corner with marks behind it, and rocks back level. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Skid Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Momentum-driven', 'Friction-responsive'],
  effect: ['Skidding', 'Sliding', 'Wobbling'],
  purpose: ['Feedback', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'An order-shipped toast that arrives in a hurry. It shoots in from the right, brakes hard tilted on its leading corner and leaves two skid marks that fade, then rocks back level. Dismissing it pulls away just as fast the other way.',
  params: [
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.12, max: 0.6, step: 0.04, unit: 's', default: 0.24, live: true },
    { key: 'tilt', label: 'Tilt', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: '°', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-skt', `<i class="sp-skt__marks"><i></i><i></i></i><div class="sp-ov__toast sp-skt__toast" role="status"><i></i><span>Your order is on its way</span></div>`, { label: 'Ship it', scrim: false, title: 'Orders' }));
    const toast = k.$('.sp-skt__toast');
    const marks = k.$('.sp-skt__marks');
    gsap.set(toast, { autoAlpha: 0, transformOrigin: '0% 100%' });
    gsap.set(marks, { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(toast, { autoAlpha: 1, x: '22em', rotation: 0, skewX: -10 }, { x: '-1em', skewX: 0, rotation: -p.tilt, duration: p.speed, ease: 'power2.out' })
          .fromTo(marks, { autoAlpha: 0.9, scaleX: 0 }, { scaleX: 1, duration: p.speed * 1.4, ease: 'power3.out' }, '<0.04')
          .to(toast, { x: 0, duration: p.speed * 1.5, ease: 'power3.out' }, '<0.05')
          .to(toast, { rotation: p.tilt * 0.35, duration: 0.2 }, `<${p.speed}`)
          .to(toast, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
          .to(marks, { autoAlpha: 0, duration: 1.2 }, '<')
      : gsap.timeline().to(toast, { x: '22em', rotation: p.tilt * 0.5, skewX: 10, autoAlpha: 0, duration: p.speed * 1.3, ease: 'power3.in' }),
    ['Ship it', 'Dismiss']);
    return () => k.destroy();
  },
};
