/** Mesh Hero: a low-poly hero backdrop. The mesh's points lean toward the cursor, so the triangles stretch and re-shade around it; it eases flat when you leave. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from '../cards-containers/_shape.js';

export const meta = {
  title: 'Mesh Hero',
  element: 'Hero section',
  trigger: ['Cursor move', 'Hover'],
  behavior: ['Pointer-tracking', 'Proximity-aware', 'Elastic'],
  effect: ['Mesh-morphing', 'Attraction-motion', 'Damped-oscillation'],
  purpose: ['Decoration', 'Branding', 'Delight'],
  properties: ['Shape', 'Path', 'Color'],
  description: 'A hero whose backdrop is a low-poly mesh of shaded triangles. Move over it and the mesh points near the cursor are drawn toward it, stretching the triangles and shifting their shading like a lens; leave and the mesh springs back flat.',
  params: [
    { key: 'pull', label: 'Pull', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: '', default: 0.45, live: true },
    { key: 'reach', label: 'Reach', group: 'Shape', type: 'range', min: 10, max: 40, step: 2, unit: '%', default: 24, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Mesh'),
  ],
};

const [C, R] = [10, 6];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(17);
    // A jittered grid (edges stay on the frame) cut into two triangles per cell.
    const pts = Array.from({ length: (C + 1) * (R + 1) }, (_, n) => {
      const [i, j] = [n % (C + 1), Math.floor(n / (C + 1))];
      const jx = i % C ? (r() - 0.5) * 0.7 : 0;
      const jy = j % R ? (r() - 0.5) * 0.7 : 0;
      return [((i + jx) * 100) / C, ((j + jy) * 60) / R];
    });
    const tris = [];
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
      const [a, b, c, d] = [j * (C + 1) + i, j * (C + 1) + i + 1, (j + 1) * (C + 1) + i + 1, (j + 1) * (C + 1) + i];
      tris.push(...(r() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]));
    }
    const shade = tris.map(() => 25 + r() * 45);
    k.html(`
      <div class="sp sp-pn sp-msh">
        <svg class="sp-msh__svg" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          ${tris.map((_, i) => `<polygon style="fill:color-mix(in srgb, var(--sp-accent) ${shade[i].toFixed(0)}%, var(--color-bone))" />`).join('')}
        </svg>
        <div class="sp-pn__center sp-msh__copy"><span class="sp-pn__kick">New season</span><b class="sp-pn__h">Folded Light</b><span class="sp-pn__btn">Explore</span></div>
      </div>`);
    const svg = k.$('.sp-msh__svg');
    const polys = k.$$('.sp-msh__svg polygon');
    const s = k.track({ x: 50, y: 30, amt: 0 });

    const draw = () => {
      const moved = pts.map(([x, y]) => {
        const [dx, dy] = [s.x - x, (s.y - y) * 1.6];
        const g = Math.exp(-(dx * dx + dy * dy) / (2 * p.reach * p.reach)) * s.amt * p.pull;
        // Points on the frame only slide along it, so the mesh never pulls away from the edge.
        return [x === 0 || x === 100 ? x : x + (s.x - x) * g, y === 0 || y === 60 ? y : y + (s.y - y) * g];
      });
      polys.forEach((el, i) => el.setAttribute('points', tris[i].map((n) => moved[n].map((v) => v.toFixed(2)).join(',')).join(' ')));
    };
    draw();
    if (reducedMotion) return () => k.destroy();
    const follow = { x: gsap.quickTo(s, 'x', { duration: 0.4, onUpdate: draw }), y: gsap.quickTo(s, 'y', { duration: 0.4, onUpdate: draw }) };
    k.on(svg.parentElement, 'pointermove', (e) => {
      const b = svg.getBoundingClientRect();
      follow.x(((e.clientX - b.left) / b.width) * 100);
      follow.y(((e.clientY - b.top) / b.height) * 60);
    });
    k.on(svg.parentElement, 'pointerenter', () => gsap.to(s, { amt: 1, duration: 0.6, onUpdate: draw, overwrite: 'auto' }));
    k.on(svg.parentElement, 'pointerleave', () => gsap.to(s, { amt: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)', onUpdate: draw, overwrite: 'auto' }));

    return () => k.destroy();
  },
};
