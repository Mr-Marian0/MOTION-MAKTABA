/** Screw Field: a verification-code field held by two screws: when the code is complete the screws turn in, spiralling down into the corners to lock it; change a digit and they back out again. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Screw Field',
  element: 'Text field',
  trigger: ['Keyboard'],
  behavior: ['Conditional', 'State-dependent', 'Reversible'],
  effect: ['Screw-motion', 'Spinning', 'Contracting'],
  purpose: ['Feedback', 'Progress', 'Affordance'],
  properties: ['Rotation', 'Scale', 'Shadow'],
  description: 'A six-digit code field with a screw in each top corner, standing proud of the surface. Type the sixth digit and both screws are driven home: they spin several turns while sinking (shrinking and losing their shadow) into the plate, and the field reads "Locked in". Delete a digit and they spin back out, the field opening up again.',
  params: [
    { key: 'turns', label: 'Turns', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: '', default: 3, live: true },
    { key: 'time', label: 'Drive time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Locked'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('scw');
    k.html(`
      <div class="sp sp-fi sp-scw">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Enter the 6-digit code</label>
          <div class="sp-fi__box sp-scw__plate">
            <i class="sp-scw__screw" aria-hidden="true"></i><i class="sp-scw__screw" aria-hidden="true"></i>
            <input class="sp-fi__input sp-scw__input" id="${id}" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••" value="40917" aria-describedby="${id}-m" />
          </div>
          <small class="sp-fi__msg" id="${id}-m" aria-live="polite"></small>
        </div>
      </div>`);
    const plate = k.$('.sp-scw__plate');
    const screws = k.$$('.sp-scw__screw');
    const input = k.$('.sp-scw__input');
    const msg = k.$('.sp-fi__msg');
    // Starting slot angles set through GSAP (a CSS `rotate` would be folded into GSAP's own rotation)
    gsap.set(screws, { rotation: (i) => (i ? -35 : 20) });
    let locked = false;
    const set = (on) => {
      if (on === locked) return;
      locked = on;
      plate.classList.toggle('is-locked', on);
      msg.textContent = on ? 'Locked in. Checking the code…' : '';
      const d = reducedMotion ? 0 : p.time;
      // Screw motion: rotation and depth together; screws on the two sides turn the same way (both right-hand threads)
      gsap.to(screws, on
        ? { rotation: `+=${360 * p.turns}`, scale: 0.72, boxShadow: '0 0 0 0 rgb(0 0 0 / 0)', duration: d, ease: 'power2.inOut', overwrite: true }
        : { rotation: `-=${360 * p.turns}`, scale: 1, boxShadow: '0.12em 0.2em 0.15em 0 rgb(0 0 0 / 0.35)', duration: d * 0.8, ease: 'power2.inOut', overwrite: true });
    };
    k.on(input, 'input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 6);
      set(input.value.length === 6);
    });
    return () => k.destroy();
  },
};
