/** Shift Heading: a headline printed on a shape that keeps changing its mind: click it and the shape behind the words shifts from circle to tile to blob to arch, recolouring as it morphs. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

const SHAPES = [
  ['50% 50% 50% 50% / 50% 50% 50% 50%', '#b3412e'],
  ['12% 12% 12% 12% / 12% 12% 12% 12%', '#2f4a6b'],
  ['62% 38% 54% 46% / 41% 57% 43% 59%', '#3e7d5a'],
  ['50% 50% 8% 8% / 60% 60% 8% 8%', '#c9a227'],
];

export const meta = {
  title: 'Shift Heading',
  element: 'Heading',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Cyclic', 'State-dependent', 'Interactive'],
  effect: ['Shape-shifting', 'Blob-morphing', 'Wobbling'],
  purpose: ['Branding', 'Delight'],
  properties: ['Shape', 'Radius', 'Color'],
  description: 'A poster headline stamped on a coloured shape that will not sit still. Click it (or press Enter) and the shape behind the words morphs into the next form: circle, square tile, lopsided blob, tall arch, shifting its colour as it goes and overshooting into each new silhouette. Hovering gives the current shape a little wobble.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Open studio' },
    { key: 'time', label: 'Morph time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#f4efe6', 'tone', '--sp-accent', 'Letters'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-shf">
        <button type="button" class="sp-shf__btn" aria-label="${esc(p.text)}: change shape">
          <i class="sp-shf__shape" aria-hidden="true"></i><h4 class="sp-tm__h sp-shf__h">${esc(p.text)}</h4>
        </button>
        <p class="sp-note">Click the headline</p>
      </div>`);
    const btn = k.$('.sp-shf__btn');
    const shape = k.$('.sp-shf__shape');
    let at = 0;
    gsap.set(shape, { borderRadius: SHAPES[0][0], backgroundColor: SHAPES[0][1] });
    k.on(btn, 'click', () => {
      at = (at + 1) % SHAPES.length;
      const [r, c] = SHAPES[at];
      gsap.to(shape, { borderRadius: r, backgroundColor: c, rotation: `+=${at % 2 ? 12 : -12}`, duration: reducedMotion ? 0 : p.time, ease: 'elastic.out(1, 0.55)', overwrite: true });
      if (!reducedMotion) gsap.fromTo(shape, { scale: 0.88 }, { scale: 1, duration: p.time, ease: 'elastic.out(1, 0.4)' });
    });
    // Extra: hover wobbles the current shape
    k.on(btn, 'pointerenter', () => !reducedMotion && gsap.fromTo(shape, { scaleX: 1.06, scaleY: 0.95 }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' }));
    return () => k.destroy();
  },
};
