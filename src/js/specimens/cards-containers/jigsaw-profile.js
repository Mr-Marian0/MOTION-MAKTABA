/** Jigsaw Profile: a profile card cut into jigsaw pieces and scattered. Drag each piece home (it snaps when close) or press Solve. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from './_pieces.js';

export const meta = {
  title: 'Jigsaw Profile',
  element: 'Profile card',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Snap-to-position', 'Randomized', 'Staggered', 'Drag-and-drop'],
  effect: ['Reassembly', 'Snapping', 'Shimmering'],
  purpose: ['Delight', 'Feedback', 'Storytelling'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Order'],
  description: 'A profile card cut into jigsaw pieces and scattered round the stage. Drag a piece near its spot and it snaps in with a click; when the last one lands the seams vanish and a shine runs across. Solve puts it together for you, Scatter mixes it up again.',
  params: [
    { key: 'cols', label: 'Columns', group: 'Shape', type: 'range', min: 2, max: 5, step: 1, unit: '', default: 3 },
    { key: 'rows', label: 'Rows', group: 'Shape', type: 'range', min: 2, max: 4, step: 1, unit: '', default: 2 },
    { key: 'snap', label: 'Snap distance', group: 'Behavior', type: 'range', min: 0.5, max: 3, step: 0.25, unit: 'em', default: 1.5, live: true },
    tone('#2f4a6b'),
  ],
};

/** Jigsaw outlines: a cols × rows grid whose inner edges get a round tab (sign ±1 says which way it bulges). */
function cut(cols, rows, rx, ry) {
  const sign = () => (Math.random() < 0.5 ? 1 : -1);
  const H = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, sign));
  const V = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, sign));
  const edge = ([ax, ay], [bx, by], s, horizontal) => {
    if (!s) return [[ax, ay]];
    const len = Math.hypot(bx - ax, by - ay);
    const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
    const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
    const [nx, ny] = horizontal ? [0, s * ry] : [s * rx, 0];
    const ra = horizontal ? rx : ry;
    const arc = Array.from({ length: 11 }, (_, k) => {
      const t = Math.PI * (1.15 - (k / 10) * 1.3); // a little past a half circle, for a neck
      return [mx + ux * Math.cos(t) * ra + nx * (Math.sin(t) + 0.35), my + uy * Math.cos(t) * ra + ny * (Math.sin(t) + 0.35)];
    });
    return [[ax, ay], [mx - ux * ra * 0.75, my - uy * ra * 0.75], ...arc, [mx + ux * ra * 0.75, my + uy * ra * 0.75]];
  };
  const out = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const [x0, y0, x1, y1] = [(i * 100) / cols, (j * 100) / rows, ((i + 1) * 100) / cols, ((j + 1) * 100) / rows];
      out.push([
        ...edge([x0, y0], [x1, y0], j > 0 ? H[j - 1][i] : 0, true),
        ...edge([x1, y0], [x1, y1], i < cols - 1 ? V[j][i] : 0, false),
        ...edge([x1, y1], [x0, y1], j < rows - 1 ? H[j][i] : 0, true),
        ...edge([x0, y1], [x0, y0], i > 0 ? V[j][i - 1] : 0, false),
      ]);
    }
  }
  return out;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-jig">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-jig__card">
            <i class="sp-cc__avatar">MT</i>
            <b class="sp-cc__title">Mei Tanaka</b>
            <span class="sp-cc__kick">Illustrator · Osaka</span>
            <span class="sp-cc__text">Draws paper worlds for picture books and small games.</span>
            <i class="sp-jig__shine"></i>
          </article>
          <div class="sp-cc__pieces"></div>
        </div>
        <button type="button" class="sp-cc__btn sp-jig__btn" aria-live="polite">Solve</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-jig__card');
    const host = k.$('.sp-cc__pieces');
    const shine = k.$('.sp-jig__shine');
    const btn = k.$('.sp-jig__btn');
    k.fit(wrap, 0.55);
    const em = () => parseFloat(getComputedStyle(card).fontSize);
    const scale = () => wrap.getBoundingClientRect().width / wrap.offsetWidth || 1;
    let bits = [];
    let left = 0;
    let z = 1;

    const solved = () => {
      host.innerHTML = '';
      bits = [];
      card.style.visibility = '';
      btn.textContent = 'Scatter';
      if (!reducedMotion) gsap.fromTo(shine, { xPercent: -100, autoAlpha: 1 }, { xPercent: 260, autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' });
    };
    const place = (b, snapDur) => {
      b.home = true;
      b.el.style.zIndex = 0;
      b.el.style.cursor = 'default';
      gsap.to(b.el, { x: 0, y: 0, rotation: 0, duration: reducedMotion ? 0 : snapDur, ease: 'back.out(2.5)', onComplete: () => --left === 0 && solved() });
    };

    const scatter = () => {
      const W = card.offsetWidth / em();
      const H = card.offsetHeight / em();
      const cols = Math.round(p.cols);
      const rows = Math.round(p.rows);
      bits = pieces(host, card.outerHTML, cut(cols, rows, (0.8 / W) * 100, (0.8 / H) * 100));
      left = bits.length;
      card.style.visibility = 'hidden';
      btn.textContent = 'Solve';
      bits.forEach((b) => {
        b.el.style.cursor = 'grab';
        gsap.fromTo(b.el, { x: 0, y: 0, rotation: 0 }, {
          x: `${(b.c[0] - 50) * 0.12 + (Math.random() - 0.5) * 9}em`,
          y: `${(b.c[1] - 50) * 0.1 + (Math.random() - 0.5) * 6}em`,
          rotation: (Math.random() - 0.5) * 40,
          duration: reducedMotion ? 0 : 0.7,
          ease: 'power3.out',
          delay: reducedMotion ? 0 : Math.random() * 0.15,
        });
        let start = null;
        k.on(b.el, 'pointerdown', (e) => {
          if (b.home) return;
          b.el.setPointerCapture(e.pointerId);
          b.el.style.zIndex = ++z;
          start = { px: e.clientX, py: e.clientY, x: gsap.getProperty(b.el, 'x'), y: gsap.getProperty(b.el, 'y') };
          gsap.to(b.el, { scale: 1.04, duration: 0.15 });
        });
        k.on(b.el, 'pointermove', (e) => {
          if (!start) return;
          gsap.set(b.el, { x: start.x + (e.clientX - start.px) / scale(), y: start.y + (e.clientY - start.py) / scale() });
        });
        const drop = () => {
          if (!start) return;
          start = null;
          gsap.to(b.el, { scale: 1, duration: 0.2 });
          const off = Math.hypot(gsap.getProperty(b.el, 'x'), gsap.getProperty(b.el, 'y')) / em();
          if (off < p.snap) place(b, 0.3);
        };
        k.on(b.el, 'pointerup', drop);
        k.on(b.el, 'pointercancel', drop);
        k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the piece
      });
    };

    k.on(btn, 'click', () => {
      if (!bits.length) return scatter();
      bits.filter((b) => !b.home).forEach((b, i) => {
        b.home = true;
        gsap.delayedCall(reducedMotion ? 0 : i * 0.08, () => place(b, 0.6));
      });
    });
    gsap.set(shine, { autoAlpha: 0 });
    requestAnimationFrame(scatter);

    return () => k.destroy();
  },
};
