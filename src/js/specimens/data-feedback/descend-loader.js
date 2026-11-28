/** Descend Loader: a loading indicator where little blocks step down a staircase one stair at a time, each one easing gently onto the next stair before stepping again; at the bottom they reappear at the top. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Descend Loader',
  element: 'Loader',
  trigger: ['Load', 'Idle'],
  behavior: ['Looping', 'Staggered', 'Sequential'],
  effect: ['Descending', 'Sliding', 'Squashing'],
  purpose: ['Progress', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A "fetching your files" loader built from a five-step staircase. Three small blocks walk down it in a line: each one slides over the edge of its stair and drops gently onto the next, squashing a little as it lands, the next block one step behind. At the bottom a block fades out and reappears on the top stair, so the descent never ends. It runs only while visible.',
  params: [
    { key: 'pace', label: 'Step time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Blocks'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const STAIRS = 5;
    k.html(`
      <div class="sp sp-df sp-dsl">
        <div class="sp-dsl__stairs" role="status" aria-label="Fetching your files">${Array.from({ length: STAIRS }, (_, i) => `<i class="sp-dsl__stair" style="--i:${i}"></i>`).join('')}${'<b class="sp-dsl__blk"></b>'.repeat(3)}</div>
        <small class="sp-df__kick">Fetching your files…</small>
      </div>`);
    const blks = k.$$('.sp-dsl__blk');
    // Stair size is measured first; the walk is (re)built from it on every resize
    let SW = 30, SH = 20, runs = [];
    const build = () => {
      runs.forEach((r) => r.kill());
      if (reducedMotion) { blks.forEach((b, i) => gsap.set(b, { x: i * 2 * SW, y: i * 2 * SH, autoAlpha: 1 })); return (runs = []); }
      runs = blks.map((b, i) => trip(b).delay(i * p.pace * 1.1));
    };
    k.resize(k.$('.sp-dsl__stairs'), () => { const s = k.$('.sp-dsl__stair'); SW = s.offsetWidth; SH = s.offsetHeight; build(); });
    // one block's full trip down: slide across a stair, drop onto the next (squash), repeat; then fade and restart at the top
    const trip = (b) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.set(b, { x: 0, y: 0, autoAlpha: 0 }).to(b, { autoAlpha: 1, duration: 0.2 });
      for (let i = 1; i < STAIRS; i++) {
        tl.to(b, { x: i * SW, duration: p.pace * 0.5, ease: 'power1.inOut' })
          .to(b, { y: i * SH, duration: p.pace * 0.35, ease: 'power2.in' })
          .to(b, { keyframes: { scaleY: [0.7, 1], scaleX: [1.2, 1] }, duration: p.pace * 0.25, ease: 'none' });
      }
      return tl.to(b, { autoAlpha: 0, duration: 0.2 });
    };
    gsap.set(blks, { transformOrigin: '50% 100%' });
    return () => { runs.forEach((r) => r.kill()); k.destroy(); };
  },
};
