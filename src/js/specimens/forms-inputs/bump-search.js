/** Bump Search: active filters ride in the bar like cars on a track: adding one sends it sliding in from the right until it collides with the row, knocking the others along with a jolt that passes down the line. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

const SUGGEST = ['Hardcover', 'In stock', 'Under £20', 'Signed', 'First edition'];

export const meta = {
  title: 'Bump Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Collision-responsive', 'Sequential', 'Momentum-driven'],
  effect: ['Collision-motion', 'Impact-motion', 'Aftershock-motion'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Scale'],
  description: 'A bookshop search where filter chips pile into the bar. Pick a suggested filter and it skids in from the right end of the bar until it hits the last chip in the row; the impact squashes both and passes down the line, each chip shoved a little and springing back, the shove getting smaller as it travels. Remove a chip and the ones after it roll back to close the gap.',
  params: [
    { key: 'speed', label: 'Slide time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.4, live: true },
    { key: 'hit', label: 'Impact', group: 'Motion', type: 'range', min: 0.1, max: 1.2, step: 0.05, unit: 'em', default: 0.5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Filter'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('bmp');
    k.html(`
      <div class="sp sp-fi sp-bmp">
        <div class="sp-fi__wrap">
          <div class="sp-fi__box sp-bmp__bar" role="search"><span class="sp-bmp__row" aria-label="Active filters"></span><input class="sp-fi__input" id="${id}" type="search" placeholder="Search books" aria-label="Search books" /></div>
          <div class="sp-bmp__suggest">${SUGGEST.map((s) => `<button type="button" class="sp-bmp__s">+ ${esc(s)}</button>`).join('')}</div>
        </div>
      </div>`);
    const bar = k.$('.sp-bmp__bar');
    const row = k.$('.sp-bmp__row');
    const sugg = k.$('.sp-bmp__suggest');
    // FLIP helper: remember where chips are, change the DOM, slide each from old to new position
    const flip = (change) => {
      const before = new Map([...row.children].map((c) => [c, c.offsetLeft]));
      change();
      if (reducedMotion) return;
      [...row.children].forEach((c) => before.has(c) && gsap.fromTo(c, { x: before.get(c) - c.offsetLeft }, { x: 0, duration: 0.35, ease: 'power2.out' }));
    };
    const add = (btn) => {
      const name = btn.textContent.slice(2);
      btn.hidden = true;
      row.insertAdjacentHTML('beforeend', `<button type="button" class="sp-fi__chip sp-bmp__chip" aria-label="Remove ${esc(name)}">${esc(name)} ✕</button>`);
      const chip = row.lastElementChild;
      chip.dataset.from = SUGGEST.indexOf(name);
      bar.querySelector('input').focus();
      if (reducedMotion) return;
      const others = [...row.children].slice(0, -1).reverse(); // nearest first
      const dist = bar.offsetWidth - chip.offsetLeft;
      gsap.timeline()
        .fromTo(chip, { x: dist }, { x: 0, duration: p.speed, ease: 'power2.in' })
        .to(chip, { keyframes: { scaleX: [0.8, 1.05, 1], x: [`${p.hit * 0.3}em`, 0] }, duration: 0.35, transformOrigin: '0% 50%' });
      // The shove travels down the line, weaker with each chip
      others.forEach((o, i) => gsap.timeline({ delay: p.speed + i * 0.05 })
        .to(o, { x: `-${p.hit * Math.pow(0.65, i)}em`, scaleX: 0.92, duration: 0.07, ease: 'power2.out', transformOrigin: '100% 50%' })
        .to(o, { x: 0, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }));
    };
    k.on(sugg, 'click', (e) => { const b = e.target.closest('.sp-bmp__s'); if (b) add(b); });
    k.on(row, 'click', (e) => {
      const c = e.target.closest('.sp-bmp__chip');
      if (!c) return;
      sugg.children[c.dataset.from].hidden = false;
      flip(() => c.remove());
      bar.querySelector('input').focus();
    });
    return () => k.destroy();
  },
};
