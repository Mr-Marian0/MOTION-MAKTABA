/** Curve Gallery: click a thumbnail and it flies up to the main view along a curving Bézier path, growing and turning as it goes, while the old picture drops back down into the thumbnail strip. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo, PHOTOS } from './_tm.js';

export const meta = {
  title: 'Curve Gallery',
  element: 'Gallery',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Position-aware', 'Sequential', 'Reversible'],
  effect: ['Bezier-path-motion', 'Curved-path-motion', 'Scaling'],
  purpose: ['Navigation', 'Continuity'],
  properties: ['Path', 'Position', 'Scale', 'Rotation'],
  description: 'A gallery with a strip of thumbnails under a big view. Choose a thumbnail and a copy of it lifts off and flies to the main view along a swooping Bézier curve, growing to full size and rolling slightly through the turn, landing as the new main picture; the thumbnail it left is outlined as current.',
  params: [
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'swoop', label: 'Swoop', group: 'Shape', type: 'range', min: 0, max: 2, step: 0.1, unit: '', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Current'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-cgl">
        <div class="sp-cgl__wrap">
          <div class="sp-tm__frame sp-cgl__main" role="img" aria-label="Photo 1 of ${PHOTOS.length}" aria-live="polite">${photo(0, 'sp-cgl__img')}</div>
          <div class="sp-cgl__strip">${PHOTOS.map((_, i) => `<button type="button" class="sp-cgl__thumb" aria-label="Show photo ${i + 1}" aria-current="${!i}">${photo(i, 'sp-cgl__img')}</button>`).join('')}</div>
          <span class="sp-cgl__air" aria-hidden="true"></span>
        </div>
      </div>`);
    const wrap = k.$('.sp-cgl__wrap');
    const main = k.$('.sp-cgl__main');
    const air = k.$('.sp-cgl__air');
    const thumbs = k.$$('.sp-cgl__thumb');
    let at = 0;
    thumbs.forEach((t, i) => k.on(t, 'click', () => {
      if (i === at) return;
      at = i;
      thumbs.forEach((x, j) => x.setAttribute('aria-current', String(j === i)));
      main.setAttribute('aria-label', `Photo ${i + 1} of ${PHOTOS.length}`);
      if (reducedMotion) return (main.innerHTML = photo(i, 'sp-cgl__img'));
      // From the thumb's box to the main box (wrap pixels, measured once), along a cubic Bézier
      const w = wrap.getBoundingClientRect(), a = t.getBoundingClientRect(), b = main.getBoundingClientRect();
      const A = [a.left - w.left, a.top - w.top], B = [b.left - w.left, b.top - w.top];
      const side = A[0] < B[0] + b.width / 2 ? -1 : 1;
      const C1 = [A[0] + side * w.width * 0.35 * p.swoop, A[1] - w.height * 0.15];
      const C2 = [B[0] - side * w.width * 0.25 * p.swoop, B[1] + w.height * 0.5];
      const bez = (u, i2) => (1 - u) ** 3 * A[i2] + 3 * (1 - u) ** 2 * u * C1[i2] + 3 * (1 - u) * u * u * C2[i2] + u ** 3 * B[i2];
      const fly = document.createElement('div');
      fly.className = 'sp-cgl__fly sp-tm__frame';
      fly.innerHTML = photo(i, 'sp-cgl__img');
      air.append(fly);
      // The copy is laid out once at the main view's size and only scaled + moved per frame (no layout)
      gsap.set(fly, { width: b.width, height: b.height, transformOrigin: '0% 0%' });
      const s0 = a.width / b.width;
      const s = { u: 0 };
      gsap.to(s, { u: 1, duration: p.time, ease: 'power2.inOut', onUpdate: () => {
        const u = s.u;
        gsap.set(fly, { x: bez(u, 0), y: bez(u, 1), scale: s0 + (1 - s0) * u, rotation: side * 10 * Math.sin(u * Math.PI) });
      }, onComplete: () => { main.innerHTML = photo(i, 'sp-cgl__img'); fly.remove(); } });
    }));
    return () => k.destroy();
  },
};
