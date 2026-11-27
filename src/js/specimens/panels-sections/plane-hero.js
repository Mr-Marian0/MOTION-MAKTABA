/** Plane Hero: a paper plane flies across the hero on a swooping course, turns a loop and glides off, unrolling the headline behind it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Plane Hero',
  element: 'Hero section',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Sequential', 'Following'],
  effect: ['Flying', 'Looping-motion', 'Wave-path-motion'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Path'],
  description: 'A hero announced by a paper plane. It flies in from the left on a swooping course, nose following the curve, turns a full loop in the middle of the sky, and glides off to the right; behind it the headline unrolls across the sky. "Fly again" sends another.',
  params: [
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 2, max: 8, step: 0.5, unit: 's', default: 4, live: true },
    { key: 'swoop', label: 'Swoop', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '%', default: 10, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-pln">
        <i class="sp-pln__cloud sp-pln__cloud--a"></i><i class="sp-pln__cloud sp-pln__cloud--b"></i>
        <div class="sp-pn__center sp-pln__copy"><span class="sp-pn__kick">Spring issue</span><b class="sp-pn__h">Take the long way</b></div>
        <div class="sp-pln__plane" aria-hidden="true"><i></i></div>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-pln__btn">Fly again</button>
      </div>`);
    const root = stage.firstElementChild;
    const plane = k.$('.sp-pln__plane');
    const copy = k.$('.sp-pln__copy');
    const f = k.track({ t: 0 });
    let tl;

    // The course, as % of the hero: a swooping line across, and between t 0.4 and 0.6 a full loop
    // (forward progress pauses while the plane circles up, over and back down).
    const at = (t) => {
      const s = (t < 0.4 ? t : t < 0.6 ? 0.4 : t - 0.2) / 0.8;
      let x = -10 + s * 120;
      let y = 50 + Math.sin(s * Math.PI * 2) * p.swoop;
      if (t > 0.4 && t < 0.6) {
        const a = ((t - 0.4) / 0.2) * Math.PI * 2;
        x += Math.sin(a) * 9;
        y -= (1 - Math.cos(a)) * 14;
      }
      return [x, y];
    };
    let [W, H] = [1, 1]; // hero size in px, measured on resize (never per frame)
    const draw = () => {
      const [x, y] = at(f.t);
      const [x2, y2] = at(Math.min(f.t + 0.01, 1));
      const angle = (Math.atan2(((y2 - y) * H) / 100, ((x2 - x) * W) / 100) * 180) / Math.PI;
      gsap.set(plane, { x: (x * W) / 100, y: (y * H) / 100, rotation: angle });
    };

    const fly = () => {
      tl?.kill();
      gsap.set(copy, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' });
      if (reducedMotion) return gsap.set(copy, { autoAlpha: 1, clipPath: 'none' });
      tl = gsap.timeline()
        .fromTo(f, { t: 0 }, { t: 1, duration: p.time, ease: 'none', onUpdate: draw })
        // The headline is unrolled behind the plane as it passes
        .to(copy, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: p.time * 0.45, ease: 'none' }, p.time * 0.18);
    };
    k.inView(stage, () => !tl && fly(), 0.5);
    k.on(k.$('.sp-pln__btn'), 'click', fly);
    k.resize(root, () => ((W = root.offsetWidth), (H = root.offsetHeight), draw()));

    return () => { tl?.kill(); k.destroy(); };
  },
};
