/** Spring Table: sort the leaderboard and every row springs to its new place: they move on springs, overshooting and bouncing into the new order, rows that move further bouncing harder. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const ROWS = [['Ada', 1240, 18], ['Ben', 980, 24], ['Cleo', 1510, 12], ['Dev', 760, 31], ['Eva', 1330, 15]];

export const meta = {
  title: 'Spring Table',
  element: 'Tables',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Spring-driven', 'State-dependent', 'Elastic'],
  effect: ['Springing', 'Spring-motion', 'Overshoot-motion'],
  purpose: ['Hierarchy', 'Continuity', 'Feedback'],
  properties: ['Position', 'Order'],
  description: 'A leaderboard you can sort by points or by streak, ascending or descending. Choose a column header and every row springs to its new rank on its own spring: it shoots toward its new position, overshoots, bounces back and settles, so a row climbing four places bounces more than one moving a single place. The sorted column header shows the direction.',
  params: [
    { key: 'bounce', label: 'Bounciness', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: '', default: 0.4, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Sorted'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-spt">
        <div class="sp-df__card">
          <span class="sp-df__kick">Leaderboard</span>
          <div class="sp-spt__table" role="table" aria-label="Leaderboard">
            <div class="sp-spt__head" role="row"><span role="columnheader">Name</span><button type="button" role="columnheader" data-c="1" aria-sort="descending">Points</button><button type="button" role="columnheader" data-c="2" aria-sort="none">Streak</button></div>
            <div class="sp-spt__body">${ROWS.map(([n, pt, st]) => `<div class="sp-spt__row" role="row"><span role="cell">${n}</span><span role="cell">${pt}</span><span role="cell">${st} d</span></div>`).join('')}</div>
          </div>
        </div>
      </div>`);
    const body = k.$('.sp-spt__body');
    const rows = k.$$('.sp-spt__row');
    const heads = k.$$('[data-c]');
    let RH = 30;
    let order = ROWS.map((_, i) => i);
    const place = (now, before) => order.forEach((ri, rank) => {
      const y = rank * RH;
      if (now || reducedMotion) return gsap.set(rows[ri], { y });
      const moved = Math.abs(rank - before.indexOf(ri));
      gsap.to(rows[ri], { y, duration: 0.6 + moved * 0.15, ease: `elastic.out(${1 + moved * 0.15}, ${p.bounce})`, overwrite: true });
    });
    k.resize(body, () => { RH = rows[0].offsetHeight; body.style.height = `${RH * rows.length}px`; place(true); });
    const sort = (c, dir) => {
      const before = order.slice();
      order = order.slice().sort((a, b) => (ROWS[a][c] - ROWS[b][c]) * (dir === 'ascending' ? 1 : -1));
      heads.forEach((h) => h.setAttribute('aria-sort', Number(h.dataset.c) === c ? dir : 'none'));
      place(false, before);
    };
    heads.forEach((h) => k.on(h, 'click', () => sort(Number(h.dataset.c), h.getAttribute('aria-sort') === 'descending' ? 'ascending' : 'descending')));
    order = order.sort((a, b) => ROWS[b][1] - ROWS[a][1]);
    return () => k.destroy();
  },
};
