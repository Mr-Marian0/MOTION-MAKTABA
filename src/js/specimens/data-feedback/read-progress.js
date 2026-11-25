/** Reading Progress: a bar tied to the scroll of an article; at 100% it bounces and turns green. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Reading Progress',
  element: 'Progress bar',
  trigger: ['Scroll'],
  behavior: ['Scroll-linked', 'Continuous', 'State-dependent'],
  effect: ['Stretching', 'Bouncing', 'Shimmering'],
  purpose: ['Progress', 'Orientation', 'Feedback'],
  properties: ['Size', 'Color'],
  description: 'A thin bar at the top of an article that fills as you scroll through it, with a light running along its tip. When you reach the end it bounces, turns green and says "Read". Scroll back and it follows.',
  params: [
    { key: 'thick', label: 'Thickness', group: 'Size', type: 'range', min: 2, max: 12, step: 1, unit: 'px', default: 5, css: '--sp-thick' },
    tone('#b3412e', 'tone', '--sp-accent', 'Bar color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-read-pg">
        <div class="sp-read-pg__bar" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="sp-read-pg__fill"></i><b class="sp-read-pg__done">Read ✓</b></div>
        <div class="sp-read-pg__scroller" data-lenis-prevent tabindex="0" aria-label="Article, scroll to read">
          <article><small>Scroll ↓</small><h4>The long article</h4>${bars(7)}${bars(7)}${bars(7)}</article>
        </div>
      </div>`);
    const bar = k.$('.sp-read-pg__bar');
    const fill = k.$('.sp-read-pg__fill');
    const done = k.$('.sp-read-pg__done');
    const scroller = k.$('.sp-read-pg__scroller');
    let finished = false;
    gsap.set(fill, { scaleX: 0 });
    gsap.set(done, { yPercent: -100, opacity: 0 });

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight || 1;
      const t = Math.min(1, scroller.scrollTop / max);
      gsap.to(fill, { scaleX: t, duration: reducedMotion ? 0 : 0.2, ease: 'power2.out', overwrite: 'auto' });
      bar.setAttribute('aria-valuenow', Math.round(t * 100));
      const end = t > 0.995;
      if (end === finished) return;
      finished = end;
      bar.classList.toggle('is-done', end);
      gsap.to(done, { yPercent: end ? 0 : -100, opacity: end ? 1 : 0, duration: reducedMotion ? 0 : 0.4, ease: 'back.out(2)' });
      if (end && !reducedMotion) gsap.fromTo(fill, { scaleY: 1 }, { keyframes: { scaleY: [2.2, 0.8, 1.3, 1] }, duration: 0.5 });
    };
    k.on(scroller, 'scroll', update, { passive: true });

    return () => k.destroy();
  },
};
