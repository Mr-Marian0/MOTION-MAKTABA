/** Fall Tip: the tooltip falls onto the term from above, picking up speed, lands with a squash, and when you leave it drops off the line and falls away. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Fall Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Gravity-driven', 'Anchored'],
  effect: ['Falling', 'Squashing', 'Bouncing', 'Tumbling'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Position', 'Scale', 'Rotation', 'Opacity'],
  description: 'A tooltip with weight. Hover the term and the tooltip falls onto it from above, speeding up as it comes, lands with a squash and a small bounce. Leave and it tips off its perch and falls away below the line, turning as it goes.',
  params: [
    { key: 'drop', label: 'Drop height', group: 'Motion', type: 'range', min: 2, max: 12, step: 1, unit: 'em', default: 6, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Underline'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('fat');
    k.html(`
      <div class="sp sp-ov sp-fat">
        ${page('Glossary', 'Bookbinding')}
        <span class="sp-ov__anchor sp-fat__term" tabindex="0" aria-describedby="${id}">signature</span>
        <span class="sp-ov__tip sp-fat__tip" id="${id}" role="tooltip">A folded sheet sewn in as one group of pages.</span>
      </div>`);
    const tip = k.$('.sp-fat__tip');
    gsap.set(tip, { autoAlpha: 0, transformOrigin: '50% 100%' });
    let tl;
    onHover(k, k.$('.sp-fat__term'), (on) => {
      tl?.kill();
      if (reducedMotion) return gsap.set(tip, { autoAlpha: on ? 1 : 0, y: 0, rotation: 0 });
      tl = on
        ? gsap.timeline()
            .fromTo(tip, { autoAlpha: 1, y: `${-p.drop}em`, rotation: 0, scaleX: 1, scaleY: 1 }, { y: 0, duration: 0.45, ease: 'power2.in' })
            .to(tip, { scaleY: 0.75, scaleX: 1.12, duration: 0.07 })
            .to(tip, { scaleY: 1, scaleX: 1, y: '-0.4em', duration: 0.18, ease: 'power2.out' })
            .to(tip, { y: 0, duration: 0.25, ease: 'bounce.out' })
        : gsap.timeline()
            .to(tip, { rotation: 8, transformOrigin: '0% 100%', duration: 0.15 })
            .to(tip, { y: `${p.drop}em`, rotation: 40, autoAlpha: 0, duration: 0.5, ease: 'power2.in' });
    });
    return () => { tl?.kill(); k.destroy(); };
  },
};
