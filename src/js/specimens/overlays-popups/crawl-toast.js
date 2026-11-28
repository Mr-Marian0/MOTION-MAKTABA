/** Crawl Toast: the toast inches in from the edge like a caterpillar: the front stretches forward, then the back pulls up behind it, step after step, until it arrives. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Crawl Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'Periodic', 'Elastic'],
  effect: ['Crawling', 'Stretching', 'Contracting'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Scale', 'Position'],
  description: 'A slow-news toast that crawls in. It inches in from the right edge like a caterpillar: its front end stretches forward and flattens, then its back end pulls up to meet it, step after step, until it arrives in the corner. Dismissing it crawls it back out.',
  params: [
    { key: 'steps', label: 'Steps', group: 'Motion', type: 'range', min: 3, max: 10, step: 1, unit: '', default: 4 },
    { key: 'stretch', label: 'Stretch', group: 'Shape', type: 'range', min: 0.1, max: 0.5, step: 0.05, unit: '×', default: 0.3, live: true },
    { key: 'pace', label: 'Step time', group: 'Motion', type: 'range', min: 0.1, max: 0.5, step: 0.02, unit: 's', default: 0.18, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-crw', `<div class="sp-ov__toast sp-crw__toast" role="status"><i></i><span>Your weekly digest is ready</span></div>`, { label: 'Notify', scrim: false, title: 'Reading list' }));
    const toast = k.$('.sp-crw__toast');
    gsap.set(toast, { autoAlpha: 0 });
    // One inchworm step toward dir (-1 = left): the front stretches (anchored at the back), then the
    // back catches up (anchored at the front). Re-anchoring shifts x so nothing jumps.
    const crawl = (dir) => {
      const W = toast.offsetWidth;
      const n = Math.round(p.steps);
      const s = p.stretch;
      const [back, front] = dir < 0 ? ['100% 50%', '0% 50%'] : ['0% 50%', '100% 50%'];
      const tl = gsap.timeline();
      if (dir < 0) tl.set(toast, { x: n * s * W, autoAlpha: 1, scaleX: 1 });
      for (let i = 0; i < n; i++) {
        tl.set(toast, { transformOrigin: back })
          .to(toast, { scaleX: 1 + s, scaleY: 0.88, duration: p.pace, ease: 'sine.inOut' })
          .set(toast, { transformOrigin: front, x: `+=${dir * s * W}` })
          .to(toast, { scaleX: 1, scaleY: 1, duration: p.pace, ease: 'sine.inOut' });
      }
      if (dir > 0) tl.set(toast, { autoAlpha: 0 });
      return tl;
    };
    toggle(k, gsap, { reducedMotion }, (open) => (reducedMotion ? gsap.timeline().set(toast, { autoAlpha: open ? 1 : 0, x: 0 }) : crawl(open ? -1 : 1)), ['Notify', 'Dismiss']);
    return () => k.destroy();
  },
};
