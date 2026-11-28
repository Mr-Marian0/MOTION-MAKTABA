/** Breathe Note: a journaling box that breathes with you: while it waits for you, its glow slowly swells and settles at a calm breathing pace (in for four, out for six), with a small cue; start writing and the breath fades to stillness. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Breathe Note',
  element: 'Textarea',
  trigger: ['Focus', 'Idle', 'Keyboard'],
  behavior: ['Focus-dependent', 'Time-driven', 'Periodic'],
  effect: ['Breathing', 'Pulsating', 'Expansion'],
  purpose: ['Focus', 'Delight', 'Affordance'],
  properties: ['Shadow', 'Scale', 'Opacity'],
  description: 'A reflection box that sets a calm pace. While it is focused and you are not typing, its soft halo breathes: swelling in over four seconds ("breathe in") and easing out over six ("breathe out"), the box itself growing a hair with each breath. Start typing and the breathing fades out so nothing moves while you write; pause for a few seconds and it gently resumes. It only breathes while focused.',
  params: [
    { key: 'inhale', label: 'Breathe in', group: 'Motion', type: 'range', min: 2, max: 8, step: 0.5, unit: 's', default: 4, live: true },
    { key: 'exhale', label: 'Breathe out', group: 'Motion', type: 'range', min: 2, max: 10, step: 0.5, unit: 's', default: 6, live: true },
    { key: 'rest', label: 'Resume after', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Calm'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('brt');
    k.html(`
      <div class="sp sp-fi sp-brt">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">What went well today?</label>
          <div class="sp-brt__halo"><textarea class="sp-fi__area sp-brt__area" id="${id}" placeholder="Take a breath, then write…"></textarea></div>
          <small class="sp-fi__hint sp-brt__cue" aria-hidden="true">Click in to begin</small>
        </div>
      </div>`);
    const halo = k.$('.sp-brt__halo');
    const area = k.$('.sp-brt__area');
    const cue = k.$('.sp-brt__cue');
    let breath, resume;
    const still = () => {
      breath?.kill();
      breath = null;
      gsap.to(halo, { '--g': 0, scale: 1, duration: reducedMotion ? 0 : 0.8, overwrite: true });
    };
    const breathe = () => {
      if (reducedMotion || document.activeElement !== area) return;
      breath?.kill();
      breath = gsap.timeline({ repeat: -1 })
        .call(() => (cue.textContent = 'Breathe in…'))
        .to(halo, { '--g': 1, scale: 1.015, duration: p.inhale, ease: 'sine.inOut' })
        .call(() => (cue.textContent = 'Breathe out…'))
        .to(halo, { '--g': 0, scale: 1, duration: p.exhale, ease: 'sine.inOut' });
    };
    k.on(area, 'focus', () => { cue.textContent = ''; breathe(); });
    k.on(area, 'blur', () => { resume?.kill(); still(); cue.textContent = 'Click in to begin'; });
    k.on(area, 'input', () => {
      if (breath) still(), (cue.textContent = 'Writing');
      resume?.kill();
      resume = gsap.delayedCall(p.rest, breathe);
    });
    return () => { breath?.kill(); resume?.kill(); k.destroy(); };
  },
};
