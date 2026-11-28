/** Levitate Select: options lie flat on the table; the one you point at or arrow to rises up off it, hovering over its own soft shadow, and the one you pick floats all the way up into the field. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Ceramic', 'Stoneware', 'Porcelain', 'Terracotta'];

export const meta = {
  title: 'Levitate Select',
  element: 'Select',
  trigger: ['Hover', 'Keyboard', 'Click'],
  behavior: ['Hover-dependent', 'Focus-dependent', 'Floating'],
  effect: ['Levitation', 'Hovering', 'Rising'],
  purpose: ['Affordance', 'Focus', 'Delight'],
  properties: ['Position', 'Shadow', 'Scale'],
  description: 'A material picker that is always open, its options lying flat like tiles. Point at one, or move to it with the arrow keys, and it levitates: it lifts off the surface while a soft shadow stays behind and spreads beneath it, then hangs there with a slow hover. Pick one and it rises all the way up and drops into the field above as the new value.',
  params: [
    { key: 'lift', label: 'Lift', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 'em', default: 0.55, live: true },
    { key: 'hover', label: 'Hover bob', group: 'Motion', type: 'range', min: 0, max: 0.3, step: 0.02, unit: 'em', default: 0.1, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lev');
    k.html(`
      <div class="sp sp-fi sp-lev">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Glaze body</span>
          <div class="sp-fi__box sp-lev__field" aria-live="polite"><span class="sp-fi__value">Stoneware</span></div>
          <ul class="sp-fi__list sp-lev__list" role="listbox" aria-labelledby="${id}-l">${options(ITEMS, 1)}</ul>
        </div>
      </div>`);
    const value = k.$('.sp-fi__value');
    const list = k.$('.sp-lev__list');
    const opts = k.$$('.sp-fi__opt');
    // The shadow is the option's box-shadow: as the tile rises by L, the shadow drops by L (it stays on the
    // table) and spreads and softens. Only the hovered tile's shadow changes, so it is cheap.
    const flat = '0 0 0 0 rgb(17 17 17 / 0)';
    const lifted = (L) => `0 ${L + 0.1}em ${0.5 + L}em -0.1em rgb(17 17 17 / 0.3)`;
    let up = null, bob;
    const rise = (o) => {
      if (o === up) return;
      const d = reducedMotion ? 0 : 1;
      bob?.kill();
      if (up) gsap.to(up, { y: 0, boxShadow: flat, duration: 0.35 * d, ease: 'power2.inOut', overwrite: true });
      up = o;
      if (!o) return;
      gsap.to(o, { y: `-${p.lift}em`, boxShadow: lifted(p.lift), duration: 0.45 * d, ease: 'back.out(2)', overwrite: true, onComplete: () => {
        if (reducedMotion || !p.hover) return;
        bob = gsap.to(o, { y: `-${p.lift + p.hover}em`, boxShadow: lifted(p.lift + p.hover), duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
      } });
    };
    opts.forEach((o) => {
      k.on(o, 'pointerenter', () => rise(o));
      k.on(o, 'focus', () => rise(o));
    });
    // Leaving the list hands the lift back to the keyboard-focused option, if there is one
    k.on(list, 'pointerleave', () => rise(list.contains(document.activeElement) ? document.activeElement : null));
    listKeys(k, list, (li) => {
      pickOpt(list, li);
      const text = li.textContent;
      if (reducedMotion) return (value.textContent = text);
      gsap.timeline()
        .to(li, { y: '-1.6em', scale: 1.04, duration: 0.3, ease: 'power2.out', overwrite: true })
        .to(value, { y: '-0.8em', opacity: 0, duration: 0.2 }, 0)
        .call(() => (value.textContent = text))
        .fromTo(value, { y: '0.8em', opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' })
        .to(li, { y: `-${p.lift}em`, scale: 1, duration: 0.4, ease: 'power2.out' }, '<');
    });
    return () => { bob?.kill(); k.destroy(); };
  },
};
