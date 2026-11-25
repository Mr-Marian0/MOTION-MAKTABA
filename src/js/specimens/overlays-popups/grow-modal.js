/** Grow Modal: the modal grows out of the button that opened it and shrinks back into it on close. */
import { kit, uid, bars, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Grow-from-Button Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Activation-dependent', 'Focus-dependent', 'Reversible', 'Cancellable'],
  effect: ['Morphing-transition', 'Expansion', 'Contracting', 'Dissolving'],
  purpose: ['Continuity', 'Focus'],
  properties: ['Size', 'Position', 'Blur', 'Opacity'],
  description: 'A modal that grows out of the very button that opened it while the page behind blurs, so you never lose track of where it came from. Close, Esc or a click outside shrinks it back into the button.',
  params: [
    { key: 'speed', label: 'Grow time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.55, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Expo', live: true },
    { key: 'blur', label: 'Backdrop blur', group: 'Appearance', type: 'range', min: 0, max: 8, step: 1, unit: 'px', default: 4, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Button color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('modal');
    k.html(`
      <div class="sp sp-modal">
        <div class="sp-modal__page">${bars(3)}<button type="button" class="sp-modal__open" aria-haspopup="dialog">Subscribe</button>${bars(4)}</div>
        <div class="sp-modal__backdrop" hidden></div>
        <section class="sp-modal__box" role="dialog" aria-modal="true" aria-labelledby="${id}" hidden>
          <h4 id="${id}">Letters from the archive</h4>
          <p>One envelope a month: a new design, the story behind it and a printable sheet.</p>
          <div class="sp-modal__row"><button type="button" class="sp-modal__btn" data-close>Not now</button><button type="button" class="sp-modal__btn sp-modal__btn--go" data-close>Sign me up</button></div>
        </section>
      </div>`);
    const page = k.$('.sp-modal__page');
    const opener = k.$('.sp-modal__open');
    const back = k.$('.sp-modal__backdrop');
    const box = k.$('.sp-modal__box');
    const t = () => (reducedMotion ? 0 : Number(p.speed));

    // The button's box, relative to the stage: where the modal starts and ends.
    const rectOf = (el) => {
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
    };
    const open = () => {
      back.hidden = box.hidden = false;
      const from = rectOf(opener);
      gsap.fromTo(box, { ...from, borderRadius: '2em', opacity: 0.4 }, { left: '15%', top: '14%', width: '70%', height: '72%', borderRadius: '0.6em', opacity: 1, duration: t(), ease: EASES[p.ease] });
      gsap.fromTo(box.children, { opacity: 0 }, { opacity: 1, duration: t() * 0.6, delay: t() * 0.5 });
      gsap.to(back, { opacity: 1, duration: t() });
      gsap.to(page, { filter: `blur(${p.blur}px)`, duration: t() });
      box.querySelector('.sp-modal__btn--go').focus({ preventScroll: true });
    };
    const close = () => {
      if (box.hidden) return;
      gsap.to(box.children, { opacity: 0, duration: t() * 0.3 });
      gsap.to(box, { ...rectOf(opener), borderRadius: '2em', opacity: 0.4, duration: t() * 0.8, ease: 'power3.inOut', onComplete: () => (box.hidden = back.hidden = true) });
      gsap.to(back, { opacity: 0, duration: t() * 0.8 });
      gsap.to(page, { filter: 'blur(0px)', duration: t() * 0.8 });
      opener.focus({ preventScroll: true });
    };
    k.on(opener, 'click', open);
    k.on(back, 'click', close);
    k.$$('[data-close]').forEach((b) => k.on(b, 'click', close));
    k.on(box, 'keydown', (e) => {
      if (e.key === 'Escape') return e.stopPropagation(), close();
      if (e.key !== 'Tab') return;
      // Keep focus inside the modal.
      const f = [...box.querySelectorAll('button')];
      if (e.shiftKey && document.activeElement === f[0]) e.preventDefault(), f.at(-1).focus();
      else if (!e.shiftKey && document.activeElement === f.at(-1)) e.preventDefault(), f[0].focus();
    });

    return () => k.destroy();
  },
};
