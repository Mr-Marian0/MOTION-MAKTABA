/**Magnifying Dock: tiles swell near the cursor; a click bounces. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Magnifying Dock',
  element: 'Navbar',
  trigger: ['Cursor move', 'Click'],
  behavior: ['Proximity-aware', 'Docked', 'Position-aware'],
  effect: ['Bulging', 'Expansion', 'Bouncing'],
  purpose: ['Navigation', 'Delight', 'Feedback'],
  properties: ['Size', 'Position'],
  description: 'Icon tiles grow as the cursor passes over them, as if under a magnifying glass. Click one and it bounces.',
  params: [
    { key: 'tiles', label: 'Tiles', group: 'Content', type: 'range', min: 3, max: 9, step: 1, default: 6 },
    { key: 'mag', label: 'Magnification', group: 'Size', type: 'range', min: 1, max: 2.6, step: 0.1, unit: '×', default: 1.8, live: true },
    { key: 'range', label: 'Lens width', group: 'Size', type: 'range', min: 40, max: 260, step: 10, unit: 'px', default: 120, live: true },
    { key: 'bounce', label: 'Bounce on click', group: 'Motion', type: 'toggle', default: true, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Tile color'),
  ],
};

const TILES = [
  ['✉', 'Letters'], ['✎', 'Notes'], ['⌂', 'Home'], ['☼', 'Daylight'], ['♫', 'Music'],
  ['✂', 'Cuttings'], ['⚑', 'Flags'], ['☕', 'Break'], ['✿', 'Pressed flowers'],
];

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const tiles = TILES.slice(0, Number(p.tiles) || 6);
    k.html(`
      <div class="sp sp-dock">
        <p class="sp-note">Glide along the dock · click a tile</p>
        <nav class="sp-dock__bar" aria-label="Specimen dock">
          ${tiles.map(([g, name], i) => `
            <button class="sp-dock__tile ${i === 2 ? 'is-on' : ''}" aria-label="${name}">
              <span aria-hidden="true">${g}</span><i class="sp-dock__dot"></i>
            </button>`).join('')}
        </nav>
      </div>`);

    const bar = k.$('.sp-dock__bar');
    const btns = k.$$('.sp-dock__tile');

    k.on(bar, 'pointermove', (e) => {
      const r = Number(p.range);
      const mag = Number(p.mag);
      btns.forEach((b) => {
        const box = b.getBoundingClientRect();
        const d = Math.abs(e.clientX - (box.left + box.width / 2));
        const f = Math.max(0, 1 - (d / r) ** 2); // smooth lens falloff
        gsap.to(b, { '--s': 1 + (mag - 1) * f, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
      });
    });
    k.on(bar, 'pointerleave', () => gsap.to(btns, { '--s': 1, duration: 0.5, ease: 'expo.out' }));

    btns.forEach((b) =>
      k.on(b, 'click', () => {
        btns.forEach((o) => o.classList.toggle('is-on', o === b));
        if (!p.bounce) return;
        gsap
          .timeline()
          .to(b, { y: '-0.9em', duration: 0.22, ease: 'power2.out' })
          .to(b, { y: 0, duration: 0.7, ease: 'bounce.out' });
      })
    );

    return () => k.destroy();
  },
};
