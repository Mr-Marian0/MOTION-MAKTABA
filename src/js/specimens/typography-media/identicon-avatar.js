/** Identicon Avatar: a default avatar generated from your name: type a name and a symmetric pattern grows out of it cell by cell from the centre, coloured by the name, so every name gets its own unique face. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Identicon Avatar',
  element: 'Avatar',
  trigger: ['Keyboard'],
  behavior: ['Generative', 'Seeded-random', 'Reactive'],
  effect: ['Generative-motion', 'Shape-assembly', 'Expansion'],
  purpose: ['Feedback', 'Branding', 'Delight'],
  properties: ['Scale', 'Color', 'Shape'],
  description: 'A sign-up step that generates your placeholder avatar. Type a name and an identicon is built from it: the name is hashed into a 5 × 5 grid mirrored left to right and a colour, and the filled cells grow in from the centre outward in a quick ripple. Change a letter and the old pattern shrinks away as the new one grows, the same name always giving the same face.',
  params: [
    { key: 'time', label: 'Grow time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Frame'),
  ],
};

/** A small string hash (FNV-1a). */
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('idc');
    k.html(`
      <div class="sp sp-tm sp-idc">
        <div class="sp-idc__tile" role="img" aria-label="Generated avatar">${'<i></i>'.repeat(25)}</div>
        <label class="sp-idc__label" for="${id}">Your name</label>
        <input class="sp-idc__input" id="${id}" value="Mira" autocomplete="off" />
      </div>`);
    const tile = k.$('.sp-idc__tile');
    const cells = k.$$('.sp-idc__tile i');
    const input = k.$('.sp-idc__input');
    const draw = () => {
      const name = input.value.trim() || '?';
      const h = hash(name.toLowerCase());
      tile.style.setProperty('--ink', `hsl(${h % 360} 55% 42%)`);
      tile.setAttribute('aria-label', `Generated avatar for ${name}`);
      // 15 bits fill the left 3 columns; columns 3 and 4 mirror 1 and 0
      const on = cells.map((_, i) => { const r = Math.floor(i / 5), c = i % 5; const cc = c > 2 ? 4 - c : c; return Boolean((h >> (r * 3 + cc)) & 1); });
      const dist = (i) => Math.hypot((i % 5) - 2, Math.floor(i / 5) - 2);
      cells.forEach((el, i) => {
        if (reducedMotion) return gsap.set(el, { scale: on[i] ? 1 : 0 });
        gsap.to(el, { scale: on[i] ? 1 : 0, duration: p.time * 0.6, delay: on[i] ? (dist(i) / 2.9) * p.time * 0.6 : 0, ease: on[i] ? 'back.out(2.5)' : 'power2.in', overwrite: true });
      });
    };
    gsap.set(cells, { scale: 0 });
    k.on(input, 'input', draw);
    k.inView(tile, draw);
    return () => k.destroy();
  },
};
