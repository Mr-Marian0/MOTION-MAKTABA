/**
 * LIBRARY HEADER — the top of every category page.
 *
 * Reads `data-category` and fills itself from src/data/cards.js, so a new
 * page only needs: <header data-section="library-header" data-category="slug">
 * Includes a back link plus previous/next drawer links (with transitions).
 */
import { cards } from '../../data/cards.js';

const pad = (n) => String(n).padStart(2, '0');
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const link = (card, dir) =>
  `<a class="mm-link" href="${esc(card.category)}.html" data-transition
      data-transition-label="${esc(card.title)}">
     ${dir === 'prev' ? '← ' : ''}${esc(card.title)}${dir === 'next' ? ' →' : ''}
   </a>`;

export default {
  name: 'library-header',
  _ctx: null,

  init(el, { gsap, reducedMotion }) {
    const index = cards.findIndex((c) => c.category === el.dataset.category);
    const card = cards[index];

    if (!card) {
      el.innerHTML = `<p class="library-header__code folio">Unknown drawer: "${esc(el.dataset.category)}"</p>`;
      return;
    }

    document.title = `${card.title} · MY Motion Maktaba`;
    const prev = cards[(index - 1 + cards.length) % cards.length];
    const next = cards[(index + 1) % cards.length];

    el.innerHTML = `
      <nav class="library-header__nav folio" aria-label="Library">
        <a class="mm-link" href="../index.html#catalog" data-transition data-transition-label="The Collections">← The Collections</a>
        <span>MY — Motion Maktaba</span>
      </nav>

      <div class="library-header__body">
        <p class="library-header__code folio">Drawer ${pad(index + 1)} of ${pad(cards.length)}</p>
        <h1 class="library-header__title">${esc(card.title)}</h1>
        <p class="library-header__desc">${esc(card.description)}</p>
      </div>

      <nav class="library-header__foot folio" aria-label="Other drawers">
        ${link(prev, 'prev')}
        ${link(next, 'next')}
      </nav>`;

    if (reducedMotion) return;

    // Header copy rises in after the curtain opens.
    this._ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.library-header__code, .library-header__title, .library-header__desc'), {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1,
        delay: 0.35,
      });
    }, el);
  },

  destroy() {
    this._ctx?.revert();
  },
};
