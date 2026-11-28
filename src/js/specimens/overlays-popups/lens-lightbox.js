/** Lens Lightbox: the photo opens through a lens: it swells out of a bulging circle and settles flat, and a loupe magnifies whatever the pointer is over. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Lens Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard', 'Cursor move'],
  behavior: ['Toggle-dependent', 'Cursor-following', 'Reversible'],
  effect: ['Optical-warping', 'Refraction-motion', 'Expansion'],
  purpose: ['Focus', 'Delight', 'Orientation'],
  properties: ['Clip & mask', 'Scale', 'Position'],
  description: 'A lightbox seen through glass. It opens as a lens: a circle of photo, magnified and bulging, widens until it fills the frame and the picture relaxes back to true size. Once open, a loupe follows the pointer and shows the spot under it enlarged; the arrow keys move it too.',
  params: [
    { key: 'zoom', label: 'Loupe zoom', group: 'Motion', type: 'range', min: 1.5, max: 4, step: 0.25, unit: '×', default: 2.5, live: true },
    { key: 'loupe', label: 'Loupe size', group: 'Shape', type: 'range', min: 3, max: 9, step: 0.5, unit: 'em', default: 6 },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-lns', `
      <div class="sp-ov__light sp-lns__light" role="dialog" aria-label="Photo, magnifier: arrow keys" tabindex="0">
        <i class="sp-ov__photo sp-lns__img"></i>
        <div class="sp-lns__loupe" aria-hidden="true"><i class="sp-ov__photo sp-lns__zoom"></i></div>
      </div>`, { label: 'View photo', title: 'Dunes', kick: 'Photos' }));
    const light = k.$('.sp-lns__light');
    const img = k.$('.sp-lns__img');
    const loupe = k.$('.sp-lns__loupe');
    const zoom = k.$('.sp-lns__zoom');
    loupe.style.setProperty('--d', `${p.loupe}em`);
    gsap.set(light, { autoAlpha: 0 });
    gsap.set(loupe, { autoAlpha: 0 });
    gsap.set(zoom, { transformOrigin: '0 0' });
    // Box size is measured on resize, never per move. The zoomed copy is the photo at full size,
    // scaled and shifted so the spot under the pointer sits at the loupe's centre.
    let W = 0, H = 0, R = 0, at = [0.5, 0.5];
    const lx = gsap.quickTo(loupe, 'x', { duration: 0.15 }), ly = gsap.quickTo(loupe, 'y', { duration: 0.15 });
    const zx = gsap.quickTo(zoom, 'x', { duration: 0.15 }), zy = gsap.quickTo(zoom, 'y', { duration: 0.15 });
    const aim = (u, v) => {
      at = [Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v))];
      const [x, y] = [at[0] * W, at[1] * H];
      lx(x - R); ly(y - R);
      zx(R - x * p.zoom); zy(R - y * p.zoom);
    };
    k.resize(light, () => {
      [W, H, R] = [light.clientWidth, light.clientHeight, loupe.offsetWidth / 2];
      gsap.set(zoom, { width: W, height: H, scale: p.zoom });
      aim(...at);
    });
    let box;
    k.on(light, 'pointerenter', () => { box = light.getBoundingClientRect(); gsap.to(loupe, { autoAlpha: 1, scale: 1, duration: 0.2, overwrite: 'auto' }); });
    k.on(light, 'pointermove', (e) => box && aim((e.clientX - box.left - light.clientLeft) / W, (e.clientY - box.top - light.clientTop) / H));
    k.on(light, 'pointerleave', () => gsap.to(loupe, { autoAlpha: 0, scale: 0.6, duration: 0.2, overwrite: 'auto' }));
    k.on(light, 'focus', () => gsap.to(loupe, { autoAlpha: 1, scale: 1, duration: 0.2, overwrite: 'auto' }));
    k.on(light, 'blur', () => gsap.to(loupe, { autoAlpha: 0, duration: 0.2, overwrite: 'auto' }));
    k.on(light, 'keydown', (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (d) e.preventDefault(), aim(at[0] + d[0] * 0.08, at[1] + d[1] * 0.08);
    });
    // The lens: a circular window (clip) widening while the photo inside shrinks from magnified to 1:1.
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .set(light, { autoAlpha: 1 })
          .fromTo(light, { '--r': '0%' }, { '--r': '75%', duration: p.time, ease: 'power2.inOut' }, 0)
          .fromTo(img, { scale: 2.2 }, { scale: 1, duration: p.time * 1.1, ease: 'power3.out' }, 0)
      : gsap.timeline()
          .to(img, { scale: 2.2, duration: p.time * 0.7, ease: 'power2.in' }, 0)
          .to(light, { '--r': '0%', duration: p.time * 0.7, ease: 'power2.in' }, 0)
          .set(light, { autoAlpha: 0 }), ['View photo', 'Close']);
    return () => k.destroy();
  },
};
