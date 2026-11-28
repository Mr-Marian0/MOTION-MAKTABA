/** Prism Field: while the address is invalid its text is split like light through a prism: red and blue fringes slide apart and waver; once the address is valid the colours slide back together into clean black. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Prism Field',
  element: 'Text field',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['Conditional', 'State-dependent', 'Reactive'],
  effect: ['Chromatic-aberration-motion', 'RGB-splitting', 'Merging'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Color', 'Position'],
  description: 'An email field that shows "not quite right" as a colour fringe. While what you have typed is not a valid address, the text carries red and blue ghost copies offset to either side, as if seen through a cheap lens, and the offset wavers slightly as you type. The moment the address becomes valid, the fringes slide back into the text and it sharpens to plain ink, with a small tick.',
  params: [
    { key: 'split', label: 'Split', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'px', default: 1.5, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Valid'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('psm');
    k.html(`
      <div class="sp sp-fi sp-psm">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Work email</label>
          <div class="sp-fi__box sp-psm__box">
            <span class="sp-psm__ch sp-psm__ch--r" aria-hidden="true"></span><span class="sp-psm__ch sp-psm__ch--b" aria-hidden="true"></span>
            <input class="sp-fi__input sp-psm__input" id="${id}" type="email" autocomplete="off" value="ada@studio" aria-describedby="${id}-m" />
            <b class="sp-psm__tick" aria-hidden="true">✓</b>
          </div>
          <small class="sp-fi__msg" id="${id}-m" aria-live="polite"></small>
        </div>
      </div>`);
    const input = k.$('input');
    const [r, b] = k.$$('.sp-psm__ch');
    const tick = k.$('.sp-psm__tick');
    const msg = k.$('.sp-fi__msg');
    let ok = null;
    const sync = () => {
      const v = input.value;
      r.textContent = b.textContent = v;
      gsap.set([r, b], { xPercent: 0, x: -input.scrollLeft });
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
      if (valid === ok) {
        // still invalid: the fringes waver with each keystroke
        if (!valid && !reducedMotion) gsap.fromTo([r, b], { x: (i) => -input.scrollLeft + (i ? 1 : -1) * p.split * 1.8 }, { x: (i) => -input.scrollLeft + (i ? 1 : -1) * p.split, duration: 0.3 });
        return;
      }
      ok = valid;
      input.setAttribute('aria-invalid', String(!valid && Boolean(v)));
      msg.textContent = valid ? '' : 'Add the rest of the domain, like .com';
      const d = reducedMotion ? 0 : 1;
      gsap.to([r, b], { x: (i) => -input.scrollLeft + (valid ? 0 : (i ? 1 : -1) * p.split), opacity: valid ? 0 : 0.6, duration: 0.4 * d, ease: valid ? 'power3.in' : 'back.out(2)' });
      gsap.to(input, { color: valid ? '#111111' : 'rgba(17,17,17,0.75)', duration: 0.3 * d });
      gsap.to(tick, { scale: valid ? 1 : 0, duration: 0.35 * d, ease: valid ? 'back.out(3)' : 'power2.in' });
    };
    gsap.set(tick, { scale: 0 });
    k.on(input, 'input', sync);
    k.on(input, 'scroll', () => gsap.set([r, b], { x: (i) => -input.scrollLeft + (ok ? 0 : (i ? 1 : -1) * p.split) }));
    sync();
    return () => k.destroy();
  },
};
