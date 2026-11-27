/** Sweep Sidebar: picking a section sweeps the highlight across like a broom: the old one is swept off to the side as the new one is swept in, its bristle edge leading. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Sweep Sidebar',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Selection-dependent', 'Direction-aware', 'Coordinated'],
  effect: ['Sweeping', 'Sliding'],
  purpose: ['Navigation', 'Wayfinding', 'Feedback'],
  properties: ['Clip & mask', 'Position', 'Color'],
  description: 'A sidebar whose highlight moves like a broom. Pick a section: the old highlight is swept out to the right while the new one is swept in from the left behind a ragged bristle edge, and the page title follows. Hovering an item brushes a faint stroke across it.',
  params: [
    { key: 'time', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    { key: 'ragged', label: 'Bristle edge', group: 'Shape', type: 'range', min: 0, max: 20, step: 2, unit: '%', default: 12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Highlight'),
  ],
};

const ITEMS = ['Today', 'Upcoming', 'Projects', 'Notes', 'Archive'];

/** A clip that shows the item from `a`% to `b`% across, with a ragged (bristle) leading edge. */
const sweep = (a, b, rag) => {
  const edge = (x, dir) => Array.from({ length: 7 }, (_, i) => [x + dir * (i % 2 ? rag : 0) * (b - a > 0 ? 1 : 0), (i / 6) * 100]);
  const pts = [[a, 0], ...edge(b, 1), [a, 100]];
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',')})`;
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-swp">
        <nav class="sp-swp__side" aria-label="Sections">
          <span class="sp-pn__kick">Planner</span>
          ${ITEMS.map((t, i) => `<button type="button" class="sp-swp__item" aria-current="${i ? 'false' : 'page'}"><i class="sp-swp__fill"></i><i class="sp-swp__brush"></i><span>${t}</span></button>`).join('')}
        </nav>
        <div class="sp-pn__page sp-swp__page"><span class="sp-pn__kick">Section</span><b class="sp-pn__h sp-swp__title">Today</b>${bars(6)}</div>
      </div>`);
    const items = k.$$('.sp-swp__item');
    const fills = k.$$('.sp-swp__fill');
    const brushes = k.$$('.sp-swp__brush');
    const title = k.$('.sp-swp__title');
    const s = fills.map((_, i) => k.track({ a: 0, b: i ? 0 : 100 }));
    const draw = (i) => (fills[i].style.clipPath = sweep(s[i].a, s[i].b, p.ragged));
    fills.forEach((_, i) => draw(i));
    let cur = 0;

    items.forEach((it, i) => {
      k.on(it, 'click', () => {
        if (i === cur) return;
        const t = reducedMotion ? 0 : p.time;
        const old = cur;
        cur = i;
        items.forEach((x, j) => x.setAttribute('aria-current', j === i ? 'page' : 'false'));
        // Old highlight: its back edge is swept across and off; new one: swept in from the left.
        gsap.fromTo(s[old], { a: 0 }, { a: 100, duration: t, ease: 'power2.in', onUpdate: () => draw(old), onComplete: () => (s[old].b = 0, s[old].a = 0, draw(old)) });
        gsap.fromTo(s[i], { a: 0, b: 0 }, { b: 100, duration: t, delay: t * 0.3, ease: 'power3.out', onUpdate: () => draw(i) });
        gsap.timeline()
          .to(title, { x: '1em', autoAlpha: 0, duration: t * 0.4, ease: 'power2.in' })
          .add(() => (title.textContent = ITEMS[i]))
          .fromTo(title, { x: '-1em' }, { x: 0, autoAlpha: 1, duration: t * 0.6, ease: 'power3.out' });
      });
      // A light brush stroke on hover
      k.on(it, 'pointerenter', () => !reducedMotion && i !== cur && gsap.fromTo(brushes[i], { scaleX: 0, autoAlpha: 0.5 }, { scaleX: 1, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }));
    });

    return () => k.destroy();
  },
};
