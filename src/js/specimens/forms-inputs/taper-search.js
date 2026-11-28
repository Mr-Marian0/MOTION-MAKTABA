/** Taper Search: the collapsed search is a pointed little tab; opening it, the bar draws out of the point, its far end tapering until it squares off into a full field. Closing tapers it back to a point. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Taper Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard', 'Focus'],
  behavior: ['Toggle-dependent', 'Focus-dependent', 'Reversible'],
  effect: ['Tapering', 'Elongation', 'Shape-shifting'],
  purpose: ['Affordance', 'Focus', 'Continuity'],
  properties: ['Clip & mask', 'Shape', 'Size'],
  description: 'A search that lives as a pointed tab with a magnifier. Click it (or focus it) and the bar grows out of the tip: the far end stays tapered like a pencil point while it travels, then squares off when the field is full length and the cursor lands inside. Leaving it empty tapers it back down to the tab.',
  params: [
    { key: 'point', label: 'Taper length', group: 'Shape', type: 'range', min: 5, max: 40, step: 1, unit: '%', default: 18, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Tip'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('tpr');
    k.html(`
      <div class="sp sp-fi sp-tpr">
        <div class="sp-fi__wrap sp-tpr__wrap">
          <div class="sp-tpr__bar" role="search">
            <button type="button" class="sp-tpr__go" aria-label="Open search" aria-controls="${id}" aria-expanded="false">⌕</button>
            <input class="sp-fi__input sp-tpr__input" id="${id}" type="search" placeholder="Search recipes" tabindex="-1" aria-label="Search recipes" />
          </div>
          <p class="sp-note">Click the tab · Esc or click away to close</p>
        </div>
      </div>`);
    const bar = k.$('.sp-tpr__bar');
    const go = k.$('.sp-tpr__go');
    const input = k.$('.sp-tpr__input');
    // --len is how far the bar reaches (0..1 of full width); --tip is how pointed its far end is (0 = square)
    const shape = k.track({ len: 0, tip: 1 });
    const draw = () => {
      bar.style.setProperty('--len', shape.len.toFixed(4));
      bar.style.setProperty('--tip', (shape.tip * p.point).toFixed(2));
    };
    draw();
    let open = false, tl;
    const set = (on) => {
      if (on === open) return;
      open = on;
      go.setAttribute('aria-expanded', String(on));
      input.tabIndex = on ? 0 : -1;
      tl?.kill();
      tl = on
        ? gsap.timeline({ onUpdate: draw })
            .to(shape, { len: 1, duration: p.time, ease: 'power3.inOut' })
            .to(shape, { tip: 0, duration: p.time * 0.4, ease: 'back.out(2)' }, `-=${p.time * 0.15}`)
        : gsap.timeline({ onUpdate: draw })
            .to(shape, { tip: 1, duration: p.time * 0.3, ease: 'power2.in' })
            .to(shape, { len: 0, duration: p.time * 0.7, ease: 'power3.inOut' }, '<0.05');
      if (reducedMotion) tl.progress(1);
      if (on) input.focus();
    };
    k.on(go, 'click', () => set(!open));
    k.on(input, 'blur', () => !input.value && setTimeout(() => !bar.contains(document.activeElement) && set(false), 120));
    k.on(input, 'keydown', (e) => e.key === 'Escape' && (input.value = '', set(false), go.focus()));
    // Extra: typing sharpens the tip a touch, as if the pencil is writing
    k.on(input, 'input', () => !reducedMotion && gsap.fromTo(shape, { tip: 0.35 }, { tip: 0, duration: 0.35, ease: 'power2.out', onUpdate: draw, overwrite: 'auto' }));
    return () => k.destroy();
  },
};
