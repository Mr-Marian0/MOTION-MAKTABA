/**Gooey Pagination: an ink drop stretches to the next page and squashes. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Gooey Pagination',
  element: 'Pagination',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Snapping', 'Discrete', 'Keyboard-controlled'],
  effect: ['Stretching', 'Squashing', 'Metaball-morphing'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Position', 'Shape', 'Size'],
  description: 'The page marker is a drop of ink. It stretches toward the next page and squashes when it lands, and a trailing drop pulls away from it like goo.',
  params: [
    { key: 'pages', label: 'Pages', group: 'Content', type: 'range', min: 3, max: 10, step: 1, default: 6 },
    { key: 'gooey', label: 'Gooey trail', group: 'Appearance', type: 'toggle', default: true },
    tone('#111111'),
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.4, step: 0.05, unit: 's', default: 0.6, live: true },
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const n = Number(p.pages) || 6;
    const id = uid('goo');
    k.html(`
      <div class="sp sp-pages">
        <svg width="0" height="0" aria-hidden="true" style="position:absolute">
          <filter id="${id}">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </svg>
        <nav class="sp-pages__nav" aria-label="Pagination">
          <button class="sp-pages__step" type="button" data-step="-1" aria-label="Previous page">‹</button>
          <div class="sp-pages__rail">
            <div class="sp-pages__goo" style="${p.gooey ? `filter:url(#${id})` : ''}" aria-hidden="true">
              <i class="sp-pages__drop sp-pages__drop--trail"></i>
              <i class="sp-pages__drop"></i>
            </div>
            <ol class="sp-pages__list">
              ${Array.from({ length: n }, (_, i) => `<li><button type="button" data-i="${i}" ${i ? '' : 'aria-current="page"'}>${i + 1}</button></li>`).join('')}
            </ol>
          </div>
          <button class="sp-pages__step" type="button" data-step="1" aria-label="Next page">›</button>
        </nav>
        <p class="sp-note">Click a page · or focus it and use ← →</p>
      </div>`);

    const nav = k.$('.sp-pages__nav');
    const drop = k.$('.sp-pages__drop:not(.sp-pages__drop--trail)');
    const trail = k.$('.sp-pages__drop--trail');
    const btns = k.$$('.sp-pages__list button');
    let at = 0;

    const xOf = (i) => btns[i].offsetLeft; // relative to the (positioned) rail
    const place = () => gsap.set([drop, trail], { x: xOf(at) });
    k.resize(k.$('.sp-pages__list'), place);

    const go = (i) => {
      i = (i + n) % n;
      if (i === at) return;
      const dist = Math.abs(xOf(i) - xOf(at));
      const dir = Math.sign(xOf(i) - xOf(at));
      const d = Number(p.speed);
      at = i;
      btns.forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
      gsap.killTweensOf([drop, trail]);
      const size = drop.offsetWidth || 1;
      // Lead drop: stretch toward the target, land, squash, recover.
      gsap
        .timeline()
        .to(drop, { x: xOf(i), scaleX: 1 + Math.min(dist / size, 3) * 0.35, scaleY: 0.8, transformOrigin: dir > 0 ? 'left center' : 'right center', duration: d * 0.55, ease: 'power3.inOut' })
        .to(drop, { scaleX: 0.8, scaleY: 1.15, transformOrigin: 'center center', duration: d * 0.2, ease: 'power2.out' })
        .to(drop, { scaleX: 1, scaleY: 1, duration: d * 0.6, ease: 'elastic.out(1, 0.4)' });
      // Trailing drop lags behind and gets pulled along: the goo.
      gsap.to(trail, { x: xOf(i), duration: d * 1.15, ease: 'power3.inOut', delay: d * 0.08 });
    };

    btns.forEach((b, i) => k.on(b, 'click', () => go(i)));
    k.$$('[data-step]').forEach((b) => k.on(b, 'click', () => go(at + Number(b.dataset.step))));
    k.on(nav, 'keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      go(at + (e.key === 'ArrowRight' ? 1 : -1));
      btns[at].focus();
    });

    return () => k.destroy();
  },
};
