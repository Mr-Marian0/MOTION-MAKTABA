/** Grow Search: the magnifier grows into a full bar; results filter as you type and drop in one by one. */
import { kit, esc, labelsOf, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Grow Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard', 'Focus'],
  behavior: ['Self-expanding', 'Activation-dependent', 'Event-driven', 'Staggered'],
  effect: ['Expansion', 'Contracting', 'Rising'],
  purpose: ['Wayfinding', 'Feedback', 'Focus'],
  properties: ['Size', 'Position', 'Opacity'],
  description: 'A round magnifier button that grows into a search bar. Matching results drop in under it one by one as you type. Esc or an empty blur shrinks it back to the icon.',
  params: [
    { key: 'items', label: 'Searchable items', group: 'Content', type: 'text', default: 'Kraft paper, Cotton rag, Tracing paper, Washi, Carbon paper, Newsprint' },
    { key: 'width', label: 'Open width', group: 'Layout', type: 'range', min: 14, max: 30, step: 1, unit: 'em', default: 22, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Bar color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const all = labelsOf(p.items, ['Paper']);
    const id = uid('search');
    k.html(`
      <div class="sp sp-search">
        <div class="sp-search__bar" role="search">
          <button type="button" class="sp-search__icon" aria-label="Open search" aria-expanded="false">⌕</button>
          <input class="sp-search__input" id="${id}" type="search" placeholder="Search the archive…" aria-label="Search" tabindex="-1" />
        </div>
        <ul class="sp-search__results" aria-live="polite"></ul>
      </div>`);
    const bar = k.$('.sp-search__bar');
    const icon = k.$('.sp-search__icon');
    const input = k.$('.sp-search__input');
    const list = k.$('.sp-search__results');
    const d = (t) => (reducedMotion ? 0 : t);
    let open = false;

    const render = () => {
      const q = input.value.trim().toLowerCase();
      const hits = q ? all.filter((x) => x.toLowerCase().includes(q)) : [];
      list.innerHTML = hits.map((h) => `<li class="sp-search__hit">${esc(h)}</li>`).join('') || (q ? '<li class="sp-search__hit is-none">Nothing filed under that</li>' : '');
      if (list.children.length) gsap.from(list.children, { y: -12, opacity: 0, duration: d(0.35), stagger: 0.05, ease: 'back.out(2)' });
    };
    const setOpen = (o) => {
      open = o;
      icon.setAttribute('aria-expanded', String(o));
      input.tabIndex = o ? 0 : -1;
      gsap.to(bar, { width: o ? `${p.width}em` : '3.4em', duration: d(0.6), ease: o ? 'expo.out' : 'power3.inOut' });
      if (o) input.focus({ preventScroll: true });
      else (input.value = ''), render(), icon.focus({ preventScroll: true });
    };

    k.on(icon, 'click', () => setOpen(!open));
    k.on(input, 'input', render);
    k.on(input, 'keydown', (e) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false)));
    k.on(input, 'blur', () => setTimeout(() => open && !input.value && document.activeElement !== icon && setOpen(false), 120));

    return () => k.destroy();
  },
};
