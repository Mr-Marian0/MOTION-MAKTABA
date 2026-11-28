/** Tumble Select: the value sits on the face of a block; picking an option tumbles the block end over end like a thrown die, flashing other values on the way, until it lands on your choice. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests'];

export const meta = {
  title: 'Tumble Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Randomized', 'Sequential'],
  effect: ['Tumbling', 'Rolling', 'Decelerating'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Rotation', 'Position'],
  description: 'A guests picker whose value is printed on a block. Choose a number and the block tumbles forward end over end, each turn showing another number on its next face, slowing down with every turn like a die coming to rest, and lands on your choice with a small bounce.',
  params: [
    { key: 'turns', label: 'Tumbles', group: 'Motion', type: 'range', min: 1, max: 6, step: 1, unit: '', default: 3, live: true },
    { key: 'time', label: 'Tumble time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Block'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('tmb');
    k.html(`
      <div class="sp sp-fi sp-tmb">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Table for</span>
          <button type="button" class="sp-fi__box sp-tmb__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v">
            <span class="sp-tmb__stage"><span class="sp-tmb__face" id="${id}-v">${esc(ITEMS[1])}</span><span class="sp-tmb__face sp-tmb__next" aria-hidden="true"></span></span><i class="sp-fi__caret">▾</i>
          </button>
          <ul class="sp-fi__list sp-tmb__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 1)}</ul>
        </div>
      </div>`);
    const field = k.$('.sp-tmb__field');
    const [face, next] = k.$$('.sp-tmb__face');
    const list = k.$('.sp-tmb__list');
    // One quarter-turn: the face tips away over its top edge while the next face comes up from below
    const half = '50% 50% -0.8em';
    gsap.set([face, next], { transformOrigin: half, transformPerspective: 400 });
    gsap.set(next, { rotationX: 90 });
    let tl;
    const tumble = (target) => {
      tl?.kill();
      if (reducedMotion) return (face.textContent = ITEMS[target]);
      const n = Math.round(p.turns);
      const seq = [...Array.from({ length: n - 1 }, () => ITEMS[Math.floor(Math.random() * ITEMS.length)]), ITEMS[target]];
      const total = n * (n + 1) / 2;
      tl = gsap.timeline();
      seq.forEach((text, i) => {
        const dur = (p.time * (i + 1)) / total; // each turn slower than the last
        tl.call(() => { next.textContent = text; gsap.set(next, { rotationX: 90 }); gsap.set(face, { rotationX: 0 }); })
          .to(face, { rotationX: -90, duration: dur, ease: i === n - 1 ? 'power2.out' : 'none' })
          .to(next, { rotationX: 0, duration: dur, ease: i === n - 1 ? 'power2.out' : 'none' }, '<')
          .call(() => { face.textContent = text; gsap.set(face, { rotationX: 0 }); gsap.set(next, { rotationX: 90 }); });
      });
      tl.fromTo(field, { y: 0 }, { keyframes: { y: ['-0.2em', 0] }, duration: 0.3, ease: 'power2.out' });
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
      tumble(i);
    });
    return () => k.destroy();
  },
};
