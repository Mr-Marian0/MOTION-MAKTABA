/** Expand Content: a card grows out of its spot into a full reading sheet, and shrinks back on close. */
import { kit, esc, labelsOf, bars, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Open the Article',
  element: 'Content card',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Hover-dependent', 'Activation-dependent', 'Reversible', 'Staggered'],
  effect: ['Morphing-transition', 'Expansion', 'Rising'],
  purpose: ['Continuity', 'Focus', 'Hierarchy'],
  properties: ['Size', 'Position', 'Opacity'],
  description: 'Three article cards. Hovering zooms the picture slightly. Clicking one grows it from its own spot into a full reading sheet while the others fade back. Closing shrinks it home.',
  params: [
    { key: 'titles', label: 'Titles', group: 'Content', type: 'text', default: 'Paper grain, Torn edges, Ink stains' },
    { key: 'speed', label: 'Open time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Expo', live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Picture color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const titles = labelsOf(p.titles, ['Paper grain']).slice(0, 3);
    k.html(`
      <div class="sp sp-read">
        <div class="sp-read__grid">
          ${titles.map((t, i) => `
            <button type="button" class="sp-read__card">
              <span class="sp-read__pic" style="--i:${i}"></span>
              <small>Essay 0${i + 1}</small><b>${esc(t)}</b>
            </button>`).join('')}
        </div>
        <div class="sp-read__sheet" role="dialog" aria-label="Article" hidden>
          <span class="sp-read__pic"></span>
          <div class="sp-read__body"><small></small><b></b>${bars(5)}</div>
          <button type="button" class="sp-read__close" aria-label="Close">✕</button>
        </div>
        <p class="sp-note">Open an article</p>
      </div>`);
    const grid = k.$('.sp-read__grid');
    const sheet = k.$('.sp-read__sheet');
    const close = k.$('.sp-read__close');
    let from = null;

    // Sheet = the card's box, scaled up to fill the stage. We animate from the card's rect to the full rect.
    const rectOf = (el) => {
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
    };

    k.$$('.sp-read__card').forEach((card, i) => {
      k.on(card, 'click', () => {
        from = card;
        sheet.querySelector('small').textContent = `Essay 0${i + 1}`;
        sheet.querySelector('b').textContent = titles[i];
        sheet.querySelector('.sp-read__pic').style.setProperty('--i', i);
        sheet.hidden = false;
        const t = reducedMotion ? 0 : Number(p.speed);
        gsap.fromTo(sheet, rectOf(card), { left: '5%', top: '7%', width: '90%', height: '86%', duration: t, ease: EASES[p.ease] });
        gsap.to(grid, { opacity: 0.15, scale: 0.96, duration: t });
        gsap.fromTo(sheet.querySelectorAll('.sp-line'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, delay: t * 0.6, duration: 0.4 });
        close.focus({ preventScroll: true });
      });
    });

    const shut = () => {
      if (sheet.hidden) return;
      const t = reducedMotion ? 0 : Number(p.speed) * 0.8;
      gsap.to(grid, { opacity: 1, scale: 1, duration: t });
      gsap.to(sheet, { ...rectOf(from), duration: t, ease: 'power3.inOut', onComplete: () => (sheet.hidden = true) });
      from.focus({ preventScroll: true });
    };
    k.on(close, 'click', shut);
    k.on(sheet, 'keydown', (e) => e.key === 'Escape' && (e.stopPropagation(), shut()));

    return () => k.destroy();
  },
};
