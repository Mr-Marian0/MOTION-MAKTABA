/** Recoil Gallery: a draggable filmstrip with hard stops: fling it past the first or last photo and it hits the end, compresses, and recoils back like a sprung bumper. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo, PHOTOS } from './_tm.js';

export const meta = {
  title: 'Recoil Gallery',
  element: 'Gallery',
  trigger: ['Drag', 'Swipe', 'Keyboard'],
  behavior: ['Draggable', 'Boundary-aware', 'Elastic'],
  effect: ['Recoil-motion', 'Rebounding', 'Compression'],
  purpose: ['Navigation', 'Feedback', 'Affordance'],
  properties: ['Position', 'Scale'],
  description: 'A horizontal strip of photos you drag sideways. Inside its range it follows your finger and coasts to the nearest photo. Pull it past either end and it resists, the end photo squashing against the edge like a buffer; let go and it recoils, springing back past its rest point and settling. ←/→ step through, and pressing past the end bumps too.',
  params: [
    { key: 'give', label: 'Give', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: '', default: 0.3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Dots'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = PHOTOS.length + 1;
    k.html(`
      <div class="sp sp-tm sp-rcg">
        <div class="sp-rcg__view" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Photos, drag or use ← →">
          <div class="sp-rcg__strip">${Array.from({ length: n }, (_, i) => `<div class="sp-tm__frame sp-rcg__card">${photo(i, 'sp-rcg__img')}</div>`).join('')}</div>
        </div>
        <div class="sp-rcg__dots" aria-hidden="true">${'<i></i>'.repeat(n)}</div>
      </div>`);
    const view = k.$('.sp-rcg__view');
    const strip = k.$('.sp-rcg__strip');
    const cards = k.$$('.sp-rcg__card');
    const dots = k.$$('.sp-rcg__dots i');
    let STEP = 200, at = 0;
    k.resize(view, () => { STEP = cards[1].offsetLeft - cards[0].offsetLeft; gsap.set(strip, { x: -at * STEP }); });
    const mark = () => dots.forEach((d, i) => d.classList.toggle('is-on', i === at));
    mark();
    const settle = (i) => {
      at = Math.max(0, Math.min(n - 1, i));
      mark();
      gsap.to(strip, { x: -at * STEP, duration: reducedMotion ? 0 : 0.5, ease: 'power3.out', overwrite: true });
    };
    // Past an end: resistance while dragging, then a recoil (overshoot) on release; the end card squashes
    const bump = (dir) => {
      if (reducedMotion) return;
      const end = dir < 0 ? cards[0] : cards[n - 1];
      gsap.timeline()
        .to(strip, { x: -at * STEP - dir * STEP * p.give * 0.5, duration: 0.12, ease: 'power2.out' })
        .to(strip, { x: -at * STEP, duration: 0.7, ease: 'elastic.out(1.1, 0.35)' });
      gsap.fromTo(end, { scaleX: 1 }, { keyframes: { scaleX: [0.88, 1.04, 1] }, transformOrigin: dir < 0 ? '0% 50%' : '100% 50%', duration: 0.5 });
    };
    let x0 = null, s0 = 0;
    k.on(view, 'pointerdown', (e) => { view.setPointerCapture(e.pointerId); x0 = e.clientX; s0 = gsap.getProperty(strip, 'x'); gsap.killTweensOf(strip); });
    k.on(view, 'pointermove', (e) => {
      if (x0 === null) return;
      let x = s0 + (e.clientX - x0);
      const min = -(n - 1) * STEP;
      if (x > 0) x *= p.give; else if (x < min) x = min + (x - min) * p.give;
      gsap.set(strip, { x });
    });
    const drop = (e) => {
      if (x0 === null) return;
      const x = gsap.getProperty(strip, 'x');
      x0 = null;
      if (x > 0 || x < -(n - 1) * STEP) {
        gsap.to(strip, { x: x > 0 ? 0 : -(n - 1) * STEP, duration: reducedMotion ? 0 : 0.8, ease: 'elastic.out(1.1, 0.35)' });
        at = x > 0 ? 0 : n - 1; mark();
        gsap.fromTo(x > 0 ? cards[0] : cards[n - 1], { scaleX: 1 }, { keyframes: { scaleX: [0.88, 1.04, 1] }, transformOrigin: x > 0 ? '0% 50%' : '100% 50%', duration: 0.5 });
      } else settle(Math.round(-x / STEP));
    };
    k.on(view, 'pointerup', drop);
    k.on(view, 'pointercancel', drop);
    k.on(view, 'keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!d) return;
      e.preventDefault();
      if ((d < 0 && at === 0) || (d > 0 && at === n - 1)) bump(d);
      else settle(at + d);
    });
    return () => k.destroy();
  },
};
