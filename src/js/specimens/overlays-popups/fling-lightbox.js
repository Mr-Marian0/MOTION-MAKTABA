/** Fling Lightbox: drag the photo strip and let go: it keeps the speed of your flick and coasts on its momentum, slowing with friction, until it settles on the nearest photo. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Fling Lightbox',
  element: 'Lightbox',
  trigger: ['Drag', 'Swipe', 'Keyboard'],
  behavior: ['Momentum-driven', 'Velocity-aware', 'Friction-responsive', 'Snapping'],
  effect: ['Momentum-motion', 'Inertial-motion', 'Decelerating', 'Sliding'],
  purpose: ['Affordance', 'Delight', 'Navigation'],
  properties: ['Position'],
  description: 'A gallery lightbox you can flick. Drag the photo strip and let go: it carries on at the speed of your flick, slowing down under friction, a fast flick coasting past several photos, and finally snaps onto whichever photo it is nearest. Arrow keys step one at a time.',
  params: [
    { key: 'friction', label: 'Friction', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: '', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const HUES = [0, 30, 60, 160, 200, 260, 300];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-flg', `
      <div class="sp-ov__light sp-flg__light" role="dialog" aria-label="Gallery" tabindex="0">
        <div class="sp-flg__strip">${HUES.map((h) => `<i class="sp-ov__photo sp-flg__img" style="filter:hue-rotate(${h}deg)"></i>`).join('')}</div>
        <span class="sp-flg__dots">${HUES.map(() => '<i></i>').join('')}</span>
      </div>`, { label: 'Gallery', title: 'Trip album', kick: 'Photos' }));
    const light = k.$('.sp-flg__light');
    const strip = k.$('.sp-flg__strip');
    const dots = k.$$('.sp-flg__dots i');
    gsap.set(light, { autoAlpha: 0 });
    let w = 1; // lightbox width, read on resize only (mark() runs every frame)
    k.resize(light, () => (w = light.clientWidth));
    const W = () => w;
    const mark = () => dots.forEach((d, j) => d.classList.toggle('is-on', j === Math.round(-gsap.getProperty(strip, 'x') / W())));
    // Coast from the release velocity (px/s) with constant friction, then land on the nearest photo.
    const coast = (v) => {
      const x = gsap.getProperty(strip, 'x');
      const decel = 1500 * p.friction;
      const glide = (v * Math.abs(v)) / (2 * decel); // distance until friction stops it
      const target = clamp(Math.round((x + glide) / W()) * W(), -(HUES.length - 1) * W(), 0);
      const t = reducedMotion ? 0 : clamp(Math.abs(v) / decel, 0.35, 1.6);
      gsap.to(strip, { x: target, duration: t, ease: 'power3.out', onUpdate: mark, overwrite: true });
    };
    let drag = null;
    k.on(light, 'pointerdown', (e) => {
      light.setPointerCapture(e.pointerId);
      gsap.killTweensOf(strip);
      drag = { x0: e.clientX, s0: gsap.getProperty(strip, 'x'), last: e.clientX, t: performance.now(), v: 0 };
    });
    k.on(light, 'pointermove', (e) => {
      if (!drag) return;
      const now = performance.now();
      const dt = Math.max(now - drag.t, 1) / 1000;
      drag.v = drag.v * 0.6 + ((e.clientX - drag.last) / dt) * 0.4; // smoothed velocity
      drag.last = e.clientX;
      drag.t = now;
      const max = (HUES.length - 1) * W();
      let x = drag.s0 + (e.clientX - drag.x0);
      if (x > 0) x *= 0.35; else if (x < -max) x = -max + (x + max) * 0.35; // resistance past the ends
      gsap.set(strip, { x });
      mark();
    });
    k.on(window, 'pointerup', () => drag && (coast(drag.v), (drag = null)));
    k.on(light, 'keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!d) return;
      const i = clamp(Math.round(-gsap.getProperty(strip, 'x') / W()) + d, 0, HUES.length - 1);
      gsap.to(strip, { x: -i * W(), duration: reducedMotion ? 0 : 0.45, ease: 'power3.out', onUpdate: mark, overwrite: true });
    });
    mark();
    toggle(k, gsap, { reducedMotion }, (open) => gsap.timeline().to(light, { autoAlpha: open ? 1 : 0, scale: open ? 1 : 0.95, duration: 0.3 }), ['Gallery', 'Close']);
    return () => k.destroy();
  },
};
