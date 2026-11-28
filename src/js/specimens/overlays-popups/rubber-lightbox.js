/** Rubber Lightbox: a gallery lightbox whose ends are elastic: past the first or last photo it stretches a little way, then recoils back into place. Between photos it slides. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Rubber Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Boundary-aware', 'Elastic', 'Keyboard-controlled', 'Sequential'],
  effect: ['Recoiling', 'Stretching', 'Sliding'],
  purpose: ['Feedback', 'Wayfinding', 'Affordance'],
  properties: ['Position', 'Scale'],
  description: 'A gallery lightbox with elastic ends. Arrows (or the arrow keys) slide between photos; try to go past the first or the last and the photo strip stretches a little way out as if on a rubber band, then recoils back into place, so you feel the end rather than nothing happening.',
  params: [
    { key: 'pull', label: 'Stretch', group: 'Motion', type: 'range', min: 2, max: 15, step: 1, unit: '%', default: 7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const HUES = [0, 40, 200];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-rub', `
      <div class="sp-ov__light sp-rub__light" role="dialog" aria-label="Gallery">
        <div class="sp-rub__strip">${HUES.map((h) => `<i class="sp-ov__photo sp-rub__img" style="filter:hue-rotate(${h}deg)"></i>`).join('')}</div>
        <button type="button" class="sp-rub__nav sp-rub__prev" aria-label="Previous">‹</button><button type="button" class="sp-rub__nav sp-rub__next" aria-label="Next">›</button>
        <span class="sp-rub__count" aria-live="polite">1 / ${HUES.length}</span>
      </div>`, { label: 'Gallery', title: 'Trip album', kick: 'Photos' }));
    const light = k.$('.sp-rub__light');
    const strip = k.$('.sp-rub__strip');
    const count = k.$('.sp-rub__count');
    let i = 0;
    gsap.set(light, { autoAlpha: 0 });
    const go = (d) => {
      const to = i + d;
      const t = reducedMotion ? 0 : 1;
      if (to < 0 || to >= HUES.length) {
        // At an end: stretch a little past it, then recoil back
        if (reducedMotion) return;
        gsap.timeline()
          .to(strip, { xPercent: (-i * 100) / HUES.length - (d * p.pull) / HUES.length, scaleX: 1 + p.pull / 200, transformOrigin: d > 0 ? '0% 50%' : '100% 50%', duration: 0.15, ease: 'power2.out' })
          .to(strip, { xPercent: (-i * 100) / HUES.length, scaleX: 1, duration: 0.7, ease: 'elastic.out(1.1, 0.35)' });
        return;
      }
      i = to;
      count.textContent = `${i + 1} / ${HUES.length}`;
      gsap.to(strip, { xPercent: (-i * 100) / HUES.length, duration: 0.5 * t, ease: 'power3.out' });
    };
    k.on(k.$('.sp-rub__prev'), 'click', () => go(-1));
    k.on(k.$('.sp-rub__next'), 'click', () => go(1));
    k.on(light, 'keydown', (e) => ({ ArrowLeft: () => go(-1), ArrowRight: () => go(1) })[e.key]?.());
    toggle(k, gsap, { reducedMotion }, (open) => gsap.timeline().to(light, { autoAlpha: open ? 1 : 0, scale: open ? 1 : 0.95, duration: 0.3 }), ['Gallery', 'Close']);
    return () => k.destroy();
  },
};
