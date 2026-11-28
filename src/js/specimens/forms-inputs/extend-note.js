/** Extend Note: a one-line note box that extends like a telescope: each time your text needs another line, the box slides out one more section with a little overshoot, and slides back in as you delete. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Extend Note',
  element: 'Textarea',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['State-dependent', 'Self-resizing', 'Reactive'],
  effect: ['Extending', 'Retracting', 'Overshoot-motion'],
  purpose: ['Feedback', 'Affordance', 'Continuity'],
  properties: ['Size', 'Clip & mask', 'Position'],
  description: 'A delivery-notes box that starts one line tall. As soon as the text needs a new line, the box extends by exactly one line, like the next section of a telescope sliding out, overshooting a hair and settling. Delete lines and it slides back in. A line counter rides along on the bottom edge.',
  params: [
    { key: 'max', label: 'Most lines', group: 'Shape', type: 'range', min: 3, max: 8, step: 1, unit: '', default: 6 },
    { key: 'time', label: 'Extend time', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Rim'),
  ],
};

const LINE = 1.425; // one text line in the tube's em: 0.95em text × 1.5 line height
const PAD = 1.75; // the textarea's top + bottom padding (0.8em each at 0.95em) plus its borders

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('ext');
    const max = Math.round(p.max);
    k.html(`
      <div class="sp sp-fi sp-ext" style="--max:${max}">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Delivery notes</label>
          <div class="sp-ext__tube">
            <textarea class="sp-fi__area sp-ext__area" id="${id}" rows="${max}" placeholder="Leave it at no. 12…"></textarea>
            <span class="sp-ext__rail" aria-hidden="true"><span class="sp-ext__cap"><b>1</b> / ${max}</span></span>
          </div>
          <p class="sp-note">Type a few lines · press Enter</p>
        </div>
      </div>`);
    const tube = k.$('.sp-ext__tube');
    const area = k.$('.sp-ext__area');
    const cap = k.$('.sp-ext__cap');
    const count = k.$('.sp-ext__cap b');
    // Lines in use: collapse the textarea for an instant and read its content height, once per keystroke
    // (never per frame). Line height and padding are cached on resize.
    let shown = 1, lh = 20, pad = 20;
    k.resize(area, () => {
      const cs = getComputedStyle(area);
      lh = parseFloat(cs.lineHeight) || 20;
      pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    });
    const lines = () => {
      area.style.height = '0px';
      const h = area.scrollHeight;
      area.style.height = '';
      return Math.max(1, Math.min(max, Math.round((h - pad) / lh)));
    };
    const set = (n) => {
      if (n === shown) return;
      shown = n;
      count.textContent = n;
      gsap.to(tube, { '--h': `${PAD + n * LINE}em`, duration: reducedMotion ? 0 : p.time, ease: 'back.out(2.2)', overwrite: true });
    };
    gsap.set(tube, { '--h': `${PAD + LINE}em` });
    k.on(area, 'input', () => set(lines()));
    // The clipped-away part of the textarea doesn't take clicks, so the whole tube focuses it
    k.on(tube, 'pointerdown', (e) => e.target !== area && (e.preventDefault(), area.focus()));
    // Extra: focusing nudges the cap down a hair, as if the tube is about to slide out
    k.on(area, 'focus', () => !reducedMotion && gsap.fromTo(cap, { y: 0 }, { keyframes: { y: ['0.25em', 0] }, duration: 0.4, ease: 'power2.out' }));
    return () => k.destroy();
  },
};
