/** Wrap Note: write a gift message, press "Wrap it", and paper folds in over the card from each side, then top and bottom, and a seal presses on; "Unwrap" opens it again to edit. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wrap Note',
  element: 'Textarea',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Wrapping', 'Folding', 'Unwrapping'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Rotation', 'Opacity', 'Scale'],
  description: 'A gift-message box that wraps itself up when you are done. Press "Wrap it" and two side flaps of patterned paper fold in over the message, then the top and bottom flaps fold down over those, and a wax-style seal stamps on with your initial. "Unwrap" peels the seal and unfolds the paper in reverse so you can keep writing.',
  params: [
    { key: 'time', label: 'Wrap time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    { key: 'initial', label: 'Seal letter', group: 'Content', type: 'text', default: 'M' },
    tone('#b3412e', 'tone', '--sp-accent', 'Seal'),
  ],
};

// [class, transform origin, folded-out rotation]: sides first, then top and bottom
const FLAPS = [['l', '0% 50%', { rotationY: -178 }], ['r', '100% 50%', { rotationY: 178 }], ['t', '50% 0%', { rotationX: 178 }], ['b', '50% 100%', { rotationX: -178 }]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wrp');
    k.html(`
      <div class="sp sp-fi sp-wrp">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Gift message</label>
          <div class="sp-wrp__card">
            <textarea class="sp-fi__area sp-wrp__area" id="${id}" placeholder="Happy birthday! Don't open it before Sunday.">Happy birthday! Don't open it before Sunday.</textarea>
            ${FLAPS.map(([c]) => `<i class="sp-wrp__flap sp-wrp__flap--${c}" aria-hidden="true"></i>`).join('')}
            <b class="sp-wrp__seal" aria-hidden="true">${(p.initial || 'M').slice(0, 1)}</b>
          </div>
          <button type="button" class="sp-fi__btn sp-wrp__go" aria-pressed="false">Wrap it</button>
        </div>
      </div>`);
    const area = k.$('.sp-wrp__area');
    const flaps = k.$$('.sp-wrp__flap');
    const seal = k.$('.sp-wrp__seal');
    const go = k.$('.sp-wrp__go');
    flaps.forEach((f, i) => gsap.set(f, { transformOrigin: FLAPS[i][1], transformPerspective: 600, ...FLAPS[i][2], autoAlpha: 0 }));
    gsap.set(seal, { autoAlpha: 0, scale: 2 });
    const t = p.time;
    const wrap = gsap.timeline({ paused: true });
    flaps.forEach((f, i) => wrap.set(f, { autoAlpha: 1 }, i * t * 0.22).to(f, { rotationX: 0, rotationY: 0, duration: t * 0.3, ease: 'power2.inOut' }, i * t * 0.22));
    wrap.to(seal, { autoAlpha: 1, scale: 1, rotation: -8, duration: t * 0.2, ease: 'power4.in' }).to(k.$('.sp-wrp__card'), { keyframes: { scale: [0.98, 1] }, duration: 0.2 });
    k.on(go, 'click', () => {
      const on = go.getAttribute('aria-pressed') !== 'true';
      go.setAttribute('aria-pressed', String(on));
      go.textContent = on ? 'Unwrap' : 'Wrap it';
      area.readOnly = on;
      if (reducedMotion) wrap.progress(on ? 1 : 0).pause();
      else on ? wrap.timeScale(1).play() : wrap.timeScale(1.6).reverse();
      if (!on) area.focus();
    });
    // Extra: hovering the wrapped parcel wiggles the seal
    k.on(k.$('.sp-wrp__card'), 'pointerenter', () => !reducedMotion && area.readOnly && gsap.fromTo(seal, { rotation: -8 }, { keyframes: { rotation: [-14, -2, -8] }, duration: 0.45 }));
    return () => k.destroy();
  },
};
