/** Warp Corners: grab any corner of the product card and pull: the whole card warps in perspective to follow it (a 4-point projective transform), then springs back. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Warp Corners',
  element: 'Product card',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Elastic', 'Spring-driven', 'Constrained'],
  effect: ['Warping', 'Springing', 'Damped-oscillation'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Shape', 'Position', 'Depth (z)'],
  description: 'A product card with four corner handles. Drag one and the card warps in perspective to follow it, so its photo, text and button all bend into the new shape together. Let go and the corner springs home with a wobble. Arrow keys tug a focused corner.',
  params: [
    { key: 'reach', label: 'Max pull', group: 'Behavior', type: 'range', min: 2, max: 10, step: 0.5, unit: 'em', default: 6, live: true },
    { key: 'spring', label: 'Springiness', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: '', default: 0.3, live: true },
    tone('#4f6b4a'),
  ],
};

// 3 × 3 helpers for the projective transform that takes the card's corners to any four points.
const adj = (m) => [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
const mul = (a, b) => Array.from({ length: 9 }, (_, i) => [0, 1, 2].reduce((s, j) => s + a[Math.floor(i / 3) * 3 + j] * b[j * 3 + (i % 3)], 0));
const mulv = (m, v) => [0, 1, 2].map((i) => m[i * 3] * v[0] + m[i * 3 + 1] * v[1] + m[i * 3 + 2] * v[2]);
const basis = (q) => {
  const m = [q[0][0], q[1][0], q[2][0], q[0][1], q[1][1], q[2][1], 1, 1, 1];
  const v = mulv(adj(m), [q[3][0], q[3][1], 1]);
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};
function matrix(from, to) {
  const t = mul(basis(to), adj(basis(from))).map((x, _, a) => x / a[8]);
  return `matrix3d(${[t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(',')})`;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const NAMES = ['top left', 'top right', 'bottom right', 'bottom left'];
    k.html(`
      <div class="sp sp-cc sp-wrp">
        <div class="sp-cc__wrap sp-wrp__wrap">
          <article class="sp-cc__card sp-wrp__card">
            <i class="sp-cc__img sp-wrp__img"></i>
            <b class="sp-cc__title">Grid Poster</b>
            <span class="sp-cc__text">Risograph · 50 × 70 cm</span>
            <div class="sp-cc__row"><b class="sp-cc__price">$30</b><span class="sp-cc__btn">Add</span></div>
          </article>
          ${NAMES.map((n, i) => `<button type="button" class="sp-wrp__handle sp-wrp__handle--${i}" aria-label="Pull the ${n} corner"></button>`).join('')}
        </div>
        <p class="sp-note">Drag a corner</p>
      </div>`);
    const wrap = k.$('.sp-wrp__wrap');
    const card = k.$('.sp-wrp__card');
    const handles = k.$$('.sp-wrp__handle');
    k.fit(wrap, 0.66);
    const off = handles.map(() => k.track({ x: 0, y: 0 })); // corner offsets in px
    const em = () => parseFloat(getComputedStyle(card).fontSize);

    const draw = () => {
      const [w, h] = [card.offsetWidth, card.offsetHeight];
      const rest = [[0, 0], [w, 0], [w, h], [0, h]];
      card.style.transform = matrix(rest, rest.map(([x, y], i) => [x + off[i].x, y + off[i].y]));
      handles.forEach((el, i) => gsap.set(el, { x: off[i].x, y: off[i].y }));
    };
    draw();
    const home = (i) => gsap.to(off[i], { x: 0, y: 0, duration: reducedMotion ? 0 : 1.2, ease: `elastic.out(1, ${p.spring})`, onUpdate: draw, overwrite: true });
    // Keep each corner within reach, and on its own side so the card never folds over itself.
    const limit = (i, x, y) => {
      const r = p.reach * em();
      const sx = i === 1 || i === 2 ? 1 : -1;
      const sy = i >= 2 ? 1 : -1;
      return [clamp(x, sx > 0 ? -r * 0.5 : -r, sx > 0 ? r : r * 0.5), clamp(y, sy > 0 ? -r * 0.5 : -r, sy > 0 ? r : r * 0.5)];
    };

    handles.forEach((el, i) => {
      let drag = null;
      k.on(el, 'pointerdown', (e) => {
        el.setPointerCapture(e.pointerId);
        gsap.killTweensOf(off[i]);
        drag = { x: e.clientX, y: e.clientY, ox: off[i].x, oy: off[i].y };
      });
      k.on(el, 'pointermove', (e) => {
        if (!drag) return;
        const scale = wrap.getBoundingClientRect().width / wrap.offsetWidth || 1;
        [off[i].x, off[i].y] = limit(i, drag.ox + (e.clientX - drag.x) / scale, drag.oy + (e.clientY - drag.y) / scale);
        draw();
      });
      const drop = () => drag && ((drag = null), home(i));
      k.on(el, 'pointerup', drop);
      k.on(el, 'pointercancel', drop);
      k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the handle
      k.on(el, 'keydown', (e) => {
        const v = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!v) return;
        e.preventDefault();
        const [x, y] = limit(i, v[0] * p.reach * em() * 0.7, v[1] * p.reach * em() * 0.7);
        gsap.timeline().to(off[i], { x, y, duration: reducedMotion ? 0 : 0.2, onUpdate: draw, overwrite: true }).add(() => home(i));
      });
    });
    k.resize(card, draw);

    return () => k.destroy();
  },
};
