/** Scale Lightbox: click a thumbnail and the photo scales straight up out of it to fill the lightbox; closing scales it back down into the same thumbnail. */
import { kit, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Scale Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Position-aware', 'Reversible', 'Toggle-dependent'],
  effect: ['Scaling', 'Sliding'],
  purpose: ['Focus', 'Continuity'],
  properties: ['Scale', 'Position'],
  description: 'A photo strip whose thumbnails open by scaling. Click one and its photo grows straight up out of the thumbnail, moving and scaling as one piece until it fills the lightbox; close it (or press Esc) and it shrinks back down into exactly the thumbnail it came from.',
  params: [
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.2, max: 1.4, step: 0.1, unit: 's', default: 0.6, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Expo', live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const HUES = [0, 40, 200, 300];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-scl">
        ${page('Field trip', 'Photos')}
        <div class="sp-ov__thumbs">${HUES.map((h, i) => `<button type="button" class="sp-ov__thumb sp-ov__photo" style="filter:hue-rotate(${h}deg)" aria-label="Open photo ${i + 1}"></button>`).join('')}</div>
        <i class="sp-ov__scrim"></i>
        <div class="sp-ov__light sp-ov__photo sp-scl__light" role="dialog" aria-label="Photo"><button type="button" class="sp-ov__btn sp-scl__close">Close</button></div>
      </div>`);
    const light = k.$('.sp-scl__light');
    const scrim = k.$('.sp-ov__scrim');
    const thumbs = k.$$('.sp-ov__thumb');
    const close = k.$('.sp-scl__close');
    gsap.set([light, scrim], { autoAlpha: 0 });
    let from = null;
    let tl;
    // The transform that puts the lightbox exactly over a thumbnail (layout boxes, so no scaling ancestors involved).
    const over = (th) => {
      const sx = th.offsetWidth / light.offsetWidth;
      const sy = th.offsetHeight / light.offsetHeight;
      const lx = light.offsetLeft;
      const ly = light.offsetTop;
      const [tx, ty] = [th.offsetLeft + th.parentElement.offsetLeft, th.offsetTop + th.parentElement.offsetTop];
      return { x: tx - lx, y: ty - ly, scaleX: sx, scaleY: sy };
    };
    const set = (th) => {
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      const ease = EASES[p.ease] || 'expo.out';
      if (th) {
        from = th;
        light.style.filter = th.style.filter;
        tl = gsap.timeline()
          .fromTo(light, { ...over(th), autoAlpha: 1, transformOrigin: '0 0' }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: t, ease })
          .to(scrim, { autoAlpha: 1, duration: t * 0.6 }, 0);
        close.focus();
      } else if (from) {
        tl = gsap.timeline()
          .to(light, { ...over(from), duration: t * 0.8, ease: 'power3.inOut' })
          .to(scrim, { autoAlpha: 0, duration: t * 0.6 }, 0)
          .set(light, { autoAlpha: 0 });
        from.focus();
        from = null;
      }
    };
    thumbs.forEach((th) => k.on(th, 'click', () => set(th)));
    k.on(close, 'click', () => set(null));
    k.on(scrim, 'click', () => set(null));
    k.on(k.$('.sp-ov'), 'keydown', (e) => e.key === 'Escape' && from && (e.stopPropagation(), set(null)));
    return () => { tl?.kill(); k.destroy(); };
  },
};
