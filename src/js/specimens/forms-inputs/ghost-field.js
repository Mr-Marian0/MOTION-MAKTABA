/** Ghost Field: every character you type leaves ghosts: faint copies of the letter rise up out of the field from where it landed and fade away, like breath on cold glass. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ghost Field',
  element: 'Text field',
  trigger: ['Keyboard'],
  behavior: ['Reactive', 'Position-aware', 'Temporary'],
  effect: ['Ghosting', 'Echo-motion', 'Rising'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'A username field with an afterglow. Each character you type sends up two or three ghost copies of itself from the spot where it appeared: they float up out of the field one after another, each fainter and larger than the last, and fade out like echoes. Deleting sends a single ghost of the removed letter downward instead.',
  params: [
    { key: 'ghosts', label: 'Ghosts', group: 'Shape', type: 'range', min: 1, max: 5, step: 1, unit: '', default: 3, live: true },
    { key: 'rise', label: 'Rise', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'em', default: 1.75, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Ghost'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('gho');
    k.html(`
      <div class="sp sp-fi sp-gho">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Pick a username</label>
          <div class="sp-fi__box sp-gho__box">
            <input class="sp-fi__input sp-gho__input" id="${id}" autocomplete="off" spellcheck="false" placeholder="ada_draws" />
            <span class="sp-gho__measure" aria-hidden="true"></span>
            <span class="sp-gho__air" aria-hidden="true"></span>
          </div>
          <p class="sp-note">Type something</p>
        </div>
      </div>`);
    const input = k.$('input');
    const measure = k.$('.sp-gho__measure');
    const air = k.$('.sp-gho__air');
    let prev = '';
    const ghost = (ch, x, up) => {
      const n = up ? Math.round(p.ghosts) : 1;
      for (let i = 0; i < n; i++) {
        const g = document.createElement('b');
        g.className = 'sp-gho__g';
        g.innerHTML = esc(ch);
        air.append(g);
        gsap.fromTo(g, { x, y: 0, opacity: 0.6 - i * 0.12, scale: 1 }, { y: `${(up ? -1 : 1) * p.rise * (1 + i * 0.35)}em`, scale: 1 + i * 0.25, opacity: 0, duration: 0.9 + i * 0.15, delay: i * 0.07, ease: 'power2.out', onComplete: () => g.remove() });
      }
    };
    k.on(input, 'input', () => {
      const v = input.value;
      if (reducedMotion) return (prev = v);
      // Where the change happened: measure the text up to the caret once per keystroke, minus the input's scroll
      const at = input.selectionStart ?? v.length;
      const added = v.length > prev.length;
      const ch = added ? v.slice(at - (v.length - prev.length), at).slice(-1) : prev.slice(at, at + (prev.length - v.length)).slice(-1);
      measure.textContent = v.slice(0, added ? at - 1 : at);
      const x = measure.offsetWidth - input.scrollLeft;
      if (ch && ch !== ' ') ghost(ch, x, added);
      prev = v;
    });
    return () => k.destroy();
  },
};
