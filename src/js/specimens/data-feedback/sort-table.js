/** Shuffle Table: click a column to sort; rows glide to their new places instead of jumping (FLIP). */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Gliding Sort Table',
  element: 'Tables',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Selection-dependent', 'State-dependent', 'Staggered', 'Reversible'],
  effect: ['Sliding', 'Sweeping'],
  purpose: ['Continuity', 'Orientation', 'Feedback'],
  properties: ['Position', 'Order', 'Color'],
  description: 'A small ledger. Click a column heading to sort by it, click again to reverse. Every row glides from its old place to its new one, so your eye can follow a row through the shuffle, and moved rows flash briefly.',
  params: [
    { key: 'speed', label: 'Glide time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.6, live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0, max: 0.1, step: 0.01, unit: 's', default: 0.03, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Flash color'),
  ],
};

const COLS = [['name', 'Paper'], ['gsm', 'Weight'], ['stock', 'Stock']];
const ROWS = [
  { name: 'Cotton rag', gsm: 300, stock: 12 },
  { name: 'Kraft', gsm: 120, stock: 48 },
  { name: 'Washi', gsm: 40, stock: 7 },
  { name: 'Newsprint', gsm: 45, stock: 90 },
  { name: 'Tracing', gsm: 90, stock: 23 },
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-table">
        <table class="sp-table__t">
          <thead><tr>${COLS.map(([key, label]) => `<th scope="col" aria-sort="none"><button type="button" class="sp-table__sort" data-key="${key}">${label} <i aria-hidden="true">↕</i></button></th>`).join('')}</tr></thead>
          <tbody>${ROWS.map((r, i) => `<tr class="sp-table__row" data-v="${i}">${COLS.map(([key]) => `<td>${esc(r[key])}${key === 'gsm' ? ' g' : ''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`);
    const body = k.$('tbody');
    const heads = k.$$('.sp-table__sort');
    let by = null;
    let dir = 1;

    heads.forEach((h) => k.on(h, 'click', () => {
      const key = h.dataset.key;
      dir = by === key ? -dir : 1;
      by = key;
      heads.forEach((x) => {
        x.closest('th').setAttribute('aria-sort', x === h ? (dir > 0 ? 'ascending' : 'descending') : 'none');
        x.lastElementChild.textContent = x === h ? (dir > 0 ? '↑' : '↓') : '↕';
      });
      // FLIP: First (old tops) → reorder the DOM (Last) → Invert with y → Play back to 0.
      const rows = k.$$('.sp-table__row');
      const first = new Map(rows.map((r) => [r, r.offsetTop]));
      const flash = getComputedStyle(stage).getPropertyValue('--sp-accent').trim() || '#d9c09a';
      rows.sort((a, b) => {
        const A = ROWS[a.dataset.v][key];
        const B = ROWS[b.dataset.v][key];
        return (typeof A === 'string' ? A.localeCompare(B) : A - B) * dir;
      }).forEach((r) => body.append(r));
      rows.forEach((r, i) => {
        const dy = first.get(r) - r.offsetTop;
        if (!dy) return;
        gsap.fromTo(r, { y: dy }, { y: 0, duration: reducedMotion ? 0 : Number(p.speed), ease: 'power3.inOut', delay: i * p.stagger });
        // A soft tint (accent at 25%) that fades once the row has landed.
        if (!reducedMotion) gsap.fromTo(r, { backgroundColor: `color-mix(in srgb, ${flash} 25%, transparent)` }, { backgroundColor: 'rgba(0,0,0,0)', duration: 1.2, delay: Number(p.speed) * 0.8 });
      });
    }));

    return () => k.destroy();
  },
};
