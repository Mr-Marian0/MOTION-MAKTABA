/** Exploded View: the product card tips into 3D and its layers (base, photo, title, price, button) pull apart like an exploded diagram, each with a label. */
import { kit, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Exploded View',
  element: 'Product card',
  trigger: ['Hover', 'Click', 'Focus'],
  behavior: ['Hover-dependent', 'Toggle-dependent', 'Staggered', 'Reversible', 'Hierarchical'],
  effect: ['Disassembly', 'Axial-rotation', 'Levitation'],
  purpose: ['Hierarchy', 'Storytelling', 'Delight'],
  properties: ['Depth (z)', 'Rotation', 'Position', 'Shadow'],
  description: 'A product card that shows how it is built. Hover (or press the button) and it tips back into 3D while its layers lift apart one by one: base, photo, title, price and button, each with a label. Leave and it stacks back together.',
  params: [
    { key: 'gap', label: 'Layer gap', group: 'Layout', type: 'range', min: 1, max: 4, step: 0.25, unit: 'em', default: 1.75, live: true },
    { key: 'tilt', label: 'Tilt', group: 'Motion', type: 'range', min: 20, max: 65, step: 5, unit: '°', default: 50, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Back', live: true },
    tone('#a07a52'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const layer = (cls, inner, tag) => `<div class="sp-xv__layer ${cls}">${inner}<i class="sp-xv__tag">${tag}</i></div>`;
    k.html(`
      <div class="sp sp-cc sp-xv">
        <div class="sp-cc__wrap sp-xv__scene">
          <article class="sp-cc__card sp-xv__card">
            <i class="sp-xv__base"></i>
            ${layer('', '<i class="sp-cc__img sp-xv__img"><i></i></i>', 'Photo')}
            ${layer('', '<b class="sp-cc__title">Desk Lamp</b><span class="sp-cc__text">Folded steel · warm light</span>', 'Title')}
            ${layer('sp-cc__row', '<b class="sp-cc__price">$84</b><span class="sp-xv__stars">★★★★☆</span>', 'Price')}
            ${layer('', '<span class="sp-cc__btn sp-xv__buy">Add to bag</span>', 'Action')}
            <i class="sp-xv__tag sp-xv__tag--base">Base</i>
          </article>
        </div>
        <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-xv__btn" aria-pressed="false">Exploded view</button>
      </div>`);
    const scene = k.$('.sp-xv__scene');
    const card = k.$('.sp-xv__card');
    const layers = k.$$('.sp-xv__layer');
    const tags = k.$$('.sp-xv__tag');
    const btn = k.$('.sp-xv__btn');
    k.fit(scene, 0.7);
    gsap.set(tags, { autoAlpha: 0 });
    gsap.set(layers, { z: (i) => (i + 1) * 3 });
    let locked = false;

    const set = (open) => {
      const dur = reducedMotion ? 0 : 0.8;
      const ease = EASES[p.ease] || 'back.out(1.8)';
      gsap.to(card, { rotationX: open ? p.tilt : 0, rotationZ: open ? -28 : 0, y: open ? '-0.5em' : 0, duration: dur, ease: 'power3.inOut' });
      // z in px (from the card's em), and never exactly 0: a layer flush with the card face flickers behind it while tilted.
      // Open, the top layer lifts highest, so the tilt fans the layers apart instead of piling them up.
      const em = parseFloat(getComputedStyle(card).fontSize);
      gsap.to(layers, { z: (i) => (open ? (layers.length - i) * p.gap * em : (i + 1) * 3), duration: dur, ease, stagger: { each: reducedMotion ? 0 : 0.07, from: open ? 'start' : 'end' } });
      gsap.to(tags, { autoAlpha: open ? 1 : 0, duration: dur * 0.4, delay: open ? dur * 0.6 : 0 });
    };
    k.on(scene, 'pointerenter', () => !locked && set(true));
    k.on(scene, 'pointerleave', () => !locked && set(false));
    k.on(btn, 'click', () => {
      locked = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(locked));
      set(locked);
    });

    return () => k.destroy();
  },
};
