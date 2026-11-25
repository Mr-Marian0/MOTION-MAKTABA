/** Grow Note: a lined-paper textarea that grows smoothly with your words; the counter rolls and warns near the limit. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Growing Note',
  element: 'Textarea',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['Self-resizing', 'Reactive', 'Focus-dependent'],
  effect: ['Expansion', 'Rolling', 'Shaking'],
  purpose: ['Feedback', 'Progress'],
  properties: ['Size', 'Color', 'Typography'],
  description: 'A lined-paper note that grows one line at a time as you write, instead of scrolling. The character counter rolls with each key, turns red near the limit and nudges when you hit it.',
  params: [
    { key: 'limit', label: 'Character limit', group: 'Content', type: 'range', min: 40, max: 300, step: 10, default: 120, live: true },
    { key: 'rows', label: 'Max lines', group: 'Layout', type: 'range', min: 3, max: 8, step: 1, default: 6, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('note');
    k.html(`
      <div class="sp sp-note-pad">
        <label class="sp-note-pad__label" for="${id}">Note to the printer</label>
        <textarea class="sp-note-pad__area" id="${id}" rows="1" placeholder="Start writing…" aria-describedby="${id}-c"></textarea>
        <span class="sp-note-pad__count" id="${id}-c" aria-live="polite"><b>0</b> / <span></span></span>
      </div>`);
    const area = k.$('.sp-note-pad__area');
    const count = k.$('.sp-note-pad__count');
    const num = count.querySelector('b');
    const lh = () => parseFloat(getComputedStyle(area).lineHeight);
    const s = k.track({ n: 0 });
    let h = 0;

    const sync = (animate = true) => {
      count.lastElementChild.textContent = p.limit;
      area.maxLength = p.limit;
      // Measure the content height at "auto", then tween from the old height to it.
      const from = area.offsetHeight;
      area.style.height = 'auto';
      const lines = Math.min(Number(p.rows), Math.max(1, Math.round((area.scrollHeight - 2) / lh())));
      const next = lines * lh() + (area.offsetHeight - area.clientHeight);
      area.style.height = `${from}px`;
      area.style.overflowY = Math.round(area.scrollHeight / lh()) > p.rows ? 'auto' : 'hidden';
      if (next !== h) gsap.to(area, { height: next, duration: animate && !reducedMotion ? 0.35 : 0, ease: 'back.out(1.6)' });
      h = next;
      const n = area.value.length;
      gsap.to(s, { n, duration: reducedMotion ? 0 : 0.3, onUpdate: () => (num.textContent = Math.round(s.n)) });
      count.classList.toggle('is-near', n >= p.limit * 0.85);
      if (n >= p.limit && animate && !reducedMotion) gsap.fromTo(count, { x: 0 }, { keyframes: { x: [-4, 4, -2, 0] }, duration: 0.3 });
    };
    sync(false);
    k.on(area, 'input', () => sync());

    return { destroy: () => k.destroy(), update: () => sync() };
  },
};
