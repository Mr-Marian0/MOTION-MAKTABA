/** Pour Select: choose a cup size and it is poured: a stream runs down into the field and the liquid flows in, filling it to that size's level with a sloshing surface, then the stream stops. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = [['Espresso', 0.25], ['Small', 0.45], ['Regular', 0.7], ['Large', 0.95]];

export const meta = {
  title: 'Pour Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Sequential', 'Physics-driven'],
  effect: ['Fluid-flow', 'Water-motion', 'Rising'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Path', 'Position'],
  description: 'A coffee-size select you can see filling. The chosen size is shown as how full the field is. Pick another and a thin stream pours in at the left end; the liquid level climbs (or drains) to the new size with a surface that sloshes as it moves, the stream thinning and stopping when it gets there. The option rows show their level too.',
  params: [
    { key: 'time', label: 'Pour time', group: 'Motion', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.1, live: true },
    tone('#6b4423', 'tone', '--sp-accent', 'Coffee'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('pou');
    k.html(`
      <div class="sp sp-fi sp-pou">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Cup</span>
          <button type="button" class="sp-fi__box sp-pou__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v">
            <svg class="sp-pou__liquid" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
            <i class="sp-pou__stream" aria-hidden="true"></i>
            <span class="sp-fi__value sp-pou__value" id="${id}-v">Regular</span><i class="sp-fi__caret">▾</i>
          </button>
          <ul class="sp-fi__list sp-pou__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS.map(([n]) => n), 2)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-pou__field');
    const value = k.$('.sp-pou__value');
    const list = k.$('.sp-pou__list');
    const path = k.$('.sp-pou__liquid path');
    const stream = k.$('.sp-pou__stream');
    k.$$('.sp-fi__opt').forEach((o, i) => o.style.setProperty('--lvl', ITEMS[i][1]));
    // Liquid fills from the left like a level in a sideways cup: x up to `level`, with a sloshing front edge
    const s = k.track({ level: 0.7, slosh: 0, ph: 0 });
    const draw = () => {
      const x = s.level * 100;
      const front = Array.from({ length: 9 }, (_, i) => `${(x + Math.sin(i * 0.9 + s.ph) * s.slosh * 6).toFixed(2)} ${i * 5}`);
      path.setAttribute('d', `M0 0 L${front.join(' L')} L0 40 Z`);
    };
    draw();
    gsap.set(stream, { scaleY: 0, transformOrigin: '50% 0%' });
    const pour = (lvl) => {
      if (reducedMotion) { s.level = lvl; return draw(); }
      gsap.timeline({ onUpdate: draw })
        .to(stream, { scaleY: 1, duration: 0.2, ease: 'power2.in' }, 0)
        .to(s, { level: lvl, duration: p.time, ease: 'power1.inOut' }, 0.1)
        .fromTo(s, { slosh: 1 }, { slosh: 0, duration: p.time + 0.6, ease: 'power2.out' }, 0.1)
        .to(s, { ph: `+=${Math.PI * 6}`, duration: p.time + 0.6, ease: 'none' }, 0.1)
        .to(stream, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.25 }, p.time)
        .set(stream, { transformOrigin: '50% 0%' });
    };
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      list.hidden = !open;
      if (open) list.querySelector('[aria-selected="true"]').focus();
    };
    k.on(field, 'click', () => set(list.hidden));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    k.on(list, 'keydown', (e) => e.key === 'Escape' && (set(false), field.focus()));
    listKeys(k, list, (li, i) => {
      pickOpt(list, li);
      value.textContent = ITEMS[i][0];
      set(false);
      field.focus();
      pour(ITEMS[i][1]);
    });
    return () => k.destroy();
  },
};
