/** Rebound Select: the option list is thrown open and rebounds: it shoots down past where it should stop, bounces back up off an invisible floor, and settles; moving past the last option makes the list rebound off its end. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Morning · 8–10', 'Late morning · 10–12', 'Afternoon · 12–4', 'Evening · 4–8'];

export const meta = {
  title: 'Rebound Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Boundary-aware', 'Elastic'],
  effect: ['Rebound-motion', 'Rebounding', 'Overshoot-motion'],
  purpose: ['Feedback', 'Affordance', 'Delight'],
  properties: ['Position', 'Scale'],
  description: 'A delivery-slot select with a springy list. It drops open fast, overshoots the bottom, rebounds back up and settles with a smaller second bounce. Press ↓ on the last slot (or ↑ on the first) and the whole list rebounds off its end, stretching a little that way and springing back, to say there is nothing further.',
  params: [
    { key: 'over', label: 'Overshoot', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.9, live: true },
    { key: 'time', label: 'Rebound time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('rbd');
    k.html(`
      <div class="sp sp-fi sp-rbd">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Delivery slot</span>
          <button type="button" class="sp-fi__box sp-rbd__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v"><span class="sp-fi__value" id="${id}-v">${ITEMS[2]}</span><i class="sp-fi__caret">▾</i></button>
          <ul class="sp-fi__list sp-rbd__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 2)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-rbd__field');
    const value = k.$('.sp-fi__value');
    const list = k.$('.sp-rbd__list');
    gsap.set(list, { transformOrigin: '50% 0%' });
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      if (!open) {
        gsap.to(list, { y: '-0.6em', opacity: 0, duration: reducedMotion ? 0 : 0.15, onComplete: () => (list.hidden = true), overwrite: true });
        return;
      }
      list.hidden = false;
      const t = reducedMotion ? 0 : p.time;
      gsap.killTweensOf(list);
      gsap.timeline()
        .fromTo(list, { y: '-1.5em', opacity: 0, scaleY: 0.9 }, { y: `${p.over}em`, opacity: 1, scaleY: 1.04, duration: t * 0.3, ease: 'power2.in' })
        .to(list, { y: `-${p.over * 0.35}em`, scaleY: 0.98, duration: t * 0.3, ease: 'power2.out' })
        .to(list, { y: 0, scaleY: 1, duration: t * 0.4, ease: 'bounce.out' });
      list.querySelector('[aria-selected="true"]').focus();
    };
    k.on(field, 'click', () => set(list.hidden));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    // Rebound off the ends (runs before listKeys' handler sees the key)
    k.on(list, 'keydown', (e) => {
      if (e.key === 'Escape') return set(false), field.focus();
      const all = [...list.children];
      const i = all.indexOf(document.activeElement);
      const edge = (e.key === 'ArrowDown' && i === all.length - 1) ? 1 : (e.key === 'ArrowUp' && i === 0) ? -1 : 0;
      if (!edge || reducedMotion) return;
      gsap.timeline()
        .to(list, { y: `${edge * 0.4}em`, scaleY: 1.03, transformOrigin: edge > 0 ? '50% 0%' : '50% 100%', duration: 0.1, ease: 'power2.out' })
        .to(list, { y: 0, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.35)' });
    });
    listKeys(k, list, (li) => {
      pickOpt(list, li);
      value.textContent = li.textContent;
      set(false);
      field.focus();
    });
    return () => k.destroy();
  },
};
