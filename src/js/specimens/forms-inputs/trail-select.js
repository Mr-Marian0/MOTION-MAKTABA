/** Trail Select: the highlight that marks the hovered option glides between options and leaves a motion trail: a row of fading after-images that catch up one by one. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Charcoal', 'Graphite', 'Sepia ink', 'Conte crayon', 'Silverpoint'];

export const meta = {
  title: 'Trail Select',
  element: 'Select',
  trigger: ['Hover', 'Keyboard', 'Click'],
  behavior: ['Cursor-following', 'Trailing', 'Hover-dependent'],
  effect: ['Motion-trail', 'Afterimage-motion', 'Echo-motion'],
  purpose: ['Focus', 'Orientation', 'Delight'],
  properties: ['Position', 'Opacity'],
  description: 'A drawing-medium list whose highlight moves like a fast pen stroke. As you point at options (or arrow through them) the highlight glides to the one under you, and behind it a short train of fainter copies follows, each a beat later, so every move leaves a fading smear that closes up when it arrives. The chosen medium gets a solid mark.',
  params: [
    { key: 'trail', label: 'Trail length', group: 'Shape', type: 'range', min: 2, max: 8, step: 1, unit: '', default: 5 },
    { key: 'lag', label: 'Lag', group: 'Motion', type: 'range', min: 0.05, max: 0.4, step: 0.01, unit: 's', default: 0.14, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Highlight'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('trl');
    const n = Math.round(p.trail);
    k.html(`
      <div class="sp sp-fi sp-trl">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}">Medium</span>
          <div class="sp-trl__box">
            ${Array.from({ length: n + 1 }, (_, i) => `<i class="sp-trl__ghost" style="opacity:${i ? (0.45 * (1 - i / (n + 1))).toFixed(2) : 1}" aria-hidden="true"></i>`).reverse().join('')}
            <ul class="sp-fi__list sp-trl__list" role="listbox" aria-labelledby="${id}">${options(ITEMS, 0)}</ul>
          </div>
        </div>
      </div>`);
    const list = k.$('.sp-trl__list');
    const opts = k.$$('.sp-fi__opt');
    const ghosts = k.$$('.sp-trl__ghost').reverse(); // [0] = the highlight itself, then the trail
    // Each copy chases the target option with a slower ease. The option's position is read once per move
    // (never per frame), so it is always current, whenever and however the card was laid out.
    const movers = ghosts.map((g, i) => gsap.quickTo(g, 'y', { duration: reducedMotion ? 0 : 0.18 + i * p.lag, ease: 'power3.out' }));
    let at = 0;
    function go(i, now) {
      at = i;
      opts.forEach((o, j) => o.classList.toggle('is-lit', j === i));
      const [y, h] = [opts[i].offsetTop, opts[i].offsetHeight];
      ghosts.forEach((g, j) => (now ? gsap.set(g, { y, height: h }) : (gsap.set(g, { height: h }), movers[j](y))));
    }
    k.resize(list, () => go(at, true));
    opts.forEach((o, i) => {
      k.on(o, 'pointerenter', () => go(i));
      k.on(o, 'focus', () => go(i));
    });
    listKeys(k, list, (li) => pickOpt(list, li));
    return () => k.destroy();
  },
};
