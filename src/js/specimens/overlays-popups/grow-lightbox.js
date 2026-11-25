/** Grow Lightbox: a thumbnail grows into the full view; swipe/arrows to move; drag down to close, the dark fades with distance. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Pull-to-close Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Swipe', 'Drag', 'Keyboard'],
  behavior: ['Activation-dependent', 'Gesture-driven', 'Swipe-controlled', 'Velocity-aware', 'Looping'],
  effect: ['Morphing-transition', 'Expansion', 'Sliding', 'Dissolving'],
  purpose: ['Focus', 'Continuity', 'Storytelling'],
  properties: ['Size', 'Position', 'Opacity', 'Scale'],
  description: 'A photo grid whose thumbnails grow straight into the full view. Swipe sideways or use the arrows to move between photos (it loops), and drag down to close: the darkness fades the further you pull, and the photo flies back to its thumbnail.',
  params: [
    { key: 'speed', label: 'Grow time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.5, live: true },
    { key: 'pull', label: 'Pull to close', group: 'Behavior', type: 'range', min: 10, max: 50, step: 5, unit: '%', default: 25, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

const N = 4;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-lb">
        <div class="sp-lb__grid">${Array.from({ length: N }, (_, i) => `<button type="button" class="sp-lb__thumb" style="--i:${i}" aria-label="Open photo ${i + 1}"><span class="sp-lb__pic" style="--i:${i}"></span></button>`).join('')}</div>
        <div class="sp-lb__view" role="dialog" aria-label="Photo viewer" hidden>
          <div class="sp-lb__dark"></div>
          <span class="sp-lb__pic sp-lb__big"></span>
          <button type="button" class="sp-lb__nav" data-step="-1" aria-label="Previous photo">←</button>
          <button type="button" class="sp-lb__nav" data-step="1" aria-label="Next photo">→</button>
          <button type="button" class="sp-lb__close" aria-label="Close">✕</button>
          <small class="sp-lb__hint">Swipe ← → · drag down to close</small>
        </div>
      </div>`);
    const view = k.$('.sp-lb__view');
    const dark = k.$('.sp-lb__dark');
    const big = k.$('.sp-lb__big');
    const thumbs = k.$$('.sp-lb__thumb');
    const t = () => (reducedMotion ? 0 : Number(p.speed));
    let at = 0;

    const rectOf = (el) => {
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
    };
    const FULL = { left: '12%', top: '8%', width: '76%', height: '84%' };
    const open = (i) => {
      at = i;
      big.style.setProperty('--i', i);
      view.hidden = false;
      gsap.fromTo(big, { ...rectOf(thumbs[i]), x: 0, y: 0 }, { ...FULL, duration: t(), ease: 'expo.out' });
      gsap.fromTo(dark, { opacity: 0 }, { opacity: 1, duration: t() });
      k.$('.sp-lb__close').focus({ preventScroll: true });
    };
    const close = () => {
      gsap.to(big, { ...rectOf(thumbs[at]), x: 0, y: 0, duration: t(), ease: 'power3.inOut', onComplete: () => (view.hidden = true) });
      gsap.to(dark, { opacity: 0, duration: t() });
      thumbs[at].focus({ preventScroll: true });
    };
    const go = (step) => {
      at = (at + step + N) % N;
      const w = big.offsetWidth;
      gsap.timeline()
        .to(big, { x: -step * w * 0.3, opacity: 0, duration: t() * 0.5, ease: 'power2.in' })
        .add(() => big.style.setProperty('--i', at))
        .fromTo(big, { x: step * w * 0.3 }, { x: 0, opacity: 1, duration: t() * 0.6, ease: 'power3.out' });
    };

    thumbs.forEach((b, i) => k.on(b, 'click', () => open(i)));
    k.$$('.sp-lb__nav').forEach((b) => k.on(b, 'click', () => go(Number(b.dataset.step))));
    k.on(k.$('.sp-lb__close'), 'click', close);
    k.on(view, 'keydown', (e) => {
      if (e.key === 'Escape') e.stopPropagation(), close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });

    // Drag: sideways = next/previous, down = close (the dark fades with the distance).
    let start = null;
    k.on(big, 'pointerdown', (e) => {
      start = { x: e.clientX, y: e.clientY };
      big.setPointerCapture(e.pointerId);
    });
    k.on(big, 'pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = Math.max(0, e.clientY - start.y);
      const pull = clamp(dy / stage.clientHeight, 0, 1);
      gsap.set(big, { x: dx, y: dy, scale: 1 - pull * 0.3 });
      gsap.set(dark, { opacity: 1 - pull * 1.5 });
    });
    k.on(big, 'pointerup', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (dy > (stage.clientHeight * p.pull) / 100) return gsap.set(big, { scale: 1 }), close();
      gsap.to(big, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      gsap.to(dark, { opacity: 1, duration: 0.3 });
      if (Math.abs(dx) > big.offsetWidth * 0.25) go(dx < 0 ? 1 : -1);
    });

    return () => k.destroy();
  },
};
