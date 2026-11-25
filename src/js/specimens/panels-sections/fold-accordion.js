/** Folded Accordion: panels unfold like a folded letter while the plus turns into a minus. */
import { kit, esc, labelsOf, bars, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Folded Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Selection-dependent', 'Self-expanding', 'Self-collapsing'],
  effect: ['Unfolding', 'Folding', 'Expansion', 'Rotating'],
  purpose: ['Hierarchy', 'Focus'],
  properties: ['Size', 'Rotation', 'Opacity'],
  description: 'An FAQ where each answer unfolds from the fold line like paper, and the plus turns into a minus. In "one at a time" mode, opening one folds the others away.',
  params: [
    { key: 'items', label: 'Questions', group: 'Content', type: 'text', default: 'What paper do you use?, How long does it take?, Do you ship abroad?' },
    { key: 'single', label: 'One at a time', group: 'Behavior', type: 'toggle', default: true, live: true },
    { key: 'speed', label: 'Unfold time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.55, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Icon color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const qs = labelsOf(p.items, ['Question?']).slice(0, 4);
    const id = uid('acc'); // unique: the card and the workbench can show this design at once
    k.html(`
      <div class="sp sp-acc">
        <div class="sp-acc__list">
          ${qs.map((q, i) => `
            <section class="sp-acc__item">
              <h5><button type="button" class="sp-acc__head" aria-expanded="false" aria-controls="${id}-${i}">${esc(q)}<i aria-hidden="true"></i></button></h5>
              <div class="sp-acc__panel" id="${id}-${i}" hidden><div class="sp-acc__fold">${bars(3)}</div></div>
            </section>`).join('')}
        </div>
      </div>`);
    const heads = k.$$('.sp-acc__head');

    const set = (i, open) => {
      const head = heads[i];
      const panel = head.closest('.sp-acc__item').querySelector('.sp-acc__panel');
      const fold = panel.firstElementChild;
      if ((head.getAttribute('aria-expanded') === 'true') === open) return;
      head.setAttribute('aria-expanded', String(open));
      const t = reducedMotion ? 0 : Number(p.speed);
      gsap.killTweensOf([panel, fold, head.lastChild]);
      gsap.to(head.lastChild, { rotation: open ? 180 : 0, duration: t, ease: 'back.out(2)' });
      if (open) {
        panel.hidden = false;
        gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: t, ease: 'power3.out' });
        gsap.fromTo(fold, { rotationX: -80, opacity: 0 }, { rotationX: 0, opacity: 1, duration: t * 1.2, ease: 'back.out(1.3)' });
      } else {
        gsap.to(fold, { rotationX: -80, opacity: 0, duration: t * 0.7, ease: 'power2.in' });
        gsap.to(panel, { height: 0, duration: t, ease: 'power3.inOut', onComplete: () => (panel.hidden = true) });
      }
    };

    heads.forEach((h, i) => k.on(h, 'click', () => {
      const open = h.getAttribute('aria-expanded') !== 'true';
      if (open && p.single) heads.forEach((_, j) => j !== i && set(j, false));
      set(i, open);
    }));

    return () => k.destroy();
  },
};
