/** Bug Tip: a tiny ladybug wanders the page on a random walk, turning this way and that; catch it (hover or tab to it) and it stops and shows its tooltip: "Found a bug? Report it." */
import { kit, uid, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Bug Tip',
  element: 'Tooltip',
  trigger: ['Idle', 'Hover', 'Focus'],
  behavior: ['Randomized', 'Autonomous', 'Hover-dependent', 'Boundary-aware'],
  effect: ['Random-walk', 'Crawling', 'Rotating'],
  purpose: ['Delight', 'Affordance', 'Branding'],
  properties: ['Position', 'Rotation'],
  description: 'A feedback tooltip that has to be caught. A tiny ladybug wanders the page on a random walk, each short step in a slightly different direction, turning to face where it goes and staying inside the page. Hover it (or tab to it) and it freezes and shows its tooltip, "Found a bug? Report it."; let go and it wanders off again.',
  params: [
    { key: 'step', label: 'Step size', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'em', default: 1.5, live: true },
    { key: 'turn', label: 'Turn', group: 'Motion', type: 'range', min: 10, max: 120, step: 10, unit: '°', default: 50, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ladybug'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('bug');
    k.html(`
      <div class="sp sp-ov sp-bug">
        ${page('Release notes', 'Beta')}
        <div class="sp-bug__walker"><button type="button" class="sp-bug__bug" aria-describedby="${id}" aria-label="Report a bug"><i></i></button><span class="sp-ov__tip sp-bug__tip" id="${id}" role="tooltip">Found a bug? Report it.</span></div>
      </div>`);
    const walker = k.$('.sp-bug__walker');
    const bug = k.$('.sp-bug__bug');
    const tip = k.$('.sp-bug__tip');
    const root = k.$('.sp-ov');
    gsap.set(tip, { autoAlpha: 0, y: '0.4em' });
    const s = { x: 0, y: 0, a: 0 };
    let held = false;
    let walk;
    // One step of the random walk: turn a random amount, move a step, keep inside the page; then the next.
    const next = () => {
      if (held || reducedMotion) return;
      const em = parseFloat(getComputedStyle(root).fontSize);
      const [W, H] = [root.offsetWidth / 2 - 2 * em, root.offsetHeight / 2 - 2 * em];
      s.a += ((Math.random() - 0.5) * 2 * p.turn * Math.PI) / 180;
      let nx = s.x + Math.cos(s.a) * p.step * em;
      let ny = s.y + Math.sin(s.a) * p.step * em;
      if (Math.abs(nx) > W || Math.abs(ny) > H) s.a += Math.PI, (nx = clamp(nx, -W, W)), (ny = clamp(ny, -H, H)); // turn back at the edge
      [s.x, s.y] = [nx, ny];
      walk = gsap.timeline({ onComplete: next })
        .to(bug, { rotation: (s.a * 180) / Math.PI + 90, duration: 0.15, ease: 'power1.out' })
        .to(walker, { x: nx, y: ny, duration: 0.35 + Math.random() * 0.3, ease: 'none' })
        .to({}, { duration: Math.random() * 0.5 });
    };
    next();
    onHover(k, bug, (on) => {
      held = on;
      if (on) walk?.kill();
      gsap.to(tip, { autoAlpha: on ? 1 : 0, y: on ? 0 : '0.4em', duration: reducedMotion ? 0 : 0.2 });
      if (!on) next();
    });
    return () => { walk?.kill(); k.destroy(); };
  },
};
