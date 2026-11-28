/** Jelly Field: the field is a soft body: poke its outline and the dent wobbles away round the edge like jelly; each keystroke gives it a small squeeze from inside. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Jelly Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard', 'Focus'],
  behavior: ['Physics-driven', 'Position-aware', 'Spring-driven'],
  effect: ['Soft-body-motion', 'Soft-body-deformation', 'Wobbling'],
  purpose: ['Delight', 'Feedback', 'Affordance'],
  properties: ['Shape', 'Path'],
  description: 'A message field made of jelly. Its outline is a ring of springy points: press it anywhere and the edge under your finger caves in, then the wobble spreads to its neighbours and runs round the whole outline, dying away. Typing bulges the outline a little near the end of your text, so the field quivers as you write. The simulation only runs while it is wobbling.',
  params: [
    { key: 'poke', label: 'Poke', group: 'Motion', type: 'range', min: 2, max: 14, step: 1, unit: '', default: 8, live: true },
    { key: 'wobble', label: 'Wobbliness', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: '', default: 0.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Jelly'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('jly');
    k.html(`
      <div class="sp sp-fi sp-jly">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Say hello</label>
          <div class="sp-jly__body">
            <svg viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
            <input class="sp-fi__input sp-jly__input" id="${id}" autocomplete="off" placeholder="Wobbly, isn't it?" />
          </div>
          <p class="sp-note">Poke the edge · type</p>
        </div>
      </div>`);
    const body = k.$('.sp-jly__body');
    const path = k.$('.sp-jly__body path');
    const input = k.$('.sp-jly__input');
    // Ring of nodes round a 200×50 box: top edge left→right, bottom edge right→left. Each node moves along its normal.
    const N = 20;
    const nodes = [
      ...Array.from({ length: N }, (_, i) => ({ x: 6 + (i * 188) / (N - 1), y: 3, ny: 1 })),
      ...Array.from({ length: N }, (_, i) => ({ x: 194 - (i * 188) / (N - 1), y: 47, ny: -1 })),
    ].map((n) => ({ ...n, d: 0, v: 0 }));
    const M = nodes.length;
    const draw = () => {
      const pt = (n) => [n.x, n.y + n.d * n.ny];
      let d = '';
      for (let i = 0; i < M; i++) {
        const [x, y] = pt(nodes[i]);
        const [x2, y2] = pt(nodes[(i + 1) % M]);
        const mx = (x + x2) / 2, my = (y + y2) / 2;
        d += i ? ` Q${x.toFixed(1)} ${y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}` : `M${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      const [x0, y0] = pt(nodes[0]);
      const [x1, y1] = pt(nodes[1]);
      path.setAttribute('d', `${d} Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} Z`);
    };
    draw();
    // Mass-spring ring: pull to rest, pull towards neighbours (that's what spreads the wobble), damping
    let running = false;
    const tick = (t, ms) => {
      const dt = Math.min(0.033, ms / 1000);
      const kRest = 160, kNb = 240 * p.wobble, damp = 7 * (1.2 - p.wobble);
      let energy = 0;
      nodes.forEach((n, i) => {
        const a = nodes[(i + M - 1) % M].d, b = nodes[(i + 1) % M].d;
        n.v += (-kRest * n.d + kNb * (a + b - 2 * n.d) - damp * n.v) * dt;
      });
      nodes.forEach((n) => { n.d += n.v * dt; energy += Math.abs(n.v) + Math.abs(n.d); });
      draw();
      if (energy < 0.05) { nodes.forEach((n) => (n.d = n.v = 0)); draw(); gsap.ticker.remove(tick); running = false; }
    };
    const kick = (x, y, amt) => {
      if (reducedMotion) return;
      nodes.forEach((n) => {
        const near = Math.exp(-(((n.x - x) / 18) ** 2) - (((n.y - y) / 30) ** 2));
        n.v += amt * near * 40;
      });
      if (!running) running = true, gsap.ticker.add(tick);
    };
    let W = 1, H = 1, box;
    k.resize(body, () => ((W = body.offsetWidth), (H = body.offsetHeight)));
    k.on(body, 'pointerdown', (e) => {
      box = body.getBoundingClientRect();
      const x = ((e.clientX - box.left) / W) * 200;
      const y = ((e.clientY - box.top) / H) * 50;
      kick(x, y < 25 ? 3 : 47, p.poke);
    });
    // Typing: a small outward bulge at the end of the text, top and bottom
    k.on(input, 'input', () => {
      const x = Math.min(188, 12 + input.value.length * 6.2);
      kick(x, 3, -p.poke * 0.25);
      kick(x, 47, -p.poke * 0.25);
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
