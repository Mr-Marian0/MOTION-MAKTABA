/** Reveal Footer: the page lifts away to uncover a fixed footer; its big wordmark rises with the scroll. */
import { kit, esc, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Curtain Footer',
  element: 'Footer',
  trigger: ['Scroll'],
  behavior: ['Scroll-revealed', 'Scroll-scrubbed', 'Fixed', 'Staggered'],
  effect: ['Rising', 'Splitting', 'Sliding'],
  purpose: ['Branding', 'Orientation', 'Delight'],
  properties: ['Position', 'Typography'],
  description: 'A footer that sits fixed underneath the page. Scroll to the end and the page lifts away like a curtain; the big wordmark rises letter by letter, tied to the scroll.',
  params: [
    { key: 'word', label: 'Wordmark', group: 'Content', type: 'text', default: 'Maktaba' },
    { key: 'spread', label: 'Letter spread', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Footer color'),
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-foot">
        <footer class="sp-foot__footer">
          <nav class="sp-foot__links"><span>Index</span><span>Lab</span><span>Letters</span></nav>
          <b class="sp-foot__word" aria-label="${esc(p.word)}">${[...String(p.word)].map((c) => `<span class="sp-foot__ch" aria-hidden="true">${esc(c)}</span>`).join('')}</b>
        </footer>
        <div class="sp-foot__scroller" data-lenis-prevent tabindex="0" aria-label="Scroll this page">
          <article class="sp-foot__page"><small>Scroll down ↓</small><h4>The last page</h4>${bars(7)}${bars(7)}</article>
          <div class="sp-foot__gap" aria-hidden="true"></div>
        </div>
      </div>`);
    const scroller = k.$('.sp-foot__scroller');
    const chars = k.$$('.sp-foot__ch');
    const gap = k.$('.sp-foot__gap');

    // Scrubbed: 0 while the page covers the footer → 1 when the footer is fully revealed.
    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      const start = max - gap.offsetHeight;
      const t = Math.min(1, Math.max(0, (scroller.scrollTop - start) / gap.offsetHeight));
      const n = chars.length;
      chars.forEach((c, i) => {
        // Each letter gets its own slice of the progress, overlapping by `spread`.
        const span = 1 - p.spread * (1 - 1 / n);
        const local = Math.min(1, Math.max(0, (t - (i / n) * (1 - span)) / span));
        gsap.set(c, { yPercent: (1 - local) * 110 });
      });
    };
    k.on(scroller, 'scroll', update, { passive: true });
    k.resize(scroller, update);

    return { destroy: () => k.destroy(), update };
  },
};
