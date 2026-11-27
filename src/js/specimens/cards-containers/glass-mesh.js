/** Glass Mesh: a frosted glass card clears into a structured triangle mesh, which then relaxes into an unstructured mesh. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Glass Mesh',
  element: 'Content card',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['State-dependent', 'Sequential', 'Auto-advancing', 'Randomized', 'Pausable'],
  effect: ['Mesh-morphing', 'Scanning', 'Distortion'],
  purpose: ['Storytelling', 'Delight', 'Decoration'],
  properties: ['Blur', 'Path', 'Opacity'],
  description: 'A frosted glass card over drifting color. It clears and a structured mesh scans in: an even grid of triangles. Then the mesh goes unstructured: points drift and crowd toward one spot, edges flip, and the triangles turn irregular. Then back to glass.',
  params: [
    { key: 'cols', label: 'Mesh detail', group: 'Shape', type: 'range', min: 5, max: 12, step: 1, unit: '', default: 8 },
    { key: 'mess', label: 'Unstructure', group: 'Shape', type: 'range', min: 0.2, max: 1, step: 0.1, unit: '', default: 0.8, live: true },
    { key: 'auto', label: 'Auto-advance', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Backdrop color'),
  ],
};

// Drawing units: the card is 200 × 130 (1 = 0.1em).
const [W, H] = [200, 130];
const STATES = ['Glass', 'Structured', 'Unstructured'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const cols = p.cols;
    const rows = Math.round((cols * H) / W);
    const [sx, sy] = [W / cols, H / rows];
    const grid = Array.from({ length: rows + 1 }, (_, j) => Array.from({ length: cols + 1 }, (_, i) => [i * sx, j * sy]));
    const tris = cols * rows * 2;
    k.html(`
      <div class="sp sp-glass">
        <div class="sp-glass__bg" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="sp-glass__wrap">
          <div class="sp-glass__seg" role="radiogroup" aria-label="Surface">
            <i class="sp-glass__pill"></i>
            ${STATES.map((s, i) => `<button type="button" role="radio" aria-checked="${!i}">${s}</button>`).join('')}
          </div>
          <article class="sp-glass__card">
            <i class="sp-glass__frost"></i>
            <svg class="sp-glass__mesh" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
              <path class="sp-glass__edges" pathLength="1" />
              <path class="sp-glass__diag sp-glass__diag--a" pathLength="1" />
              <path class="sp-glass__diag sp-glass__diag--b" pathLength="1" />
              <g class="sp-glass__dots"></g>
            </svg>
            <p class="sp-glass__label"><b aria-live="polite">Glass</b><span>${(cols + 1) * (rows + 1)} vertices · ${tris} triangles</span></p>
          </article>
        </div>
      </div>`);
    const wrap = k.$('.sp-glass__wrap');
    const frost = k.$('.sp-glass__frost');
    const mesh = k.$('.sp-glass__mesh');
    const edges = k.$('.sp-glass__edges');
    const [diagA, diagB] = k.$$('.sp-glass__diag');
    const dotsG = k.$('.sp-glass__dots');
    const btns = k.$$('.sp-glass__seg button');
    const pill = k.$('.sp-glass__pill');
    k.fit(wrap, 0.9);
    const d = (t) => (reducedMotion ? 0 : t);

    // Vertex positions blend from the grid (t = 0) toward a scattered target (t = 1).
    const state = k.track({ t: 0 });
    let target = grid;
    const dots = grid.flat().map(() => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', '1.3');
      dotsG.append(c);
      return c;
    });
    // Structured: diagonals alternate evenly. Unstructured: each quad flips its diagonal at random.
    let flips = grid.map((row) => row.map(() => false));
    const at = (j, i) => {
      const [gx, gy] = grid[j][i];
      const [tx, ty] = target[j][i];
      return [gx + (tx - gx) * state.t, gy + (ty - gy) * state.t];
    };
    const seg = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    const draw = () => {
      let e = '';
      let da = '';
      let db = '';
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          if (i < cols) e += seg(at(j, i), at(j, i + 1));
          if (j < rows) e += seg(at(j, i), at(j + 1, i));
          if (i < cols && j < rows) {
            const even = (i + j) % 2 === 0;
            da += even ? seg(at(j, i), at(j + 1, i + 1)) : seg(at(j, i + 1), at(j + 1, i));
            db += even !== flips[j][i] ? seg(at(j, i), at(j + 1, i + 1)) : seg(at(j, i + 1), at(j + 1, i));
          }
        }
      }
      edges.setAttribute('d', e);
      diagA.setAttribute('d', da);
      diagB.setAttribute('d', db);
      grid.flat().forEach((_, n) => {
        const [x, y] = at(Math.floor(n / (cols + 1)), n % (cols + 1));
        dots[n].setAttribute('cx', x.toFixed(1));
        dots[n].setAttribute('cy', y.toFixed(1));
      });
    };

    // A new unstructured layout: jitter every point, crowd them toward a focus, keep the border on the border.
    const scatter = () => {
      const f = [W * (0.3 + Math.random() * 0.4), H * (0.3 + Math.random() * 0.4)];
      const m = p.mess;
      flips = grid.map((row) => row.map(() => Math.random() < 0.5 * m));
      target = grid.map((row, j) => row.map(([x, y], i) => {
        const edgeX = i === 0 || i === cols;
        const edgeY = j === 0 || j === rows;
        const pull = 0.45 * m * Math.exp(-Math.hypot(f[0] - x, f[1] - y) / 60);
        const nx = edgeX ? x : x + (f[0] - x) * pull + (Math.random() - 0.5) * sx * 0.7 * m;
        const ny = edgeY ? y : y + (f[1] - y) * pull + (Math.random() - 0.5) * sy * 0.7 * m;
        return [nx, ny];
      }));
    };

    gsap.set(mesh, { autoAlpha: 0 });
    gsap.set(diagB, { opacity: 0 });
    draw();
    let now = 0;
    let tl;
    let hold = false;
    let timer;

    const schedule = () => {
      timer?.kill();
      if (p.auto && !hold && !reducedMotion) timer = gsap.delayedCall(2.6, () => go((now + 1) % 3));
    };

    function go(next) {
      if (next === now) return;
      const from = now;
      now = next;
      btns.forEach((b, i) => b.setAttribute('aria-checked', String(i === now)));
      gsap.to(pill, { xPercent: now * 100, duration: d(0.4), ease: 'back.out(1.6)' });
      k.$('.sp-glass__label b').textContent = `${STATES[now]}${now ? ' mesh' : ''}`;
      tl?.kill();
      tl = gsap.timeline({ onUpdate: draw, onComplete: schedule });
      if (now === 0) {
        // Back to glass: the mesh fades, the frost returns, the points go home
        tl.to(mesh, { autoAlpha: 0, duration: d(0.5) }, 0)
          .to(frost, { opacity: 1, duration: d(0.6) }, 0)
          .to(state, { t: 0, duration: d(0.5) }, 0)
          .set(diagB, { opacity: 0 })
          .set(diagA, { opacity: 1 });
        return;
      }
      if (from === 0) {
        // Glass clears and a structured mesh scans in, row by row
        tl.to(frost, { opacity: 0.12, duration: d(0.6) }, 0)
          .set(mesh, { autoAlpha: 1 }, 0)
          .fromTo([edges, diagA], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d(1.1), ease: 'power1.inOut' }, 0.1)
          .fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: d(0.3), stagger: { each: d(0.012), from: 'start' }, ease: 'back.out(3)' }, 0.2);
      }
      if (now === 2) {
        scatter();
        tl.to(state, { t: 1, duration: d(1), ease: 'power3.inOut' }, from === 0 ? 1 : 0)
          .to(diagA, { opacity: 0, duration: d(0.6) }, '<0.2')
          .to(diagB, { opacity: 1, duration: d(0.6) }, '<');
      } else if (from === 2) {
        tl.to(state, { t: 0, duration: d(0.9), ease: 'power3.inOut' }, 0)
          .to(diagB, { opacity: 0, duration: d(0.5) }, 0.2)
          .to(diagA, { opacity: 1, duration: d(0.5) }, 0.2);
      }
    }
    schedule();

    btns.forEach((b, i) => k.on(b, 'click', () => go(i)));
    k.on(k.$('.sp-glass__seg'), 'keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      go((now + dir + 3) % 3);
      btns[now].focus();
    });
    const pause = (on) => () => { hold = on; on ? timer?.kill() : schedule(); };
    k.on(wrap, 'pointerenter', pause(true));
    k.on(wrap, 'pointerleave', pause(false));

    // The colors behind the glass drift slowly, so the blur has something to bend.
    const drift = reducedMotion ? [] : k.$$('.sp-glass__bg i').map((b, i) =>
      gsap.to(b, { x: `${(i % 2 ? -1 : 1) * 3}em`, y: `${(i - 1) * 1.5}em`, duration: 4 + i, repeat: -1, yoyo: true, ease: 'sine.inOut' }));

    return {
      destroy: () => { timer?.kill(); tl?.kill(); drift.forEach((t) => t.kill()); k.destroy(); },
      update: (key) => key === 'auto' && schedule(),
    };
  },
};
