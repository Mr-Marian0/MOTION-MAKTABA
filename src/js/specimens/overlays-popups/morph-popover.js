/** Morph Popover: one popover glides and resizes between toolbar buttons instead of closing and reopening. */
import { kit, esc, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Shape-shifting Popover',
  element: 'Popover',
  trigger: ['Hover', 'Click', 'Focus'],
  behavior: ['Anchored', 'Activation-dependent', 'Self-repositioning', 'Self-resizing'],
  effect: ['Morphing', 'Sliding', 'Expansion', 'Dissolving'],
  purpose: ['Continuity', 'Wayfinding'],
  properties: ['Size', 'Position', 'Opacity'],
  description: 'A toolbar where every button has its own popover, but there is only one box: moving between buttons makes it glide over and reshape to fit the new content while the content crossfades, like a mega-menu. Leave the toolbar (or press Esc) to close it.',
  params: [
    { key: 'speed', label: 'Morph time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.4, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Popover color'),
  ],
};

const MENUS = [
  ['Paper', ['Cotton rag', 'Kraft', 'Washi', 'Tracing']],
  ['Ink', ['Carbon black', 'Iron gall']],
  ['Binding', ['Saddle stitch', 'Japanese stab', 'Coptic', 'Perfect bound', 'Spiral']],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('pop');
    k.html(`
      <div class="sp sp-pop">
        <nav class="sp-pop__bar" aria-label="Materials">
          ${MENUS.map(([name], i) => `<button type="button" class="sp-pop__trigger" aria-expanded="false" aria-controls="${id}" data-i="${i}">${name} ▾</button>`).join('')}
          <div class="sp-pop__box" id="${id}" hidden><i class="sp-pop__arrow"></i><div class="sp-pop__inner"></div></div>
        </nav>
      </div>`);
    const bar = k.$('.sp-pop__bar');
    const box = k.$('.sp-pop__box');
    const inner = k.$('.sp-pop__inner');
    const arrow = k.$('.sp-pop__arrow');
    const triggers = k.$$('.sp-pop__trigger');
    const t = () => (reducedMotion ? 0 : Number(p.speed));
    let at = -1;

    const show = (i) => {
      if (i === at) return;
      const first = at < 0;
      at = i;
      triggers.forEach((b, j) => b.setAttribute('aria-expanded', String(j === i)));
      // Measure the new content at its natural size, then tween the box to it.
      inner.innerHTML = `<b>${MENUS[i][0]}</b><ul>${MENUS[i][1].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      box.hidden = false;
      const w = inner.offsetWidth;
      const h = inner.offsetHeight;
      const tr = triggers[i];
      const x = tr.offsetLeft + tr.offsetWidth / 2 - w / 2;
      if (first) {
        gsap.fromTo(box, { x, width: w, height: h, opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: t() });
      } else {
        gsap.to(box, { x, width: w, height: h, duration: t(), ease: 'power3.out' });
        gsap.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: t() });
      }
      gsap.to(arrow, { x: tr.offsetLeft + tr.offsetWidth / 2 - x, duration: first ? 0 : t(), ease: 'power3.out' });
    };
    const hide = () => {
      if (at < 0) return;
      at = -1;
      triggers.forEach((b) => b.setAttribute('aria-expanded', 'false'));
      gsap.to(box, { opacity: 0, y: -8, duration: t() * 0.7, onComplete: () => at < 0 && (box.hidden = true) });
    };
    triggers.forEach((b, i) => {
      k.on(b, 'pointerenter', () => show(i));
      k.on(b, 'focus', () => show(i));
      k.on(b, 'click', () => (at === i ? hide() : show(i)));
    });
    k.on(bar, 'pointerleave', hide);
    k.on(bar, 'focusout', (e) => !bar.contains(e.relatedTarget) && hide());
    k.on(bar, 'keydown', (e) => e.key === 'Escape' && (e.stopPropagation(), hide()));

    return () => k.destroy();
  },
};
