/** Blob Toast: the toast oozes in as a wobbling blob of ink, stretches out into a pill and the message settles in; dismissing it shrinks it back to a blob that pops. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Blob Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Elastic', 'Reversible'],
  effect: ['Blob-morphing', 'Stretching', 'Wobbling'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Shape', 'Radius', 'Scale'],
  description: 'A toast that arrives as a drop of ink. It appears as a small wobbling blob, its outline wandering, then stretches sideways into a pill and the message fades in. Dismissing it shrinks it back into a blob that wobbles once and pops.',
  params: [
    { key: 'wobble', label: 'Wobble', group: 'Motion', type: 'range', min: 0.2, max: 0.9, step: 0.05, unit: '', default: 0.4, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Dot'),
  ],
};

const BLOBS = ['46% 54% 60% 40% / 52% 40% 60% 48%', '60% 40% 45% 55% / 40% 58% 42% 60%', '50%'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-blt', `<div class="sp-ov__toast sp-blt__toast" role="status"><i></i><span>Draft saved to Boards</span></div>`, { label: 'Save', scrim: false, title: 'Untitled board' }));
    const toast = k.$('.sp-blt__toast');
    const text = k.$$('.sp-blt__toast > *');
    gsap.set(toast, { autoAlpha: 0, transformOrigin: '100% 100%' });
    toggle(k, gsap, { reducedMotion }, (open) => {
      const t = p.time;
      return open
        ? gsap.timeline()
            .set(text, { autoAlpha: 0 })
            .fromTo(toast, { autoAlpha: 1, scaleX: 0.16, scaleY: 0.55, borderRadius: BLOBS[0] }, { scaleX: 0.2, scaleY: 0.6, borderRadius: BLOBS[1], duration: t * 0.35, ease: 'sine.inOut' })
            .to(toast, { scaleX: 1, scaleY: 1, borderRadius: '0.5em', duration: t * 0.8, ease: `elastic.out(1, ${p.wobble})` })
            .to(text, { autoAlpha: 1, duration: t * 0.3, stagger: 0.05 }, '-=0.5')
        : gsap.timeline()
            .to(text, { autoAlpha: 0, duration: 0.12 })
            .to(toast, { scaleX: 0.18, scaleY: 0.6, borderRadius: BLOBS[0], duration: t * 0.4, ease: 'power3.in' })
            .to(toast, { scale: 0.9, borderRadius: BLOBS[1], duration: 0.12 })
            .to(toast, { scale: 0, autoAlpha: 0, duration: 0.15, ease: 'back.in(3)' });
    }, ['Save', 'Dismiss']);
    return () => k.destroy();
  },
};
