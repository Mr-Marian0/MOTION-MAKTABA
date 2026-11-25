/**
 *Sticky Index: behavior only, no motion effect.
 * The contents list stays pinned and the mark simply jumps to the chapter
 * being read. Deliberately un-animated.
 */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Sticky Index',
  element: 'Sidebar',
  trigger: ['Scroll', 'Click'],
  behavior: ['Sticky', 'Scroll-linked', 'Position-aware'],
  effect: [],
  purpose: ['Wayfinding', 'Orientation'],
  properties: ['Color', 'Typography'],
  description: 'A table of contents that stays put and marks the chapter you are reading. It has no motion effect, only behavior: the mark just jumps.',
  params: [
    { key: 'mark', label: 'Mark style', group: 'Appearance', type: 'choice', options: ['Bar', 'Dot', 'Bold'], default: 'Bar', live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Mark color'),
    { key: 'smooth', label: 'Smooth jump on click', group: 'Behavior', type: 'toggle', default: false, live: true },
  ],
};

const CHAPTERS = ['Paper', 'Ink', 'Binding', 'Margins', 'Index'];

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-index sp-index--${String(p.mark).toLowerCase()}">
        <div class="sp-index__view" data-lenis-prevent tabindex="0" aria-label="Scrollable sample page">
          <aside class="sp-index__aside">
            <b>Contents</b>
            <ol>${CHAPTERS.map((c, i) => `<li><a href="#" data-i="${i}">${c}</a></li>`).join('')}</ol>
          </aside>
          <div class="sp-index__body">
            <p class="sp-note sp-note--inline">Scroll the page, or pick a chapter</p>
            ${CHAPTERS.map((c, i) => `<section data-i="${i}"><h4>${String(i + 1).padStart(2, '0')} ${c}</h4>${bars(8)}</section>`).join('')}
          </div>
        </div>
      </div>`);

    const root = k.$('.sp-index');
    const view = k.$('.sp-index__view');
    const links = k.$$('.sp-index__aside a');
    const sections = k.$$('.sp-index__body section');

    const spy = () => {
      const y = view.scrollTop + view.clientHeight * 0.25;
      let i = 0;
      sections.forEach((s, j) => s.offsetTop <= y && (i = j));
      links.forEach((a, j) => a.classList.toggle('is-on', j === i));
    };
    k.on(view, 'scroll', spy, { passive: true });
    links.forEach((a, i) =>
      k.on(a, 'click', (e) => {
        e.preventDefault();
        view.scrollTo({ top: sections[i].offsetTop - 8, behavior: p.smooth ? 'smooth' : 'auto' });
      })
    );
    spy();

    return {
      destroy: () => k.destroy(),
      update(key) {
        if (key === 'mark') root.className = `sp sp-index sp-index--${String(p.mark).toLowerCase()}`;
      },
    };
  },
};
