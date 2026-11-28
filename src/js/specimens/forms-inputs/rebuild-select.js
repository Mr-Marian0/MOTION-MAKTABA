/** Rebuild Select: picking an option takes the shown value apart letter by letter (the letters scatter) and builds the new one out of letters that fly in from all sides and lock into place. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Lisbon', 'Kyoto', 'Reykjavik', 'Oaxaca', 'Tbilisi'];

export const meta = {
  title: 'Rebuild Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Randomized', 'Staggered'],
  effect: ['Reconstructing', 'Disassembly', 'Shape-assembly'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A destination picker whose value is rebuilt rather than replaced. Choose a city and the letters of the current one break loose and scatter away, while the letters of the new name come flying in from random spots around the field, spinning, and click into place one after another, left to right.',
  params: [
    { key: 'scatter', label: 'Scatter', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'time', label: 'Build time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('rbs');
    k.html(`
      <div class="sp sp-fi sp-rbs">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Fly to</span>
          <button type="button" class="sp-fi__box sp-rbs__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v"><span class="sp-fi__value sp-rbs__value" id="${id}-v"></span><i class="sp-fi__caret">▾</i></button>
          <ul class="sp-fi__list sp-rbs__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 0)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-rbs__field');
    const value = k.$('.sp-rbs__value');
    const list = k.$('.sp-rbs__list');
    const letters = (t) => [...t].map((c) => `<span>${esc(c)}</span>`).join('');
    value.innerHTML = letters(ITEMS[0]);
    const r = (a) => `${(Math.random() - 0.5) * 2 * a}em`;
    const rebuild = (text) => {
      if (reducedMotion) return (value.innerHTML = letters(text));
      // Old letters: copies in a layer on top, scattering away
      const old = value.cloneNode(true);
      old.removeAttribute('id');
      old.classList.add('sp-rbs__old');
      old.setAttribute('aria-hidden', 'true');
      value.after(old);
      gsap.to(old.children, { x: () => r(p.scatter), y: () => r(p.scatter * 0.6), rotation: () => (Math.random() - 0.5) * 360, autoAlpha: 0, duration: p.time * 0.7, ease: 'power2.in', stagger: { each: 0.02, from: 'random' }, onComplete: () => old.remove() });
      // New letters: in from random spots, locking in left to right
      value.innerHTML = letters(text);
      gsap.from(value.children, { x: () => r(p.scatter), y: () => r(p.scatter * 0.6), rotation: () => (Math.random() - 0.5) * 360, autoAlpha: 0, duration: p.time, ease: 'back.out(1.6)', stagger: p.time * 0.06, delay: p.time * 0.25 });
    };
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      list.hidden = !open;
      if (open) {
        if (!reducedMotion) gsap.fromTo(list.children, { opacity: 0, y: '-0.4em' }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03 });
        list.querySelector('[aria-selected="true"]').focus();
      }
    };
    k.on(field, 'click', () => set(list.hidden));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    k.on(list, 'keydown', (e) => e.key === 'Escape' && (set(false), field.focus()));
    listKeys(k, list, (li, i) => {
      pickOpt(list, li);
      set(false);
      field.focus();
      rebuild(ITEMS[i]);
    });
    return () => k.destroy();
  },
};
