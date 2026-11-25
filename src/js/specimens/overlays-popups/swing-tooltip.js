/** Hanging Tooltip: the tip drops in on a string and swings like a hanging tag, trailing the cursor a little. */
import { kit, esc, labelsOf, uid, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Hanging Tag Tooltip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus', 'Cursor move'],
  behavior: ['Hover-dependent', 'Focus-dependent', 'Cursor-following', 'Transient'],
  effect: ['Swinging', 'Dropping', 'Pendulum-motion', 'Damped-oscillation'],
  purpose: ['Affordance', 'Delight', 'Wayfinding'],
  properties: ['Rotation', 'Position', 'Opacity'],
  description: 'Tooltips that hang from a string like a shop tag. They drop in and swing to rest under the hovered (or focused) word, lean as the cursor slides along it, and are lifted away when you leave.',
  params: [
    { key: 'words', label: 'Terms', group: 'Content', type: 'text', default: 'Deckle, Foxing, Colophon' },
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 0, max: 40, step: 1, unit: '°', default: 18, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Tag color'),
  ],
};

const DEFS = { Deckle: 'The rough, feathered edge of handmade paper.', Foxing: 'Brown age spots on old paper.', Colophon: 'A note on how and where a book was made.' };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const words = labelsOf(p.words, ['Deckle']).slice(0, 4);
    const id = uid('tip');
    k.html(`
      <div class="sp sp-tag">
        <p class="sp-tag__text">A glossary of paper words: ${words.map((w, i) => `<button type="button" class="sp-tag__term" aria-describedby="${id}" data-i="${i}">${esc(w)}</button>`).join(', ')}.</p>
        <div class="sp-tag__tip" id="${id}" role="tooltip" hidden><i class="sp-tag__string"></i><span class="sp-tag__card"></span></div>
      </div>`);
    const tip = k.$('.sp-tag__tip');
    const card = k.$('.sp-tag__card');
    let current = null;

    const place = (term, x) => {
      const s = stage.getBoundingClientRect();
      const r = term.getBoundingClientRect();
      const left = clamp((x ?? r.left + r.width / 2) - s.left, 40, s.width - 40);
      gsap.to(tip, { x: left, y: r.bottom - s.top, duration: reducedMotion ? 0 : 0.35, ease: 'power3.out' });
      return left;
    };
    const show = (term) => {
      current = term;
      card.textContent = DEFS[term.textContent] || `"${term.textContent}": a word from the paper trade.`;
      tip.hidden = false;
      place(term);
      if (reducedMotion) return gsap.set(tip, { opacity: 1, rotation: 0 });
      gsap.fromTo(tip, { opacity: 0, rotation: p.swing }, { opacity: 1, rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.25)' });
      gsap.fromTo(card, { y: -12 }, { y: 0, duration: 0.5, ease: 'bounce.out' });
    };
    const hide = () => {
      current = null;
      gsap.to(tip, { opacity: 0, y: '-=10', duration: reducedMotion ? 0 : 0.2, onComplete: () => !current && (tip.hidden = true) });
    };
    k.$$('.sp-tag__term').forEach((term) => {
      k.on(term, 'pointerenter', () => show(term));
      k.on(term, 'focus', () => show(term));
      k.on(term, 'pointerleave', hide);
      k.on(term, 'blur', hide);
      k.on(term, 'pointermove', (e) => {
        if (reducedMotion || current !== term) return;
        const r = term.getBoundingClientRect();
        const lean = ((e.clientX - (r.left + r.width / 2)) / r.width) * -p.swing; // the tag trails the cursor
        place(term, e.clientX);
        gsap.to(tip, { rotation: lean, duration: 0.6, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
      });
    });
    k.on(stage, 'keydown', (e) => e.key === 'Escape' && current && hide());

    return () => k.destroy();
  },
};
