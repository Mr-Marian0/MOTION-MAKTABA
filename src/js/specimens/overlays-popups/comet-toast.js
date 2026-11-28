/** Comet Toast: the toast streaks in on a curve from the top of the page, drawing a glowing trail behind it like a comet's tail, which fades once it has landed. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Comet Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'Temporary'],
  effect: ['Motion-trail', 'Curved-path-motion', 'Decelerating'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Position', 'Path', 'Opacity'],
  description: 'A toast that arrives like a comet. It sweeps in from the upper left on a curve and drops into the corner, drawing a tapering, glowing trail along the exact path it took; once it lands the tail fades away behind it.',
  params: [
    { key: 'tail', label: 'Tail length', group: 'Shape', type: 'range', min: 0.1, max: 1, step: 0.05, unit: '', default: 0.45, live: true },
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Tail'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-cmt', `
      <svg class="sp-cmt__svg" aria-hidden="true"><path class="sp-cmt__tail" pathLength="1" /></svg>
      <div class="sp-ov__toast sp-cmt__toast" role="status"><i></i><span>Wish granted: Pro for a week</span></div>`, { label: 'Make a wish', scrim: false, title: 'Rewards' }));
    const root = k.$('.sp-ov');
    const svg = k.$('.sp-cmt__svg');
    const tail = k.$('.sp-cmt__tail');
    const toast = k.$('.sp-cmt__toast');
    gsap.set(toast, { autoAlpha: 0 });
    gsap.set(tail, { autoAlpha: 0 });
    const s = k.track({ u: 0 });
    let path = [];
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) return gsap.timeline().to(toast, { autoAlpha: 0, y: '1em', duration: 0.3 });
      // The course: a quadratic curve from the top-left down into the toast's corner (page px)
      const [W, H] = [root.offsetWidth, root.offsetHeight];
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const end = [toast.offsetLeft + toast.offsetWidth / 2, toast.offsetTop + toast.offsetHeight / 2];
      const [a, c] = [[W * 0.05, H * 0.1], [W * 0.75, H * 0.05]];
      const at = (u) => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * end[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * end[1]];
      path = Array.from({ length: 41 }, (_, i) => at(i / 40));
      tail.setAttribute('d', `M${path.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`);
      // The tail is the stretch of path just behind the toast: a dash of length `tail` ending at the toast
      const draw = () => {
        const [x, y] = at(s.u);
        gsap.set(toast, { x: x - end[0], y: y - end[1] });
        gsap.set(tail, { strokeDasharray: `${Math.min(p.tail, s.u)} 2`, strokeDashoffset: -(s.u - Math.min(p.tail, s.u)) });
      };
      return gsap.timeline()
        .set([toast, tail], { autoAlpha: 1 })
        .fromTo(s, { u: 0 }, { u: 1, duration: p.time, ease: 'power2.out', onUpdate: draw })
        .to(tail, { autoAlpha: 0, duration: 0.6 });
    }, ['Make a wish', 'Dismiss']);
    return () => k.destroy();
  },
};
