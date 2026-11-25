/** Fold Select: the option list unfolds strip by strip from the field; the picked option slides into place. */
import { kit, esc, labelsOf, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Fold Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Activation-dependent', 'Selection-dependent', 'Staggered', 'Keyboard-controlled'],
  effect: ['Unfolding', 'Folding', 'Sliding', 'Rotating'],
  purpose: ['Feedback', 'Continuity'],
  properties: ['Rotation', 'Position', 'Opacity'],
  description: 'A custom select. The options unfold below the field one strip at a time, like a folded paper list, and fold back up on close. The chosen value slides into the field. Arrow keys, Enter and Esc work.',
  params: [
    { key: 'options', label: 'Options', group: 'Content', type: 'text', default: 'A4 portrait, A4 landscape, Letter, Postcard, Square' },
    { key: 'speed', label: 'Fold time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const opts = labelsOf(p.options, ['One', 'Two']);
    const id = uid('sel');
    k.html(`
      <div class="sp sp-sel">
        <span class="sp-sel__label" id="${id}-l">Paper size</span>
        <button type="button" class="sp-sel__field" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-l ${id}-v">
          <span class="sp-sel__value" id="${id}-v">${esc(opts[0])}</span><i aria-hidden="true">▾</i>
        </button>
        <ul class="sp-sel__list" role="listbox" aria-labelledby="${id}-l" tabindex="-1" hidden>
          ${opts.map((o, i) => `<li class="sp-sel__opt" role="option" id="${id}-${i}" aria-selected="${!i}">${esc(o)}</li>`).join('')}
        </ul>
      </div>`);
    const field = k.$('.sp-sel__field');
    const value = k.$('.sp-sel__value');
    const list = k.$('.sp-sel__list');
    const items = k.$$('.sp-sel__opt');
    let sel = 0;
    let active = 0;
    const t = () => (reducedMotion ? 0 : Number(p.speed));

    const mark = (i) => {
      active = (i + items.length) % items.length;
      items.forEach((o, j) => o.classList.toggle('is-active', j === active));
      list.setAttribute('aria-activedescendant', items[active].id);
    };
    const open = () => {
      list.hidden = false;
      field.setAttribute('aria-expanded', 'true');
      mark(sel);
      list.focus({ preventScroll: true });
      gsap.fromTo(items, { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: t(), stagger: t() * 0.25, ease: 'back.out(1.5)' });
      gsap.to(field.lastElementChild, { rotation: 180, duration: t() });
    };
    const close = (pick, refocus = true) => {
      if (field.getAttribute('aria-expanded') === 'false') return;
      field.setAttribute('aria-expanded', 'false');
      gsap.to(field.lastElementChild, { rotation: 0, duration: t() });
      gsap.to([...items].reverse(), { rotationX: -90, opacity: 0, duration: t() * 0.6, stagger: t() * 0.12, ease: 'power2.in', onComplete: () => (list.hidden = true) });
      if (pick !== undefined && pick !== sel) {
        items[sel].setAttribute('aria-selected', 'false');
        sel = pick;
        items[sel].setAttribute('aria-selected', 'true');
        gsap.timeline()
          .to(value, { yPercent: -120, opacity: 0, duration: t() * 0.6, ease: 'power2.in' })
          .add(() => (value.textContent = opts[sel]))
          .fromTo(value, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: t(), ease: 'back.out(2)' });
      }
      if (refocus) field.focus({ preventScroll: true });
    };

    k.on(field, 'click', () => (field.getAttribute('aria-expanded') === 'false' ? open() : close()));
    // Clicking anywhere else closes it without stealing focus back.
    k.on(list, 'focusout', (e) => e.relatedTarget !== field && close(undefined, false));
    k.on(field, 'keydown', (e) => ['ArrowDown', 'ArrowUp'].includes(e.key) && (e.preventDefault(), open()));
    items.forEach((o, i) => {
      k.on(o, 'click', () => close(i));
      k.on(o, 'pointerenter', () => mark(i));
    });
    k.on(list, 'keydown', (e) => {
      const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (move) return e.preventDefault(), mark(active + move);
      if (e.key === 'Enter' || e.key === ' ') return e.preventDefault(), close(active);
      if (e.key === 'Escape' || e.key === 'Tab') e.stopPropagation(), close();
    });

    return () => k.destroy();
  },
};
