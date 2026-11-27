/**
 * Bend Flex: a product card that bends like a thin sheet. It is a chain of narrow strips hinged to each other,
 * spreading out from the middle; every strip turns a little on the one before, so the card curves smoothly.
 */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Bend Flex',
  element: 'Product card',
  trigger: ['Drag', 'Hover', 'Keyboard'],
  behavior: ['Draggable', 'Elastic', 'Hover-dependent', 'Constrained', 'Spring-driven'],
  effect: ['Bending', 'Damped-oscillation', 'Axial-rotation'],
  purpose: ['Delight', 'Affordance', 'Storytelling'],
  properties: ['Shape', 'Rotation', 'Depth (z)', 'Color'],
  description: 'A card for a flexible sketch pad that bends like the real thing. Hover and it flexes slightly; drag left or right to bow it toward or away from you, shading deepening along the curve. Let go and it springs flat with a wobble.',
  params: [
    { key: 'max', label: 'Max bend', group: 'Shape', type: 'range', min: 20, max: 140, step: 10, unit: '°', default: 90, live: true },
    { key: 'strips', label: 'Strips per side', group: 'Shape', type: 'range', min: 3, max: 10, step: 1, unit: '', default: 7 },
    { key: 'spring', label: 'Springiness', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: '', default: 0.3, live: true },
    tone('#2f4a6b'),
  ],
};

const W = 15; // card width in em

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.strips);
    const w = W / 2 / n;
    const cardHTML = `
      <article class="sp-cc__card sp-bnd__card">
        <i class="sp-cc__img sp-bnd__img"></i>
        <b class="sp-cc__title">Flex Pad</b>
        <span class="sp-cc__text">Bendable sketch pad · A5</span>
        <div class="sp-cc__row"><b class="sp-cc__price">$22</b><span class="sp-cc__btn">Add</span></div>
      </article>`;
    // A chain of strips: each holds its slice of the card (offset so the slices line up) and the next strip.
    const chain = (side, i) => {
      if (i >= n) return '';
      const offset = side === 'r' ? -(W / 2 + i * w) : -(W / 2 - (i + 1) * w);
      return `<div class="sp-bnd__strip sp-bnd__strip--${side}" style="width:${w}em">
        <div class="sp-bnd__face"><div style="translate:${offset}em 0">${cardHTML}</div><i class="sp-bnd__shade"></i></div>
        ${chain(side, i + 1)}
      </div>`;
    };
    k.html(`
      <div class="sp sp-cc sp-bnd">
        <div class="sp-cc__wrap sp-bnd__wrap" tabindex="0" role="img" aria-label="Flex Pad card: drag or use arrow keys to bend it">
          <div class="sp-bnd__size">${cardHTML}</div>
          <div class="sp-bnd__root sp-bnd__root--r">${chain('r', 0)}</div>
          <div class="sp-bnd__root sp-bnd__root--l">${chain('l', 0)}</div>
        </div>
        <p class="sp-note">Drag to bend</p>
      </div>`);
    const wrap = k.$('.sp-bnd__wrap');
    const right = k.$$('.sp-bnd__strip--r');
    const left = k.$$('.sp-bnd__strip--l');
    const shadesR = right.map((s) => s.querySelector('.sp-bnd__shade'));
    const shadesL = left.map((s) => s.querySelector('.sp-bnd__shade'));
    k.fit(wrap, 0.8);
    const s = k.track({ bend: 0 });

    const draw = () => {
      const a = s.bend / n;
      right.forEach((el, i) => {
        gsap.set(el, { rotationY: a });
        shadesR[i].style.opacity = Math.min(Math.abs(a * (i + 1)) / 130, 0.6);
      });
      left.forEach((el, i) => {
        gsap.set(el, { rotationY: -a });
        shadesL[i].style.opacity = Math.min(Math.abs(a * (i + 1)) / 130, 0.6);
      });
    };
    draw();
    const to = (bend, dur, ease) => gsap.to(s, { bend, duration: reducedMotion ? 0 : dur, ease, onUpdate: draw, overwrite: true });
    const back = () => to(0, 1.4, `elastic.out(1, ${p.spring})`);

    let drag = null;
    k.on(wrap, 'pointerenter', () => !drag && to(p.max * 0.12, 0.6, 'power2.out'));
    k.on(wrap, 'pointerleave', () => !drag && back());
    k.on(wrap, 'pointerdown', (e) => {
      wrap.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, b: s.bend };
    });
    k.on(wrap, 'pointermove', (e) => {
      if (!drag) return;
      const px = wrap.getBoundingClientRect().width;
      s.bend = clamp(drag.b + ((e.clientX - drag.x) / px) * p.max * 2, -p.max, p.max);
      draw();
    });
    const drop = () => drag && ((drag = null), back());
    k.on(wrap, 'pointerup', drop);
    k.on(wrap, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    k.on(wrap, 'keydown', (e) => {
      const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      gsap.timeline().add(to(dir * p.max * 0.8, 0.35, 'power2.out')).add(back);
    });

    return () => k.destroy();
  },
};
