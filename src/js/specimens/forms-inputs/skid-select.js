/** Skid Select: the chosen value comes skidding into the field like a car braking hard: it slides in leaning back, leaves skid marks, overshoots a touch and rocks to a stop, while the old value skids out the far side. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Standard · 3–5 days', 'Express · next day', 'Same day courier', 'Pick up in store'];

export const meta = {
  title: 'Skid Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Direction-aware', 'Momentum-driven'],
  effect: ['Skidding', 'Decelerating', 'Motion-smear'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A delivery-speed select where values arrive at speed. Pick an option and the current value skids out of the right side of the field while the new one slides in from the left, leaning back like a braking car with skid marks smearing behind it. It overshoots its resting spot by a hair and rocks upright. Picking an option further down the list skids in from the left, one further up from the right.',
  params: [
    { key: 'speed', label: 'Skid time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'lean', label: 'Lean', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '°', default: 9, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Marks'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('skd');
    k.html(`
      <div class="sp sp-fi sp-skd">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Delivery</span>
          <button type="button" class="sp-fi__box sp-skd__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v">
            <span class="sp-skd__track"><span class="sp-fi__value sp-skd__value" id="${id}-v">${esc(ITEMS[0])}</span></span><i class="sp-fi__caret">▾</i>
          </button>
          <ul class="sp-fi__list sp-skd__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 0)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-skd__field');
    const track = k.$('.sp-skd__track');
    const list = k.$('.sp-skd__list');
    let at = 0;
    const skid = (i) => {
      const dir = i > at ? 1 : -1;
      at = i;
      const old = track.querySelector('.sp-skd__value');
      if (reducedMotion) return (old.textContent = ITEMS[i]);
      const neu = old.cloneNode(false);
      neu.textContent = ITEMS[i];
      old.removeAttribute('id');
      old.setAttribute('aria-hidden', 'true');
      track.append(neu);
      const marks = document.createElement('i');
      marks.className = 'sp-skd__marks';
      track.append(marks);
      const t = p.speed;
      gsap.timeline({ onComplete: () => { old.remove(); marks.remove(); } })
        .to(old, { x: `${dir * 14}em`, skewX: dir * -12, autoAlpha: 0, duration: t * 0.5, ease: 'power2.in' }, 0)
        // the new value: fast in, braking hard (expo.out), leaning back as it brakes, then rocking upright
        .fromTo(neu, { x: `${-dir * 14}em`, rotation: 0, transformOrigin: dir > 0 ? '0% 100%' : '100% 100%' }, { x: `${dir * 0.3}em`, duration: t, ease: 'expo.out' }, 0.05)
        .to(neu, { rotation: -dir * p.lean, duration: t * 0.25, ease: 'power2.out' }, t * 0.25)
        .to(neu, { rotation: 0, x: 0, duration: t * 0.6, ease: 'elastic.out(1.1, 0.4)' }, t * 0.55)
        .fromTo(marks, { scaleX: 0, autoAlpha: 0.8, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%' }, { scaleX: 1, duration: t * 0.5, ease: 'expo.out' }, 0.05)
        .to(marks, { autoAlpha: 0, duration: t * 0.6 }, t * 0.6);
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
      set(false);
      field.focus();
      if (i !== at) skid(i);
    });
    return () => k.destroy();
  },
};
