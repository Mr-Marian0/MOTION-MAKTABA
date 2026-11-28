/** Rope Select: the option list hangs from the field on two ropes: opening it lowers the list on the ropes, which go slack and taut as it bounces and sways; picking an option hauls the list back up. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { options, listKeys, pickOpt } from './_fi.js';

const ITEMS = ['Pine', 'Cedar', 'Birch', 'Larch'];

export const meta = {
  title: 'Rope Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Elastic'],
  effect: ['Rope-motion', 'Swinging', 'Rebounding'],
  purpose: ['Delight', 'Continuity', 'Storytelling'],
  properties: ['Path', 'Position', 'Rotation'],
  description: 'A timber picker whose list is lowered on ropes, like a sign on a pulley. Open it and the list drops on two ropes from the bottom of the field: it falls, the ropes snap taut and it bounces a little, swaying from side to side so one rope sags while the other pulls tight, until it hangs still. Pick a timber and the list is hauled back up into the field.',
  params: [
    { key: 'drop', label: 'Rope length', group: 'Shape', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 'em', default: 1.4 },
    { key: 'sway', label: 'Sway', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: '°', default: 5, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Rope'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('rop');
    k.html(`
      <div class="sp sp-fi sp-rop" style="--drop:${p.drop}em">
        <div class="sp-fi__wrap">
          <span class="sp-fi__label" id="${id}-l">Timber</span>
          <button type="button" class="sp-fi__box sp-rop__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v"><span class="sp-fi__value" id="${id}-v">Cedar</span><i class="sp-fi__caret">▾</i></button>
          <div class="sp-rop__rig">
            <svg class="sp-rop__ropes" aria-hidden="true"><path /><path /></svg>
            <ul class="sp-fi__list sp-rop__list" role="listbox" aria-labelledby="${id}-l" hidden>${options(ITEMS, 1)}</ul>
          </div>
        </div>
      </div>`);
    const field = k.$('.sp-rop__field');
    const value = k.$('.sp-fi__value');
    const rig = k.$('.sp-rop__rig');
    const list = k.$('.sp-rop__list');
    const ropes = k.$$('.sp-rop__ropes path');
    // Rig size and the list's rest position are measured on resize; each frame only reads GSAP's own values
    gsap.set(list, { transformOrigin: '50% 0%' }); // it swings from its top edge, where the ropes are tied
    let W = 1, L = 20;
    k.resize(rig, () => { W = rig.offsetWidth; L = list.offsetTop; draw(); });
    const draw = () => {
      if (list.hidden) return ropes.forEach((r) => r.setAttribute('d', ''));
      const y = gsap.getProperty(list, 'y');
      const rot = (gsap.getProperty(list, 'rotation') * Math.PI) / 180;
      [0.12, 0.88].forEach((f, i) => {
        const ax = W * f;
        // the list's corner, turned about the list's top centre
        const dx = (f - 0.5) * W;
        const ex = W / 2 + dx * Math.cos(rot);
        const ey = L + y + dx * Math.sin(rot);
        // slack: the shorter the span compared with the rope, the more it sags
        const span = Math.hypot(ex - ax, ey);
        const sag = Math.max(0, L * 1.02 - span) * 1.4;
        ropes[i].setAttribute('d', `M${ax} 0 Q${(ax + ex) / 2 + sag * 0.6} ${ey / 2 + sag} ${ex} ${ey}`);
      });
    };
    const set = (open) => {
      field.setAttribute('aria-expanded', String(open));
      gsap.killTweensOf(list);
      if (open) {
        list.hidden = false;
        L = list.offsetTop;
        if (reducedMotion) { gsap.set(list, { y: 0, rotation: 0 }); draw(); }
        else gsap.timeline({ onUpdate: draw })
          .fromTo(list, { y: -L - 20, rotation: 0, opacity: 1 }, { y: 0, duration: 0.35, ease: 'power2.in' })
          .to(list, { keyframes: { y: [6, -3, 0] }, duration: 0.5, ease: 'power1.out' })
          .fromTo(list, { rotation: p.sway }, { rotation: 0, duration: 2.2, ease: 'elastic.out(1, 0.15)' }, 0.3);
        list.querySelector('[aria-selected="true"]').focus();
      } else if (reducedMotion) {
        list.hidden = true;
        draw();
      } else {
        gsap.timeline({ onUpdate: draw, onComplete: () => { list.hidden = true; draw(); } })
          .to(list, { y: -L - 20, rotation: 0, opacity: 0, duration: 0.4, ease: 'power2.in' });
      }
    };
    k.on(field, 'click', () => set(list.hidden));
    k.on(field, 'keydown', (e) => e.key === 'ArrowDown' && (e.preventDefault(), set(true)));
    k.on(list, 'keydown', (e) => e.key === 'Escape' && (set(false), field.focus()));
    listKeys(k, list, (li) => {
      pickOpt(list, li);
      value.textContent = li.textContent;
      set(false);
      field.focus();
    });
    return () => k.destroy();
  },
};
