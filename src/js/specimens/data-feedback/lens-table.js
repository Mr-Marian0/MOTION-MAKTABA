/** Lens Table: a dense data table read through a fisheye: the row under the pointer (or focused) swells to full size, its neighbours bulge less and the rest stay compressed, like a lens drawn down the list. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from '../cards-containers/_shape.js';

export const meta = {
  title: 'Lens Table',
  element: 'Tables',
  trigger: ['Cursor move', 'Keyboard', 'Hover'],
  behavior: ['Cursor-following', 'Proximity-aware', 'Focus-dependent'],
  effect: ['Optical-warping', 'Bulging', 'Expansion'],
  purpose: ['Focus', 'Orientation', 'Hierarchy'],
  properties: ['Size', 'Scale', 'Typography'],
  description: 'Fourteen days of sensor readings squeezed into a small space, readable through a fisheye lens. Move the pointer down the table (or use ↑/↓) and the rows warp around it: the row under the lens is shown at full height and size, the rows next to it are partly enlarged, and the rest stay tightly compressed, so the magnified band follows you through the data.',
  params: [
    { key: 'mag', label: 'Magnification', group: 'Motion', type: 'range', min: 1.4, max: 3, step: 0.1, unit: '×', default: 2.2, live: true },
    { key: 'spread', label: 'Lens width', group: 'Shape', type: 'range', min: 0.5, max: 3, step: 0.25, unit: 'rows', default: 1.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Lens'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(4);
    const DATA = Array.from({ length: 14 }, (_, i) => [`Nov ${i + 1}`, (14 + r() * 8).toFixed(1), Math.round(40 + r() * 40), (1000 + r() * 30).toFixed(0)]);
    k.html(`
      <div class="sp sp-df sp-lnt">
        <div class="sp-df__card">
          <span class="sp-df__kick">Greenhouse sensor log</span>
          <div class="sp-lnt__table" tabindex="0" role="table" aria-label="Sensor log, 14 days (arrow keys move the lens)">
            <div class="sp-lnt__head" role="row"><span role="columnheader">Day</span><span role="columnheader">°C</span><span role="columnheader">RH %</span><span role="columnheader">hPa</span></div>
            ${DATA.map((d) => `<div class="sp-lnt__row" role="row">${d.map((c) => `<span role="cell">${c}</span>`).join('')}</div>`).join('')}
          </div>
        </div>
      </div>`);
    const table = k.$('.sp-lnt__table');
    const rows = k.$$('.sp-lnt__row');
    // Each row's scale falls off with distance (in rows) from the lens centre; the font scales with it,
    // so taller rows push the others down: real layout change, but only for 14 small rows on a pointer move.
    let at = -1;
    const lens = (c) => rows.forEach((row, i) => {
      const f = c < 0 ? 0 : Math.exp(-(((i - c) / p.spread) ** 2));
      const s = 1 + (p.mag - 1) * f;
      row.classList.toggle('is-on', c >= 0 && Math.round(c) === i);
      gsap.to(row, { '--s': s, duration: reducedMotion ? 0 : 0.25, ease: 'power2.out', overwrite: true });
    });
    let box;
    k.on(table, 'pointerenter', () => (box = table.getBoundingClientRect()));
    k.on(table, 'pointermove', (e) => {
      if (!box) return;
      // which row is under the pointer, read from the live layout once per move
      const y = e.clientY - box.top;
      let c = rows.findIndex((row) => row.offsetTop + row.offsetHeight > y);
      if (c < 0) c = rows.length - 1;
      if (c !== at) { at = c; lens(c); }
    });
    k.on(table, 'pointerleave', () => { box = null; if (document.activeElement !== table) { at = -1; lens(-1); } });
    k.on(table, 'focus', () => { if (at < 0) at = 0; lens(at); });
    k.on(table, 'blur', () => { at = -1; lens(-1); });
    k.on(table, 'keydown', (e) => { const d = { ArrowUp: -1, ArrowDown: 1 }[e.key]; if (!d) return; e.preventDefault(); at = Math.max(0, Math.min(rows.length - 1, at + d)); lens(at); });
    return () => k.destroy();
  },
};
