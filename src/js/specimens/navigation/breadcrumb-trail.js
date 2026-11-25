/**Falling Breadcrumbs: crumbs slide in, fold into "…", and fall away. */
import { kit, esc } from '../_kit.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Falling Breadcrumbs',
  element: 'Breadcrumbs',
  trigger: ['Click'],
  behavior: ['Hierarchical', 'Sequential', 'Self-collapsing', 'Gravity-driven'],
  effect: ['Sliding', 'Falling', 'Folding'],
  purpose: ['Wayfinding', 'Orientation'],
  properties: ['Position', 'Rotation', 'Opacity', 'Layout'],
  description: 'Go deeper and new crumbs slide in. When the trail gets long, the middle folds into "…". Click an earlier crumb and the ones after it drop away.',
  params: [
    { key: 'sep', label: 'Separator', group: 'Appearance', type: 'choice', options: ['/', '→', '·', '›'], default: '/' },
    { key: 'max', label: 'Visible crumbs', group: 'Layout', type: 'range', min: 3, max: 7, step: 1, default: 4, live: true },
    { key: 'gravity', label: 'Crumbs fall (off = fade)', group: 'Motion', type: 'toggle', default: true, live: true },
  ],
};

const DEEPER = ['Navigation', 'Breadcrumbs', 'Specimens', 'Trails', 'Variants', 'Drafts', 'Margins', 'Footnotes'];

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-crumbs">
        <nav class="sp-crumbs__nav" aria-label="Breadcrumb"><ol></ol></nav>
        <div class="sp-crumbs__actions">
          <button class="sp-btn" type="button" data-deeper>Go deeper →</button>
          <button class="sp-btn sp-btn--ghost" type="button" data-reset>Reset</button>
        </div>
        <p class="sp-note">Go deeper, then click an earlier crumb to climb back</p>
      </div>`);

    const ol = k.$('ol');
    let trail = ['Home', 'Library'];
    let expanded = false;
    let busy = false;

    const crumb = (name, i, last) =>
      `<li data-i="${i}">${last ? `<span aria-current="page">${esc(name)}</span>` : `<a href="#" data-i="${i}">${esc(name)}</a>`}<i class="sp-crumbs__sep" aria-hidden="true">${esc(p.sep)}</i></li>`;

    const render = () => {
      const max = Number(p.max);
      const n = trail.length;
      let html;
      if (expanded || n <= max) {
        html = trail.map((t, i) => crumb(t, i, i === n - 1)).join('');
      } else {
        // first crumb · "…" · the last (max − 2) crumbs
        const tail = trail.slice(n - (max - 2)).map((t, j) => crumb(t, n - (max - 2) + j, n - (max - 2) + j === n - 1));
        html = `${crumb(trail[0], 0, false)}<li class="sp-crumbs__more"><button type="button" aria-label="Show ${n - max + 1} hidden crumbs">…</button><i class="sp-crumbs__sep" aria-hidden="true">${esc(p.sep)}</i></li>${tail.join('')}`;
      }
      ol.innerHTML = html;
      return ol.lastElementChild;
    };

    const deeper = () => {
      if (busy) return;
      const next = DEEPER[(trail.length - 2) % DEEPER.length];
      const wasCollapsed = !expanded && trail.length > Number(p.max);
      trail.push(next);
      expanded = false;
      const last = render();
      gsap.from(last, { x: 40, opacity: 0, duration: 0.6, ease: 'expo.out' });
      const more = ol.querySelector('.sp-crumbs__more');
      if (more && !wasCollapsed) gsap.from(more, { scaleX: 0, transformOrigin: 'left center', duration: 0.5, ease: 'back.out(2)' });
    };

    const climb = (i) => {
      if (busy || i >= trail.length - 1) return;
      const gone = [...ol.children].filter((li) => Number(li.dataset.i) > i);
      busy = true;
      const done = () => {
        trail = trail.slice(0, i + 1);
        expanded = false;
        render();
        busy = false;
      };
      if (p.gravity) {
        gsap.to(gone, {
          y: () => gsap.utils.random(90, 160),
          x: () => gsap.utils.random(-30, 30),
          rotation: () => gsap.utils.random(-70, 70),
          opacity: 0,
          duration: 0.75,
          ease: 'power2.in',
          stagger: 0.06,
          onComplete: done,
        });
      } else {
        gsap.to(gone, { opacity: 0, x: 12, duration: 0.3, stagger: 0.04, onComplete: done });
      }
    };

    k.on(ol, 'click', (e) => {
      const a = e.target.closest('a[data-i]');
      if (a) {
        e.preventDefault();
        climb(Number(a.dataset.i));
      } else if (e.target.closest('.sp-crumbs__more button')) {
        // Unfold the crumbs that were hidden behind "…".
        const lastHidden = trail.length - (Number(p.max) - 2) - 1;
        expanded = true;
        render();
        const shown = [...ol.children].filter((li) => li.dataset.i >= 1 && li.dataset.i <= lastHidden);
        gsap.from(shown, { scaleX: 0, opacity: 0, transformOrigin: 'left center', duration: 0.45, ease: 'back.out(2)', stagger: 0.05 });
      }
    });
    k.on(k.$('[data-deeper]'), 'click', deeper);
    k.on(k.$('[data-reset]'), 'click', () => climb(1));
    render();

    return { destroy: () => k.destroy(), update: () => !busy && render() };
  },
};
