/** Twist Select: the option list unspools from the field like a twisted ribbon: each option starts turned edge-on a little more than the one above it, and the twist runs out down the list until it lies flat. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Espresso', 'Flat white', 'Cortado', 'Pour-over', 'Cold brew'];

export const meta = {
  title: 'Twist Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Reversible'],
  effect: ['Twisting', 'Torsional-deformation', 'Unfolding'],
  purpose: ['Continuity', 'Delight', 'Hierarchy'],
  properties: ['Rotation', 'Opacity'],
  description: 'A coffee picker whose list comes out like a twisted ribbon. Opening it, every option starts turned edge-on around its own horizontal axis, each one a few degrees further than the last, and the twist unwinds down the list until the whole ribbon lies flat. Closing winds it back up into the field.',
  params: [
    { key: 'twist', label: 'Twist per row', group: 'Motion', type: 'range', min: 20, max: 120, step: 5, unit: '°', default: 60, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Roast'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('tws');
    k.html(`
      <div class="sp sp-fi sp-tws">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Your order</span>
          <button type="button" class="sp-fi__box sp-tws__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v"><span class="sp-fi__value" id="${id}-v">Flat white</span><i class="sp-fi__caret">▾</i></button>
          <ul class="sp-fi__list sp-tws__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 1)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-tws__field');
    const value = k.$('.sp-fi__value');
    const caret = k.$('.sp-fi__caret');
    const list = k.$('.sp-tws__list');
    const opts = k.$$('.sp-fi__opt');
    gsap.set(opts, { transformPerspective: 500, transformOrigin: '50% 0%' });
    let tl;
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      tl?.kill();
      gsap.to(caret, { rotation: open ? 180 : 0, duration: reducedMotion ? 0 : 0.3 });
      if (open) list.hidden = false;
      // Row i starts twisted by twist × (i+1): the further down the ribbon, the more it is turned.
      // Opacity (not autoAlpha), so the options stay focusable while they unwind.
      tl = open
        ? gsap.timeline().fromTo(opts, { rotationX: (i) => -p.twist * (i + 1), rotationY: (i) => p.twist * 0.25 * (i + 1), opacity: 0 }, { rotationX: 0, rotationY: 0, opacity: 1, duration: p.time, ease: 'power3.out', stagger: p.time * 0.08 })
        : gsap.timeline({ onComplete: () => (list.hidden = true) }).to(opts, { rotationX: (i) => -p.twist * (i + 1), rotationY: (i) => p.twist * 0.25 * (i + 1), opacity: 0, duration: p.time * 0.5, ease: 'power2.in', stagger: { each: p.time * 0.05, from: 'end' } });
      if (reducedMotion) tl.progress(1);
      if (open) (list.querySelector('[aria-selected="true"]') || opts[0]).focus();
    };
    k.on(field, 'click', () => set(field.getAttribute('aria-expanded') !== 'true'));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    listKeys(k, list, (li) => {
      pickOpt(list, li);
      value.textContent = li.textContent;
      set(false);
      field.focus();
    });
    k.on(list, 'keydown', (e) => e.key === 'Escape' && (set(false), field.focus()));
    // Extra: hovering an option gives it a small twist of its own
    opts.forEach((o) => k.on(o, 'pointerenter', () => !reducedMotion && field.getAttribute('aria-expanded') === 'true' && gsap.fromTo(o, { rotationX: -25 }, { rotationX: 0, duration: 0.5, ease: 'back.out(3)', overwrite: 'auto' })));
    return () => k.destroy();
  },
};
