/** Wave Skeleton: a loading table skeleton where a wave travels across the placeholder bars: each bar rises and dips a moment after its left neighbour, so a smooth swell rolls along the rows until the data lands. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wave Skeleton',
  element: 'Skeleton',
  trigger: ['Load', 'Click'],
  behavior: ['Load-dependent', 'Staggered', 'Looping'],
  effect: ['Traveling-wave', 'Wave-propagation', 'Bobbing'],
  purpose: ['Progress', 'Continuity'],
  properties: ['Scale', 'Position', 'Opacity'],
  description: 'A loading state for a table of invoices. Each row\'s grey cells ride a travelling wave: a cell swells taller and lighter and sinks back, its right-hand neighbour doing the same a beat later, and each row slightly behind the one above, so a diagonal swell keeps rolling across the skeleton from left to right. When the data arrives the wave settles flat and the real rows fade in.',
  params: [
    { key: 'speed', label: 'Wave time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'load', label: 'Load time', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Crest'),
  ],
};

const ROWS = [['INV-301', 'Jun 2', '£420'], ['INV-302', 'Jun 9', '£1,180'], ['INV-303', 'Jun 14', '£86'], ['INV-304', 'Jun 21', '£640']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-wvs">
        <div class="sp-df__card sp-wvs__card" aria-busy="true">
          <table class="sp-wvs__real"><thead><tr><th>Invoice</th><th>Date</th><th>Total</th></tr></thead><tbody>${ROWS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
          <div class="sp-wvs__skel" aria-hidden="true">${ROWS.map(() => `<div class="sp-wvs__row">${'<span class="sp-df__bone"></span>'.repeat(3)}</div>`).join('')}</div>
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost">Reload</button>
      </div>`);
    const card = k.$('.sp-wvs__card');
    const skel = k.$('.sp-wvs__skel');
    const real = k.$('.sp-wvs__real');
    const bones = k.$$('.sp-wvs__skel .sp-df__bone');
    let wave, done;
    const load = () => {
      wave?.kill(); done?.kill();
      card.setAttribute('aria-busy', 'true');
      gsap.set(skel, { autoAlpha: 1 });
      gsap.set(real, { autoAlpha: 0 });
      gsap.set(bones, { clearProps: 'transform,opacity,backgroundColor' }); // start each load from flat grey
      // phase delay = column + row: a diagonal crest rolling right (repeat + yoyo per bone, offset start)
      if (!reducedMotion) wave = gsap.timeline().to(bones, { scaleY: 1.9, opacity: 0.55, backgroundColor: 'rgba(47,74,107,0.35)', duration: p.speed / 2, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: { each: p.speed / 10, grid: [ROWS.length, 3], from: 'start', axis: null } });
      done = gsap.delayedCall(p.load, () => {
        wave?.kill();
        card.setAttribute('aria-busy', 'false');
        gsap.to(bones, { scaleY: 1, opacity: 1, duration: 0.2 });
        gsap.to(skel, { autoAlpha: 0, duration: reducedMotion ? 0 : 0.4 });
        gsap.to(real, { autoAlpha: 1, duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 });
      });
    };
    load();
    k.on(k.$('.sp-df__btn'), 'click', load);
    return () => { wave?.kill(); done?.kill(); k.destroy(); };
  },
};
