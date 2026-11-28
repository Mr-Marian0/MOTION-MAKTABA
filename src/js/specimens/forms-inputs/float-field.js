/** Float Field: the label is a little balloon tied to the field: it rests inside as the placeholder, and when you focus or fill the field it floats up on its string and bobs there gently. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Float Field',
  element: 'Text field',
  trigger: ['Focus', 'Keyboard'],
  behavior: ['Focus-dependent', 'State-dependent', 'Floating'],
  effect: ['Floating', 'Bobbing', 'Swaying'],
  purpose: ['Affordance', 'Delight', 'Focus'],
  properties: ['Position', 'Rotation', 'Path'],
  description: 'A floating-label field taken literally. The label sits inside the empty field like a placeholder. Focus it, or type something, and the label floats up out of the field as a balloon on a string, rising with a little overshoot, then bobbing and swaying slowly above the field while it stays up. Empty the field and leave, and it sinks back in.',
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Your city' },
    { key: 'lift', label: 'Float height', group: 'Motion', type: 'range', min: 1.5, max: 4, step: 0.25, unit: 'em', default: 2.6, live: true },
    { key: 'bob', label: 'Bob', group: 'Motion', type: 'range', min: 0, max: 0.6, step: 0.05, unit: 'em', default: 0.25, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Balloon'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('flt');
    k.html(`
      <div class="sp sp-fi sp-flt">
        <div class="sp-fi__wrap sp-flt__wrap">
          <div class="sp-fi__box sp-flt__box">
            <input class="sp-fi__input" id="${id}" autocomplete="off" placeholder=" " />
            <label class="sp-flt__balloon" for="${id}"><span>${esc(p.label)}</span><svg class="sp-flt__string" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><path d="M5 0 C 2 30, 8 60, 5 100" /></svg></label>
          </div>
          <p class="sp-note">Click in · type · click away</p>
        </div>
      </div>`);
    const input = k.$('.sp-fi__input');
    const balloon = k.$('.sp-flt__balloon');
    const string = k.$('.sp-flt__string');
    let up = false, bob;
    const float = (on) => {
      if (on === up) return;
      up = on;
      balloon.classList.toggle('is-up', on);
      bob?.kill();
      gsap.killTweensOf([balloon, string]);
      const d = reducedMotion ? 0 : 1;
      if (!on) {
        gsap.to(balloon, { y: 0, rotation: 0, duration: 0.45 * d, ease: 'power2.in' });
        gsap.to(string, { scaleY: 0, duration: 0.3 * d });
        return;
      }
      gsap.to(string, { scaleY: 1, duration: 0.6 * d, ease: 'power2.out' });
      gsap.to(balloon, { y: `-${p.lift}em`, duration: 0.8 * d, ease: 'back.out(1.8)', onComplete: () => {
        // The bob runs only while the balloon is up
        if (reducedMotion || !p.bob) return;
        bob = gsap.timeline({ repeat: -1, yoyo: true })
          .to(balloon, { y: `-${p.lift + p.bob}em`, rotation: 4, duration: 1.6, ease: 'sine.inOut' })
          .to(balloon, { rotation: -3, duration: 1.6, ease: 'sine.inOut' }, 0.8);
      } });
    };
    gsap.set(string, { scaleY: 0, transformOrigin: '50% 0%' });
    const sync = () => float(document.activeElement === input || Boolean(input.value));
    k.on(input, 'focus', sync);
    k.on(input, 'blur', sync);
    k.on(input, 'input', sync);
    return () => { bob?.kill(); k.destroy(); };
  },
};
