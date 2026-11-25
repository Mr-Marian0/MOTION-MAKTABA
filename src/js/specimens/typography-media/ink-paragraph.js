/** Ink Paragraph: words fill with ink one by one as you scroll through the text. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Inking Paragraph',
  element: 'Paragraph',
  trigger: ['Scroll'],
  behavior: ['Scroll-scrubbed', 'Sequential', 'Reversible'],
  effect: ['Sweeping', 'Accumulation'],
  purpose: ['Focus', 'Storytelling', 'Progress'],
  properties: ['Opacity', 'Color'],
  description: 'A paragraph that starts faint. As you scroll, the words fill with ink one by one, tied to the scroll, so the reader always sees how far they have read. Scroll back and it fades again.',
  params: [
    { key: 'faint', label: 'Unread opacity', group: 'Appearance', type: 'range', min: 0.05, max: 0.5, step: 0.05, default: 0.15, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

const TEXT = 'A letterpress printer sets each line by hand, one piece of type at a time, then locks the forme and inks the rollers. Every pull of the press leaves a small bite in the paper, a shadow you can feel with your fingertips. That bite is the reason people still keep these prints in drawers, long after the words themselves are known by heart.';

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-inkp">
        <div class="sp-inkp__scroller" data-lenis-prevent tabindex="0" aria-label="Scroll the paragraph">
          <small class="sp-inkp__hint">Scroll ↓</small>
          <p class="sp-inkp__text">${TEXT.split(' ').map((w) => `<span class="sp-inkp__w">${w}</span>`).join(' ')}</p>
        </div>
      </div>`);
    const scroller = k.$('.sp-inkp__scroller');
    const words = k.$$('.sp-inkp__w');

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight || 1;
      const lit = (scroller.scrollTop / max) * words.length;
      words.forEach((w, i) => gsap.set(w, { opacity: p.faint + (1 - p.faint) * Math.min(1, Math.max(0, lit - i)) }));
    };
    k.on(scroller, 'scroll', update, { passive: true });
    k.resize(scroller, update);

    return { destroy: () => k.destroy(), update };
  },
};
