/** Confirm Dialog: scales in softly; the risky button breathes; clicking outside shakes the dialog ("decide first"). */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Shake-to-Decide Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Activation-dependent', 'Focus-dependent', 'Priority-based', 'Event-driven'],
  effect: ['Expansion', 'Shaking', 'Breathing', 'Dissolving'],
  purpose: ['Focus', 'Feedback', 'Hierarchy'],
  properties: ['Scale', 'Position', 'Color'],
  description: 'A "Delete this drawer?" confirmation. It scales up softly from 95%, the destructive button breathes in red, and clicking outside makes the dialog shake its head, because this one needs a real answer. Esc cancels.',
  params: [
    { key: 'shake', label: 'Shake', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: 'px', default: 10, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Danger color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('dlg');
    k.html(`
      <div class="sp sp-dlg">
        <button type="button" class="sp-dlg__trigger">🗑︎ Delete drawer</button>
        <div class="sp-dlg__backdrop" hidden></div>
        <section class="sp-dlg__box" role="alertdialog" aria-modal="true" aria-labelledby="${id}" aria-describedby="${id}-d" hidden>
          <h4 id="${id}">Delete "Kraft papers"?</h4>
          <p id="${id}-d">Its 12 designs go too. This can't be undone.</p>
          <div class="sp-dlg__row">
            <button type="button" class="sp-dlg__btn" data-cancel>Keep it</button>
            <button type="button" class="sp-dlg__btn sp-dlg__btn--danger" data-ok>Delete</button>
          </div>
        </section>
        <p class="sp-dlg__status" aria-live="polite"></p>
      </div>`);
    const trigger = k.$('.sp-dlg__trigger');
    const back = k.$('.sp-dlg__backdrop');
    const box = k.$('.sp-dlg__box');
    const danger = k.$('[data-ok]');
    const status = k.$('.sp-dlg__status');
    const d = (t) => (reducedMotion ? 0 : t);
    let pulse = null;

    const open = () => {
      back.hidden = box.hidden = false;
      status.textContent = '';
      gsap.fromTo(back, { opacity: 0 }, { opacity: 1, duration: d(0.3) });
      gsap.fromTo(box, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: d(0.35), ease: 'power2.out' });
      if (!reducedMotion) pulse = gsap.to(danger, { boxShadow: '0 0 0 0.45em color-mix(in srgb, var(--sp-accent) 25%, transparent)', duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      k.$('[data-cancel]').focus({ preventScroll: true });
    };
    const close = (msg) => {
      pulse?.kill();
      gsap.set(danger, { clearProps: 'boxShadow' });
      gsap.to([back, box], { opacity: 0, duration: d(0.2), onComplete: () => (back.hidden = box.hidden = true) });
      status.textContent = msg;
      trigger.focus({ preventScroll: true });
    };
    k.on(trigger, 'click', open);
    k.on(k.$('[data-cancel]'), 'click', () => close('Kept. Nothing was deleted.'));
    k.on(danger, 'click', () => close('Deleted (not really, it is a demo).'));
    k.on(back, 'click', () => !reducedMotion && gsap.fromTo(box, { x: 0 }, { keyframes: { x: [-p.shake, p.shake, -p.shake * 0.6, p.shake * 0.4, 0] }, duration: 0.45 }));
    k.on(box, 'keydown', (e) => {
      if (e.key === 'Escape') return e.stopPropagation(), close('Kept. Nothing was deleted.');
      if (e.key === 'Tab') e.preventDefault(), (document.activeElement === danger ? k.$('[data-cancel]') : danger).focus();
    });

    return () => (pulse?.kill(), k.destroy());
  },
};
