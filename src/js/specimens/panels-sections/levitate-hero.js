/** Levitate Hero: the objects on a desk (a notebook, a pen, a cup) and the headline rise off the surface as if by magic, each to its own height over a shrinking shadow, and hang there gently drifting. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Levitate Hero',
  element: 'Hero section',
  trigger: ['In view', 'Click', 'Hover'],
  behavior: ['Scroll-triggered', 'Staggered', 'Floating', 'Reversible'],
  effect: ['Levitation', 'Hovering', 'Drifting'],
  purpose: ['Storytelling', 'Branding', 'Delight'],
  properties: ['Position', 'Rotation', 'Shadow', 'Scale'],
  description: 'A hero set on a desk. When it scrolls into view, the notebook, pen, cup and the headline itself lift off the surface one after another, each to its own height, their shadows shrinking and softening beneath them, and hang in the air drifting slightly. Hover to lift them higher; "Set down" lowers them back.',
  params: [
    { key: 'height', label: 'Height', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'drift', label: 'Drift', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: 'em', default: 0.4 },
    tone('#b3412e', 'tone', '--sp-accent', 'Notebook'),
  ],
};

// [class, height factor, tilt in the air]
const THINGS = [['title', 1.1, -2], ['book', 0.8, -8], ['pen', 1.3, 18], ['cup', 0.6, 5]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-lev">
        <i class="sp-lev__desk"></i>
        ${THINGS.map(([c]) => `<div class="sp-lev__thing sp-lev__thing--${c}"><i class="sp-lev__shadow"></i><div class="sp-lev__obj">${c === 'title' ? '<b>Weightless</b><span class="sp-pn__kick">Notebooks that travel light</span>' : '<i></i>'}</div></div>`).join('')}
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-lev__btn">Set down</button>
      </div>`);
    const objs = k.$$('.sp-lev__obj');
    const shadows = k.$$('.sp-lev__shadow');
    const btn = k.$('.sp-lev__btn');
    let up = false;
    let drift = [];

    const lift = (on, extra = 1) => {
      up = on;
      btn.textContent = on ? 'Set down' : 'Lift';
      drift.forEach((d) => d.kill());
      drift = [];
      const t = reducedMotion ? 0 : 1.1;
      objs.forEach((o, i) => {
        const [, f, tilt] = THINGS[i];
        const h = on ? p.height * f * extra : 0;
        gsap.to(o, { y: `${-h}em`, rotation: on ? tilt : 0, duration: t, delay: on && !reducedMotion ? i * 0.15 : 0, ease: on ? 'power2.out' : 'bounce.out', overwrite: 'auto',
          // Once up, each keeps drifting on its own slow cycle
          onComplete: () => on && !reducedMotion && drift.push(gsap.to(o, { y: `${-h - p.drift}em`, rotation: tilt * 0.6, duration: 1.8 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })) });
        gsap.to(shadows[i], { scaleX: on ? 0.55 : 1, autoAlpha: on ? 0.35 : 0.8, duration: t, delay: on && !reducedMotion ? i * 0.15 : 0, ease: 'power2.out' });
      });
    };
    k.inView(stage, () => !up && lift(true), 0.5);
    k.on(btn, 'click', () => lift(!up));
    k.on(stage.firstElementChild, 'pointerenter', () => up && lift(true, 1.5));
    k.on(stage.firstElementChild, 'pointerleave', () => up && lift(true, 1));

    return () => { drift.forEach((d) => d.kill()); k.destroy(); };
  },
};
