/** Cushion Surface: the quilted face of a cushion product card dents under the cursor: its stitch lines bend into the dip and shading pools there. Press to push deeper. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Cushion Surface',
  element: 'Product card',
  trigger: ['Cursor move', 'Hover', 'Click'],
  behavior: ['Pointer-tracking', 'Hover-dependent', 'Elastic', 'Reactive'],
  effect: ['Surface-deformation', 'Compression', 'Damped-oscillation'],
  purpose: ['Delight', 'Affordance', 'Feedback'],
  properties: ['Path', 'Shape', 'Shadow'],
  description: 'A product card for a quilted cushion. Move over its picture and the surface dents under the cursor: the stitch lines bend in toward the dip and shading pools there, as if a finger were pressing the fabric. Press to push deeper; leave and it puffs back up with a soft wobble.',
  params: [
    { key: 'depth', label: 'Dent depth', group: 'Shape', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: '', default: 0.35, live: true },
    { key: 'size', label: 'Dent size', group: 'Shape', type: 'range', min: 8, max: 30, step: 1, unit: '%', default: 16, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Fabric'),
  ],
};

const [COLS, ROWS, SAMPLES] = [8, 5, 24];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-csh">
        <article class="sp-cc__card sp-csh__card">
          <span class="sp-cc__img sp-csh__face">
            <svg class="sp-csh__svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><path class="sp-csh__stitch" /><g class="sp-csh__knots"></g></svg>
            <i class="sp-csh__shade"></i>
          </span>
          <b class="sp-cc__title">Quilted Cushion</b>
          <span class="sp-cc__text">Washed linen · 45 × 45 cm</span>
          <div class="sp-cc__row"><b class="sp-cc__price">$48</b><span class="sp-cc__btn">Add</span></div>
        </article>
      </div>`);
    const card = k.$('.sp-csh__card');
    const face = k.$('.sp-csh__face');
    const stitch = k.$('.sp-csh__stitch');
    const knots = k.$('.sp-csh__knots');
    const shade = k.$('.sp-csh__shade');
    k.fit(card, 0.86);
    knots.innerHTML = Array.from({ length: (COLS - 1) * (ROWS - 1) }, () => '<circle r="0.9" />').join('');
    const knotEls = [...knots.children];
    const s = k.track({ x: 50, y: 30, amt: 0 });

    // Push a point toward the dent centre, most strongly near it (aspect-corrected distance).
    const dent = (x, y) => {
      const [dx, dy] = [s.x - x, (s.y - y) * 1.6];
      const g = Math.exp(-(dx * dx + dy * dy) / (2 * p.size * p.size));
      const t = clamp(s.amt * p.depth * g, -0.5, 0.9);
      return [x + (s.x - x) * t, y + (s.y - y) * t];
    };
    const draw = () => {
      let d = '';
      const line = (pt) => Array.from({ length: SAMPLES + 1 }, (_, j) => dent(...pt(j / SAMPLES))).map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
      for (let r = 1; r < ROWS; r++) d += line((t) => [t * 100, (r * 60) / ROWS]);
      for (let c = 1; c < COLS; c++) d += line((t) => [(c * 100) / COLS, t * 60]);
      stitch.setAttribute('d', d);
      knotEls.forEach((el, i) => {
        const [x, y] = dent((((i % (COLS - 1)) + 1) * 100) / COLS, ((Math.floor(i / (COLS - 1)) + 1) * 60) / ROWS);
        el.setAttribute('cx', x.toFixed(2));
        el.setAttribute('cy', y.toFixed(2));
      });
      shade.style.background = `radial-gradient(circle ${p.size * 1.4}% at ${s.x}% ${(s.y / 60) * 100}%, rgb(17 17 17 / ${(0.35 * s.amt * p.depth * 2).toFixed(3)}), rgb(255 255 255 / ${(0.25 * s.amt).toFixed(3)}) 70%, transparent)`;
    };
    draw();
    const follow = { x: gsap.quickTo(s, 'x', { duration: 0.25, onUpdate: draw }), y: gsap.quickTo(s, 'y', { duration: 0.25, onUpdate: draw }) };
    const press = (amt, ease = 'power2.out', dur = 0.35) => gsap.to(s, { amt, duration: reducedMotion ? 0 : dur, ease, onUpdate: draw, overwrite: 'auto' });

    k.on(face, 'pointermove', (e) => {
      const r = face.getBoundingClientRect();
      follow.x(((e.clientX - r.left) / r.width) * 100);
      follow.y(((e.clientY - r.top) / r.height) * 60);
    });
    k.on(face, 'pointerenter', () => press(1));
    k.on(face, 'pointerleave', () => press(0, 'elastic.out(1, 0.3)', 1.2));
    k.on(face, 'pointerdown', () => press(2, 'power3.out', 0.2));
    k.on(face, 'pointerup', () => press(1, 'elastic.out(1, 0.35)', 0.9));

    return () => k.destroy();
  },
};
