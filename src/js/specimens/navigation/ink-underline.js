/**Ink Underline: the mark follows the hovered link, stretching across the gap. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Ink Underline',
  element: 'Navbar',
  trigger: ['Hover', 'Click', 'Focus'],
  behavior: ['Position-aware', 'Following'],
  effect: ['Sliding', 'Elongation', 'Contracting'],
  purpose: ['Orientation', 'Feedback'],
  properties: ['Position', 'Size'],
  description: 'An ink line follows your pointer from link to link. It stretches across the gap before pulling in, like a pen dragged over paper.',
  params: [
    { key: 'labels', label: 'Links', group: 'Content', type: 'text', default: 'Index, Work, Lab, Archive, Contact' },
    { key: 'shape', label: 'Mark', group: 'Appearance', type: 'choice', options: ['Underline', 'Overline', 'Pill'], default: 'Underline' },
    tone('#a07a52'),
    { key: 'thick', label: 'Thickness', group: 'Size', type: 'range', min: 1, max: 12, step: 1, unit: 'px', default: 3, css: '--sp-thick' },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.15, max: 1.5, step: 0.05, unit: 's', default: 0.55, live: true },
    { key: 'stretch', label: 'Stretch between links', group: 'Motion', type: 'toggle', default: true, live: true },
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Index', 'Work', 'Lab', 'Archive', 'Contact']);
    k.html(`
      <div class="sp sp-ink sp-ink--${String(p.shape).toLowerCase()}">
        <nav class="sp-bar" aria-label="Specimen navigation">
          <span class="sp-logo">MM</span>
          <ul class="sp-ink__list">
            ${labels.map((l, i) => `<li><a href="#" ${i ? '' : 'aria-current="page"'}>${esc(l)}</a></li>`).join('')}
          </ul>
          <i class="sp-ink__mark" aria-hidden="true"></i>
        </nav>
        <p class="sp-note">Hover the links · click one to choose it</p>
      </div>`);

    const nav = k.$('.sp-bar');
    const mark = k.$('.sp-ink__mark');
    const links = k.$$('a');
    let active = links[0];
    let cur = null;

    const box = (a) => {
      const n = nav.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      return { x: r.left - n.left, w: r.width };
    };
    const snap = () => {
      cur = box(active);
      gsap.set(mark, { x: cur.x, width: cur.w });
    };

    const go = (a) => {
      const t = box(a);
      const d = Number(p.speed);
      gsap.killTweensOf(mark);
      if (p.stretch && cur) {
        // Reach across both links first, then pull the tail in.
        const x0 = Math.min(cur.x, t.x);
        const x1 = Math.max(cur.x + cur.w, t.x + t.w);
        gsap
          .timeline()
          .to(mark, { x: x0, width: x1 - x0, duration: d * 0.4, ease: 'power2.in' })
          .to(mark, { x: t.x, width: t.w, duration: d * 0.6, ease: 'expo.out' });
      } else {
        gsap.to(mark, { x: t.x, width: t.w, duration: d, ease: 'expo.out' });
      }
      cur = t;
    };

    links.forEach((a) => {
      k.on(a, 'pointerenter', () => go(a));
      k.on(a, 'focus', () => go(a));
      k.on(a, 'click', (e) => {
        e.preventDefault();
        active.removeAttribute('aria-current');
        active = a;
        a.setAttribute('aria-current', 'page');
        go(a);
      });
    });
    k.on(nav, 'pointerleave', () => go(active));
    k.resize(nav, snap);

    return () => k.destroy();
  },
};
