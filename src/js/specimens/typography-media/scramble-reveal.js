/** Scramble Reveal: characters flicker through random glyphs and lock in, left to right. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Decoder Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Randomized', 'Sequential', 'Time-driven'],
  effect: ['Glitching', 'Shape-assembly'],
  purpose: ['Delight', 'Focus', 'Branding'],
  properties: ['Typography', 'Color'],
  description: 'The line arrives as noise: each character flickers through random glyphs and then locks into the right letter, left to right. It runs when it comes into view; click to decode it again.',
  params: [
    { key: 'text', label: 'Text', group: 'Content', type: 'text', default: 'Decoding the archive' },
    { key: 'time', label: 'Duration', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'glyphs', label: 'Noise', group: 'Appearance', type: 'choice', options: ['Letters', 'Symbols', 'Digits'], default: 'Symbols', live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Noise color'),
  ],
};

const SETS = { Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', Symbols: '!<>-_\\/[]{}=+*^?#§¶', Digits: '0123456789' };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const text = String(p.text);
    k.html(`
      <div class="sp sp-dec">
        <button type="button" class="sp-dec__line" aria-label="${esc(text)}. Click to decode again"><span aria-hidden="true"></span></button>
        <p class="sp-note">Click to decode again</p>
      </div>`);
    const out = k.$('.sp-dec__line span');
    const s = k.track({ t: 0 });

    const draw = () => {
      const set = SETS[p.glyphs] || SETS.Symbols;
      const done = Math.floor(s.t * text.length);
      out.innerHTML = [...text].map((c, i) => {
        if (i < done || c === ' ') return esc(c);
        return `<i>${esc(set[Math.floor(Math.random() * set.length)])}</i>`;
      }).join('');
    };
    const run = () => {
      if (reducedMotion) return (out.textContent = text);
      gsap.fromTo(s, { t: 0 }, { t: 1, duration: Number(p.time), ease: 'none', onUpdate: draw, onComplete: () => (out.textContent = text) });
    };
    k.inView(out, run);
    k.on(k.$('.sp-dec__line'), 'click', run);

    return () => k.destroy();
  },
};
