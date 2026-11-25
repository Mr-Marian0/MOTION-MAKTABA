/**
 * SECTION 2 — CARD CATALOG
 *
 * Renders one row per entry in src/data/cards.js. Rows alternate:
 * odd rows put the kraft plate (live demo) on the left and the text on the
 * right; even rows flip it. Each row sits on a cream band that bleeds off
 * the screen on the plate's side and is torn on the other.
 *
 * The plate's live demo comes from its effect module's `demo()` export;
 * the registry mounts the effect itself (data-effect) afterwards.
 *
 * Motion, per row as it scrolls in
 *   - band: slides out from the screen edge like a drawer (scrubbed)
 *   - plate: flies in from its side with a twist and settles (scrubbed)
 *   - big number: drifts against the scroll (scrubbed parallax)
 *   - text: code, title, description, tags and CTA rise in, staggered (once)
 * Hover: the plate straightens and lifts (CSS); the demo speeds up (effect).
 * Click: the whole row is a link with the paper-tear page transition.
 */
import { cards } from '../../data/cards.js';
import { loadModule } from '../core/registry.js';

const pad = (n) => String(n).padStart(2, '0');
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function renderRow(card, i, total, demoHTML) {
  const side = i % 2 === 0 ? 'left' : 'right'; // which side the plate is on
  const tearSide = side === 'left' ? 'right' : 'left';
  return `
    <li class="catalog-row catalog-row--${side}" data-effect-host data-row>
      <div class="catalog-row__band paper-cream tear-edge--${tearSide} tear-v${(i % 3) + 1}" data-row-band aria-hidden="true"></div>
      <span class="catalog-row__num" data-row-num aria-hidden="true">${pad(i + 1)}</span>

      <div class="catalog-row__plate" data-row-plate>
        <div class="mm-plate paper-kraft">
          <span class="mm-plate__tape tape" aria-hidden="true"></span>
          <div class="mm-plate__demo" aria-hidden="true"
               data-effect="${esc(card.effect)}"
               data-effect-options="${esc(JSON.stringify(card.effectOptions || {}))}">
            ${demoHTML}
          </div>
          <span class="mm-plate__hint folio" aria-hidden="true">${esc(card.hint)}</span>
        </div>
      </div>

      <div class="catalog-row__text">
        <p class="catalog-row__code folio" data-row-text>
          <span>Drawer ${pad(i + 1)} of ${pad(total)}</span>
          <span>${(card.items || []).length} elements</span>
        </p>
        <h3 class="catalog-row__title" data-row-text>
          <a class="catalog-row__link" href="library/${esc(card.category)}.html"
             data-transition data-transition-label="${esc(card.title)}">${esc(card.title)}</a>
        </h3>
        <p class="catalog-row__desc" data-row-text>${esc(card.description)}</p>
        <ul class="catalog-row__items" aria-label="Filed in this drawer">
          ${(card.items || [])
            .map((item) =>
              card.itemLinks
                ? `<li data-row-tag><a href="library/${esc(card.category)}.html?element=${encodeURIComponent(item)}"
                       data-transition data-transition-label="${esc(card.title)} · ${esc(item)}">${esc(item)}</a></li>`
                : `<li data-row-tag>${esc(item)}</li>`
            )
            .join('')}
        </ul>
        <span class="catalog-row__cta" data-row-text aria-hidden="true">Open the drawer <i>→</i></span>
      </div>

      <a class="catalog-row__hit" href="library/${esc(card.category)}.html" tabindex="-1" aria-hidden="true"
         data-transition data-transition-label="${esc(card.title)}"></a>
    </li>`;
}

export default {
  name: 'card-catalog',
  _ctx: null,

  async init(el, { gsap, reducedMotion }) {
    const list = el.querySelector('[data-catalog-grid]');
    const count = el.querySelector('[data-catalog-count]');
    if (!list) return;

    // Fetch each row's demo markup from its effect module.
    const demos = await Promise.all(
      cards.map((c) =>
        loadModule('effects', c.effect)
          .then((m) => (typeof m.demo === 'function' ? m.demo(c) : ''))
          .catch(() => '')
      )
    );

    list.innerHTML = cards.map((c, i) => renderRow(c, i, cards.length, demos[i])).join('');
    if (count) count.textContent = `${pad(cards.length)} drawers`;

    if (reducedMotion) return;

    this._ctx = gsap.context(() => {
      list.querySelectorAll('[data-row]').forEach((row) => {
        const dir = row.classList.contains('catalog-row--left') ? -1 : 1; // plate side
        const band = row.querySelector('[data-row-band]');
        const plate = row.querySelector('[data-row-plate]');
        const num = row.querySelector('[data-row-num]');
        const text = row.querySelectorAll('[data-row-text]');
        const tags = row.querySelectorAll('[data-row-tag]');

        // Band + plate are tied to the scrollbar.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 35%', scrub: 0.8 },
          })
          .fromTo(
            band,
            { clipPath: dir < 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 },
            0
          )
          .fromTo(
            plate,
            { xPercent: 55 * dir, yPercent: 18, rotation: 14 * -dir, opacity: 0 },
            { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
            0
          );

        // The big drawer number drifts against the scroll the whole way through.
        gsap.fromTo(
          num,
          { yPercent: 40 },
          {
            yPercent: -40,
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );

        // Text rises in once; tags are dealt in one after another.
        gsap.set([...text, ...tags], { opacity: 0, y: 28 });
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: 'top 72%', once: true } })
          .to(text, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09 })
          .to(
            tags,
            {
              opacity: 1,
              y: 0,
              rotation: () => gsap.utils.random(-2.5, 2.5),
              duration: 0.6,
              ease: 'back.out(2)',
              stagger: 0.05,
            },
            0.25
          );
      });
    }, el);
  },

  destroy() {
    this._ctx?.revert();
  },
};
