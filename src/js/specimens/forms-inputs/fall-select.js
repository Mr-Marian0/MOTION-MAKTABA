/** Fall Select: opening the list drops the options into place from above, each landing with a thud and a tiny bounce, bottom one first; closing lets them fall away through the floor. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Small · 250 ml', 'Medium · 350 ml', 'Large · 500 ml', 'Jug · 1 litre'];

export const meta = {
  title: 'Fall Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Staggered'],
  effect: ['Falling', 'Dropping', 'Impact-motion'],
  purpose: ['Continuity', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'A size picker whose options are stacked by gravity. Open it and they fall into place from above the field, the lowest option landing first and each next one on top of it, every landing a little squash and bounce. Close it and the floor opens: they fall away downward, top one last, accelerating out of sight.',
  params: [
    { key: 'drop', label: 'Drop height', group: 'Motion', type: 'range', min: 2, max: 12, step: 1, unit: 'em', default: 7, live: true },
    { key: 'time', label: 'Fall time', group: 'Motion', type: 'range', min: 0.2, max: 0.9, step: 0.05, unit: 's', default: 0.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('fal');
    k.html(`
      <div class="sp sp-fi sp-fal">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Cup size</span>
          <button type="button" class="sp-fi__box sp-fal__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v"><span class="sp-fi__value" id="${id}-v">${ITEMS[1]}</span><i class="sp-fi__caret">▾</i></button>
          <div class="sp-fal__well"><ul class="sp-fi__list sp-fal__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 1)}</ul></div>
        </div>
      </div>`);
    const field = k.$('.sp-fal__field');
    const value = k.$('.sp-fi__value');
    const list = k.$('.sp-fal__list');
    const opts = k.$$('.sp-fi__opt');
    let tl;
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      tl?.kill();
      if (open) list.hidden = false;
      const n = opts.length;
      tl = open
        // bottom option first; each falls (power2.in = gravity), lands squashed, springs back
        ? opts.reduceRight((t, o, i) => t
            .fromTo(o, { y: `-${p.drop}em`, opacity: 0, scaleY: 1 }, { y: 0, opacity: 1, duration: p.time, ease: 'power2.in' }, (n - 1 - i) * p.time * 0.45)
            .to(o, { keyframes: { scaleY: [0.8, 1.05, 1], y: ['0.1em', '-0.15em', 0] }, transformOrigin: '50% 100%', duration: 0.3, ease: 'none' }), gsap.timeline())
        : gsap.timeline({ onComplete: () => (list.hidden = true) }).to(opts, { y: `${p.drop}em`, opacity: 0, duration: p.time, ease: 'power2.in', stagger: { each: p.time * 0.2, from: 'end' } });
      if (reducedMotion) tl.progress(1);
      if (open) list.querySelector('[aria-selected="true"]').focus();
    };
    k.on(field, 'click', () => set(field.getAttribute('aria-expanded') !== 'true'));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    k.on(list, 'keydown', (e) => e.key === 'Escape' && (set(false), field.focus()));
    listKeys(k, list, (li) => {
      pickOpt(list, li);
      value.textContent = li.textContent;
      set(false);
      field.focus();
      // Extra: the field takes the hit of the value landing in it
      if (!reducedMotion) gsap.fromTo(field, { y: 0 }, { keyframes: { y: ['0.15em', 0] }, duration: 0.25, delay: p.time * 0.5 });
    });
    return () => k.destroy();
  },
};
