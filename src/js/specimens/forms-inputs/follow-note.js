/** Follow Note: a comment box lifts when you focus it, and its loose parts follow through: the avatar, the toolbar and the send button keep travelling a moment after the box stops, then swing back into place. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Follow Note',
  element: 'Textarea',
  trigger: ['Focus', 'Click', 'Keyboard'],
  behavior: ['Focus-dependent', 'Hierarchical', 'Staggered'],
  effect: ['Follow-through', 'Overshoot-motion', 'Secondary-motion'],
  purpose: ['Focus', 'Continuity', 'Delight'],
  properties: ['Position', 'Rotation'],
  description: 'A comment composer animated with follow-through. Focus it and the box rises to meet you and stops; the avatar beside it, the formatting toolbar and the send button were along for the ride and keep going a little further (each with a different lag), then settle back, so it feels like one object with looser parts. Leaving it drops it back down the same way. Sending makes the parts lurch forwards after the box.',
  params: [
    { key: 'lift', label: 'Lift', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 'em', default: 0.9, live: true },
    { key: 'lag', label: 'Lag between parts', group: 'Motion', type: 'range', min: 0, max: 0.15, step: 0.01, unit: 's', default: 0.05, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Send'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('fol');
    k.html(`
      <div class="sp sp-fi sp-fol">
        <div class="sp-fol__row">
          <i class="sp-fol__ava" aria-hidden="true">MK</i>
          <div class="sp-fol__card">
            <label class="sp-fi__label" for="${id}">Reply to the thread</label>
            <textarea class="sp-fi__area sp-fol__area" id="${id}" placeholder="Looks great, one note on the margins…"></textarea>
            <div class="sp-fol__bar"><span class="sp-fol__tools" aria-hidden="true"><b>B</b><i>I</i><u>U</u>⌁</span><button type="button" class="sp-fi__btn sp-fol__send">Send</button></div>
          </div>
        </div>
        <small class="sp-fi__msg" aria-live="polite"></small>
      </div>`);
    const card = k.$('.sp-fol__card');
    const area = k.$('.sp-fol__area');
    const parts = [k.$('.sp-fol__ava'), k.$('.sp-fol__tools'), k.$('.sp-fol__send')];
    const msg = k.$('.sp-fi__msg');
    // The box moves with a firm ease; each part arrives late and overshoots (back.out), the tool row swinging
    const move = (y) => {
      const d = reducedMotion ? 0 : 1;
      gsap.to(card, { y, duration: 0.35 * d, ease: 'power3.out', overwrite: true });
      parts.forEach((el, i) => gsap.to(el, { y, rotation: 0, duration: 0.6 * d, delay: (i + 1) * p.lag * d, ease: 'back.out(3.5)', overwrite: true }));
    };
    k.on(area, 'focus', () => move(`-${p.lift}em`));
    k.on(area, 'blur', () => setTimeout(() => !card.contains(document.activeElement) && move(0), 0));
    k.on(k.$('.sp-fol__send'), 'click', () => {
      if (!area.value.trim()) return area.focus();
      msg.textContent = 'Sent.';
      area.value = '';
      if (reducedMotion) return;
      // Send: the box jabs right and stops; the parts lurch on and swing back
      gsap.timeline().to(card, { x: '0.6em', duration: 0.12, ease: 'power2.out' }).to(card, { x: 0, duration: 0.3 });
      parts.forEach((el, i) => gsap.timeline({ delay: (i + 1) * p.lag })
        .to(el, { x: '1em', rotation: i === 1 ? 6 : 0, duration: 0.15, ease: 'power2.out' })
        .to(el, { x: 0, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
    return () => k.destroy();
  },
};
