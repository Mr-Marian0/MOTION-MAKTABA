/** Warp Image: the photo is soft under the pointer: the strips of the picture nearest the cursor bulge downward and stretch, warping the image around it, and spring flat again when you leave. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Warp Image',
  element: 'Image',
  trigger: ['Cursor move', 'Hover', 'Keyboard'],
  behavior: ['Cursor-following', 'Proximity-aware', 'Elastic'],
  effect: ['Warping', 'Wave-deformation', 'Stretching'],
  purpose: ['Delight', 'Focus'],
  properties: ['Position', 'Scale', 'Clip & mask'],
  description: 'A landscape print that bends where you touch it. The photo is cut into thin vertical strips; as the pointer moves over it, the strips near the pointer drop and stretch in a smooth bulge that follows you sideways, warping the picture like a rubber sheet. Leave and every strip springs back flat. Focus it and use ←/→ to move the bulge.',
  params: [
    { key: 'strips', label: 'Strips', group: 'Shape', type: 'range', min: 8, max: 40, step: 1, unit: '', default: 24 },
    { key: 'depth', label: 'Warp', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.9, live: true },
    { key: 'width', label: 'Bulge width', group: 'Shape', type: 'range', min: 5, max: 40, step: 1, unit: '%', default: 16, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Frame'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.strips);
    k.html(`
      <div class="sp sp-tm sp-wrp2">
        <div class="sp-tm__frame sp-wrp2__frame" tabindex="0" role="img" aria-label="Hills at dusk (← → to warp)"><div class="sp-cc__pieces"></div></div>
      </div>`);
    const frame = k.$('.sp-wrp2__frame');
    const strips = pieces(k.$('.sp-cc__pieces'), photo(0, 'sp-wrp2__img'), Array.from({ length: n }, (_, i) => {
      // each strip overlaps its neighbours by a hair, so no anti-aliased seam shows between them
      const [a, b] = [Math.max(0, (i / n) * 100 - 0.25), Math.min(100, ((i + 1) / n) * 100 + 0.25)];
      return [[a, 0], [b, 0], [b, 100], [a, 100]];
    })).map((b) => b.el);
    gsap.set(strips, { transformOrigin: '50% 0%' });
    const ys = strips.map((s) => gsap.quickTo(s, 'y', { duration: 0.35, ease: 'power3.out' }));
    const ss = strips.map((s) => gsap.quickTo(s, 'scaleY', { duration: 0.35, ease: 'power3.out' }));
    let W = 1, E = 14, box, at = 0.5;
    k.resize(frame, () => { W = frame.offsetWidth; E = parseFloat(getComputedStyle(frame).fontSize) || 14; });
    const bend = (u) => {
      at = u;
      if (reducedMotion) return;
      strips.forEach((s, i) => {
        const z = (((i + 0.5) / n - u) * 100) / p.width; // distance from the pointer, in bulge widths
        const f = Math.exp(-z * z);
        ys[i](f * p.depth * E);
        ss[i](1 + f * 0.08);
      });
    };
    const flat = () => strips.forEach((s, i) => { gsap.to(s, { y: 0, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.35)', overwrite: true }); });
    k.on(frame, 'pointerenter', () => (box = frame.getBoundingClientRect()));
    k.on(frame, 'pointermove', (e) => box && bend((e.clientX - box.left) / W));
    k.on(frame, 'pointerleave', () => { box = null; flat(); });
    k.on(frame, 'keydown', (e) => { const d = { ArrowLeft: -0.08, ArrowRight: 0.08 }[e.key]; if (d) e.preventDefault(), bend(Math.min(1, Math.max(0, at + d))); });
    k.on(frame, 'blur', flat);
    return () => k.destroy();
  },
};
