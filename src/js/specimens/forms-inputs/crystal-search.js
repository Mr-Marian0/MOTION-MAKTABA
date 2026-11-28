/** Crystal Search: suggestions crystallise as you type: each result grows out of a single seed point into a faceted shard that squares off into a row, with a glint along its edge. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

const DATA = ['Amethyst', 'Aquamarine', 'Agate', 'Beryl', 'Citrine', 'Garnet', 'Jade', 'Opal', 'Peridot', 'Quartz', 'Ruby', 'Sapphire', 'Topaz', 'Tourmaline'];

export const meta = {
  title: 'Crystal Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['State-dependent', 'Staggered', 'Reactive'],
  effect: ['Crystallization', 'Expansion', 'Shimmering'],
  purpose: ['Feedback', 'Delight', 'Hierarchy'],
  properties: ['Clip & mask', 'Shape', 'Color'],
  description: 'A gemstone search whose suggestions grow like crystals. Each time the matches change, every result starts as a tiny seed at its left end and grows into a faceted, many-sided shard, the facets flattening out until it is a clean row. A glint then runs along it. The top match grows first.',
  params: [
    { key: 'time', label: 'Growth time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.55, live: true },
    { key: 'facet', label: 'Facet depth', group: 'Shape', type: 'range', min: 0, max: 40, step: 2, unit: '%', default: 22, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Gem'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('cry');
    k.html(`
      <div class="sp sp-fi sp-cry">
        <div class="sp-fi__wrap">
          <div class="sp-fi__box" role="search">
            <i class="sp-fi__icon" aria-hidden="true">◇</i>
            <input class="sp-fi__input" id="${id}" type="search" placeholder="Search gemstones" aria-label="Search gemstones" aria-controls="${id}-r" value="a" />
          </div>
          <ul class="sp-cry__list" id="${id}-r" aria-live="polite"></ul>
        </div>
      </div>`);
    const input = k.$('.sp-fi__input');
    const list = k.$('.sp-cry__list');
    // A row's shape: seed at the left (grow 0) → faceted shard → flat rectangle (grow 1, facets 0)
    const shard = (g, f) => {
      const w = g * 100;
      const d = f * p.facet;
      return `polygon(0 50%, ${Math.min(w, d * 0.6)}% 0, ${Math.max(0, w - d)}% 0, ${w}% ${30 * f}%, ${w}% ${100 - 30 * f}%, ${Math.max(0, w - d)}% 100%, ${Math.min(w, d * 0.6)}% 100%)`;
    };
    const show = () => {
      const q = input.value.trim().toLowerCase();
      const hits = q ? DATA.filter((d) => d.toLowerCase().includes(q)).slice(0, 4) : [];
      list.innerHTML = hits.map((h) => `<li class="sp-cry__row"><span>${esc(h)}</span><i class="sp-cry__glint" aria-hidden="true"></i></li>`).join('') || (q ? '<li class="sp-cry__none">No stones match</li>' : '');
      if (reducedMotion) return;
      [...list.querySelectorAll('.sp-cry__row')].forEach((row, i) => {
        const s = { g: 0.02, f: 1 };
        gsap.timeline({ delay: i * p.time * 0.25, onUpdate: () => (row.style.clipPath = shard(s.g, s.f)), onComplete: () => (row.style.clipPath = '') })
          .set(row, { clipPath: shard(0.02, 1) })
          .to(s, { g: 1, duration: p.time, ease: 'power2.out' })
          .to(s, { f: 0, duration: p.time * 0.5, ease: 'power1.inOut' }, `-=${p.time * 0.3}`)
          .fromTo(row.querySelector('.sp-cry__glint'), { xPercent: -100, autoAlpha: 1 }, { xPercent: 260, autoAlpha: 0, duration: 0.5, ease: 'power1.in' });
      });
    };
    k.on(input, 'input', show);
    show();
    return () => k.destroy();
  },
};
