/** Disperse Note: discarding a draft breaks the text into grains that disperse like ink in water, spreading out, drifting and thinning until the box is clean. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Disperse Note',
  element: 'Textarea',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Randomized', 'Temporary'],
  effect: ['Dispersion', 'Scattering', 'Disintegration'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'A draft box whose "Discard" lets the writing go gently. The text breaks into a fine grid of grains that spread outward from the middle and drift, as if the ink were dissolving into water, thinning to nothing while the box beneath is already empty. Ctrl/⌘ + Backspace discards too.',
  params: [
    { key: 'spread', label: 'Spread', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 'em', default: 3.5, live: true },
    { key: 'grain', label: 'Grain', group: 'Shape', type: 'range', min: 6, max: 20, step: 1, unit: '', default: 12 },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('dsp');
    k.html(`
      <div class="sp sp-fi sp-dsn">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Draft reply</label>
          <div class="sp-dsn__box">
            <textarea class="sp-fi__area sp-dsn__area" id="${id}">I'm not sure this is the right moment to change the whole layout, but the new margins do look better.</textarea>
            <div class="sp-cc__pieces"></div>
          </div>
          <button type="button" class="sp-fi__btn sp-fi__btn--ghost sp-dsn__go">Discard draft</button>
        </div>
      </div>`);
    const area = k.$('.sp-dsn__area');
    const host = k.$('.sp-cc__pieces');
    const cols = Math.round(p.grain);
    const discard = () => {
      const text = area.value;
      if (!text.trim()) return;
      area.value = '';
      area.focus();
      if (reducedMotion) return;
      // A copy of the text laid out like the textarea, cut into grains; each drifts out from the centre
      const copy = `<div class="sp-dsn__copy">${esc(text)}</div>`;
      const bits = pieces(host, copy, grid(cols, Math.round(cols * 0.45)));
      const tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const a = Math.atan2(cy - 50, cx - 50) + (Math.random() - 0.5);
        const r = p.spread * (0.4 + Math.random() * 0.6);
        tl.to(el, { x: `${Math.cos(a) * r}em`, y: `${Math.sin(a) * r * 0.6 + 0.6}em`, rotation: (Math.random() - 0.5) * 50, scale: 0.6 + Math.random() * 0.6, autoAlpha: 0, duration: p.time * (0.7 + Math.random() * 0.3), ease: 'power1.out' }, Math.random() * 0.15);
      });
    };
    k.on(k.$('.sp-dsn__go'), 'click', discard);
    k.on(area, 'keydown', (e) => (e.ctrlKey || e.metaKey) && e.key === 'Backspace' && (e.preventDefault(), discard()));
    return () => k.destroy();
  },
};
