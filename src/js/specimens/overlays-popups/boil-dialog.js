/** Boil Dialog: a hand-drawn dialog whose ink outline "boils" like traditional animation: every few frames the line is redrawn with fresh wobble, so it shimmers alive while it is open. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Boil Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Procedural', 'Continuous', 'Randomized', 'Toggle-dependent'],
  effect: ['Procedural-motion', 'Jittering', 'Generative-motion'],
  purpose: ['Decoration', 'Branding', 'Delight'],
  properties: ['Path', 'Border'],
  description: 'A dialog drawn by hand. Its outline and the underline under its title are generated, not stored: every few frames they are redrawn with fresh, slightly different wobbles, the classic "line boil" of hand-drawn animation, so the ink seems to shimmer alive while the dialog is open. It pops in and out on a squash.',
  params: [
    { key: 'wobble', label: 'Wobble', group: 'Shape', type: 'range', min: 0.2, max: 3, step: 0.1, unit: '', default: 1.2, live: true },
    { key: 'fps', label: 'Boil rate', group: 'Motion', type: 'range', min: 2, max: 16, step: 1, unit: 'fps', default: 8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Underline'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-boil', `
      <div class="sp-boil__dialog" role="dialog" aria-label="Save sketch?">
        <svg class="sp-boil__ink" viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true"><path class="sp-boil__edge" /><path class="sp-boil__under" /></svg>
        <span class="sp-ov__kick">Before you go</span><b class="sp-ov__title">Save this sketch?</b><span class="sp-ov__text">It isn’t in any board yet.</span>
      </div>`, { label: 'Leave', title: 'Sketch 15' }));
    const dialog = k.$('.sp-boil__dialog');
    const edge = k.$('.sp-boil__edge');
    const under = k.$('.sp-boil__under');
    gsap.set(dialog, { autoAlpha: 0 });
    const j = () => (Math.random() - 0.5) * 2 * p.wobble;
    // A wobbly line through points, drawn as smooth quadratic curves (fresh randomness every call)
    const line = (pts, close) => {
      const q = pts.map(([x, y]) => [x + j(), y + j()]);
      let d = `M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)}`;
      for (let i = 1; i < q.length; i++) {
        const [a, b] = [q[i - 1], q[i]];
        d += ` Q${((a[0] + b[0]) / 2 + j()).toFixed(1)} ${((a[1] + b[1]) / 2 + j()).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      }
      return close ? `${d} Z` : d;
    };
    const box = [[4, 4], [70, 3], [135, 5], [196, 4], [197, 40], [195, 76], [196, 106], [130, 107], [66, 105], [4, 106], [3, 70], [5, 36], [4, 4]];
    const draw = () => {
      edge.setAttribute('d', line(box, true));
      under.setAttribute('d', line([[14, 47], [60, 49], [110, 46], [150, 48]], false));
    };
    draw();
    let boil;
    toggle(k, gsap, { reducedMotion }, (open) => {
      boil?.kill();
      if (open && !reducedMotion) boil = gsap.timeline({ repeat: -1 }).call(draw).to({}, { duration: 1 / p.fps });
      return open
        ? gsap.timeline().fromTo(dialog, { autoAlpha: 1, scaleY: 0.4, scaleX: 1.15 }, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' })
        : gsap.timeline().to(dialog, { scaleY: 0.4, scaleX: 1.15, autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
    }, ['Leave', 'Close']);
    return () => { boil?.kill(); k.destroy(); };
  },
};
