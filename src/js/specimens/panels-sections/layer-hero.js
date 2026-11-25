/** Layered Hero: paper layers drift at different depths with the cursor; the headline rises in letter by letter. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Paper Diorama Hero',
  element: 'Hero section',
  trigger: ['Load', 'In view', 'Cursor move'],
  behavior: ['Multi-layer parallax', 'Pointer-tracking', 'Staggered', 'Load-dependent'],
  effect: ['Rising', 'Drifting', 'Splitting'],
  purpose: ['Branding', 'Storytelling', 'Delight'],
  properties: ['Position', 'Opacity', 'Typography'],
  description: 'A hero built from cut-paper layers: sun, hills and fields. Each layer drifts with the cursor at its own depth, and the headline rises in letter by letter whenever it comes into view.',
  params: [
    { key: 'headline', label: 'Headline', group: 'Content', type: 'text', default: 'Made by hand' },
    { key: 'depth', label: 'Depth', group: 'Motion', type: 'range', min: 0, max: 40, step: 1, unit: 'px', default: 18, live: true },
    { key: 'stagger', label: 'Letter stagger', group: 'Motion', type: 'range', min: 0, max: 0.12, step: 0.01, unit: 's', default: 0.04, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-dio">
        <i class="sp-dio__layer sp-dio__sun" data-d="0.3"></i>
        <i class="sp-dio__layer sp-dio__hill sp-dio__hill--back" data-d="0.6"></i>
        <i class="sp-dio__layer sp-dio__hill sp-dio__hill--front" data-d="1"></i>
        <div class="sp-dio__copy" data-d="1.4">
          <small>Vol. 01</small>
          <h4 aria-label="${esc(p.headline)}">${[...String(p.headline)].map((c) => `<span class="sp-dio__ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</h4>
        </div>
      </div>`);
    const root = k.$('.sp-dio');
    const layers = k.$$('[data-d]');
    const chars = k.$$('.sp-dio__ch');

    k.inView(root, () => {
      if (reducedMotion) return;
      gsap.fromTo(chars, { yPercent: 110, rotation: 8 }, { yPercent: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: Number(p.stagger) });
    });
    k.on(root, 'pointermove', (e) => {
      if (reducedMotion) return;
      const r = root.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => gsap.to(l, { x: -x * p.depth * l.dataset.d, y: -y * p.depth * l.dataset.d * 0.6, duration: 0.8, ease: 'power3.out' }));
    });
    k.on(root, 'pointerleave', () => gsap.to(layers, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.6)' }));

    return () => k.destroy();
  },
};
