/** Snow Modal: the winter-sale modal is built by snowfall: flakes drift down and settle, piling up into the shape of the modal until it is solid, then the message appears. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Snow Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Randomized', 'Staggered'],
  effect: ['Accumulation', 'Drifting', 'Falling', 'Shape-assembly'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'A winter-sale modal made of snow. Flakes drift down from the top of the page, swaying as they fall, and settle into the modal\'s outline, piling up until the shape is filled in; then the modal turns solid and the sale message appears. Closing lets it thaw away.',
  params: [
    { key: 'flakes', label: 'Flakes', group: 'Shape', type: 'range', min: 30, max: 140, step: 10, unit: '', default: 80 },
    { key: 'time', label: 'Snowfall', group: 'Motion', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 's', default: 1.6, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.flakes);
    k.html(scene('sp-snw', `
      <div class="sp-snw__box">
        <div class="sp-snw__flakes" aria-hidden="true">${'<i></i>'.repeat(n)}</div>
        <div class="sp-ov__card sp-snw__modal" role="dialog" aria-label="Winter sale"><span class="sp-ov__kick">Winter sale</span><b class="sp-ov__title">30% off all paper</b><span class="sp-ov__text">Until the snow melts (Sunday).</span></div>
      </div>`, { label: 'Sale', title: 'Shop' }));
    const box = k.$('.sp-snw__box');
    const modal = k.$('.sp-snw__modal');
    const flakes = k.$$('.sp-snw__flakes i');
    gsap.set([box, modal], { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) return gsap.timeline().to(box, { autoAlpha: 0, scale: 0.97, duration: 0.5 });
      // Each flake lands somewhere inside the modal's area, filling it bottom-first (lower spots land first).
      // Transforms in px (measured once here), not top/left, so 100+ falling flakes cost no layout.
      const [W, H] = [box.offsetWidth, box.offsetHeight];
      const tl = gsap.timeline().set(box, { autoAlpha: 1, scale: 1 }).set(modal, { autoAlpha: 0 });
      flakes.forEach((f) => {
        const [x, y] = [Math.random() * W, Math.random() * H];
        const at = (1 - y / H) * p.time * 0.6 + Math.random() * p.time * 0.3;
        tl.fromTo(f, { x: x + (Math.random() - 0.5) * W * 0.3, y: -H * 1.4, autoAlpha: 1, scale: 0.6 + Math.random() * 0.6 },
          { x, y, duration: p.time * 0.5, ease: 'sine.out' }, at);
      });
      return tl.to(modal, { autoAlpha: 1, duration: 0.4 }).to(flakes, { autoAlpha: 0, duration: 0.4 }, '<0.1');
    }, ['Sale', 'Close']);
    return () => k.destroy();
  },
};
