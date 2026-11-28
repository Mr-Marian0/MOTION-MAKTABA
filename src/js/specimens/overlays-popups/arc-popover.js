/** Arc Popover: the popover is lobbed out of its button as a dot that flies a true ballistic trajectory to its spot, then blooms open there. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Arc Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Physics-driven', 'Sequential'],
  effect: ['Trajectory-motion', 'Projectile-motion', 'Expansion'],
  purpose: ['Continuity', 'Delight', 'Wayfinding'],
  properties: ['Position', 'Scale', 'Path'],
  description: 'A popover that is thrown to where it opens. Click and a dot is lobbed out of the button, flying a real ballistic arc (launch angle, gravity, the lot) across the page to the popover\'s spot, where it lands and blooms open into the popover. Closing shrinks it back to a dot that is thrown home.',
  params: [
    { key: 'angle', label: 'Launch angle', group: 'Motion', type: 'range', min: 30, max: 80, step: 5, unit: '°', default: 60, live: true },
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-arc', `
      <i class="sp-arc__dot"></i>
      <div class="sp-ov__card sp-ov__pop sp-arc__pop" role="dialog" aria-label="Saved"><span class="sp-ov__kick">Saved to</span><b class="sp-ov__title">Summer board</b><span class="sp-ov__text">12 pins · shared with Mei</span></div>`, { label: 'Save', scrim: false, at: 'bottom', title: 'Pin' }));
    const dot = k.$('.sp-arc__dot');
    const pop = k.$('.sp-arc__pop');
    const btn = k.$('.sp-ov__open');
    gsap.set([dot, pop], { autoAlpha: 0 });
    gsap.set(pop, { transformOrigin: '50% 50%' });
    // Fly the dot from `from` to `to` (px, layout boxes) on a ballistic path: constant sideways speed plus
    // constant gravity is a parabola. Its lift h is chosen so the dot leaves at the set launch angle:
    // the starting slope -(dy - 4h) / |dx| must equal tan(angle).
    const fly = (from, to, t) => {
      const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
      const h = (dy + Math.abs(dx) * Math.tan((p.angle * Math.PI) / 180)) / 4;
      const s = k.track({ u: 0 });
      return gsap.to(s, { u: 1, duration: t, ease: 'none', onUpdate: () => {
        gsap.set(dot, { x: from[0] + dx * s.u, y: from[1] + dy * s.u - 4 * h * s.u * (1 - s.u) });
      } });
    };
    const spot = () => [pop.offsetLeft + pop.offsetWidth / 2, pop.offsetTop + pop.offsetHeight / 2];
    const home = () => [btn.offsetLeft + btn.offsetWidth / 2, btn.offsetTop];
    toggle(k, gsap, { reducedMotion }, (open) => {
      const [a, b] = open ? [home(), spot()] : [spot(), home()];
      const tl = gsap.timeline();
      if (open) {
        tl.set(dot, { autoAlpha: 1, x: a[0], y: a[1] }).add(fly(a, b, p.time)).set(dot, { autoAlpha: 0 })
          .fromTo(pop, { autoAlpha: 1, scale: 0.1 }, { scale: 1, duration: 0.4, ease: 'back.out(2.5)' });
      } else {
        tl.to(pop, { scale: 0.1, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }).set(dot, { autoAlpha: 1, x: a[0], y: a[1] }).add(fly(a, b, p.time * 0.8)).set(dot, { autoAlpha: 0 });
      }
      return tl;
    }, ['Save', 'Close']);
    return () => k.destroy();
  },
};
