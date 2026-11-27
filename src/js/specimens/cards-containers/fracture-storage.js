/** Fracture Storage: a storage widget that cracks a little more each time it passes a warning level, and mends when you free up space. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from './_shape.js';

export const meta = {
  title: 'Fracture Storage',
  element: 'Widget',
  trigger: ['Click', 'State change'],
  behavior: ['State-dependent', 'Conditional', 'Event-driven', 'Reversible'],
  effect: ['Fracturing', 'Shaking', 'Dropping'],
  purpose: ['Feedback', 'Progress', 'Hierarchy'],
  properties: ['Path', 'Size', 'Color'],
  description: 'A storage widget under strain. Each time it fills past 60, 80 and 95 percent a new crack races across the card with a jolt, and a chip drops off. Freeing up space draws the cracks back in.',
  params: [
    { key: 'step', label: 'Each add', group: 'Behavior', type: 'range', min: 6, max: 20, step: 1, unit: '%', default: 12, live: true },
    { key: 'jolt', label: 'Jolt', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 0.6, live: true },
    { key: 'width', label: 'Crack width', group: 'Shape', type: 'range', min: 1, max: 4, step: 0.5, unit: 'px', default: 2, css: '--crack' },
    tone('#b3412e'),
  ],
};

const LEVELS = [60, 80, 95];
const START = 36;

/** A jagged crack from a point on the edge toward the middle, with one side branch. */
function crack(r, side) {
  const starts = [[0, 20 + r() * 50], [20 + r() * 60, 0], [100, 25 + r() * 50]];
  let [x, y] = starts[side];
  let a = Math.atan2(55 - y, 50 - x);
  const main = [[x, y]];
  for (let i = 0; i < 7; i++) {
    a += (r() - 0.5) * 1.1;
    x += Math.cos(a) * (7 + r() * 7);
    y += Math.sin(a) * (7 + r() * 7);
    main.push([clamp(x, 0, 100), clamp(y, 0, 100)]);
  }
  let [bx, by] = main[3];
  let b = a + (r() < 0.5 ? 1 : -1) * 0.9;
  const branch = [[bx, by]];
  for (let i = 0; i < 3; i++) branch.push([(bx += Math.cos(b) * 8), (by += Math.sin((b += (r() - 0.5) * 0.8)) * 8)]);
  const d = (pts) => `M${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L')}`;
  return { d: `${d(main)} ${d(branch)}`, at: main[0] };
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(11);
    const cracks = [0, 1, 2].map((side) => crack(r, side));
    k.html(`
      <div class="sp sp-cc sp-frac">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-frac__card">
            <span class="sp-cc__kick">Storage</span>
            <b class="sp-cc__big" aria-live="polite"><span class="sp-frac__pct"></span>%</b>
            <i class="sp-frac__bar"><i class="sp-frac__fill"></i></i>
            <span class="sp-cc__text sp-frac__gb"></span>
            <div class="sp-cc__btns sp-frac__btns">
              <button type="button" class="sp-cc__btn sp-frac__add">Add files</button>
              <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-frac__free">Free up</button>
            </div>
            <svg class="sp-frac__cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${cracks.map((c) => `<path class="sp-frac__lit" d="${c.d}" pathLength="1" /><path class="sp-frac__line" d="${c.d}" pathLength="1" />`).join('')}
            </svg>
          </article>
          ${cracks.map((c) => `<i class="sp-frac__chip" style="left:${c.at[0]}%;top:${c.at[1]}%"></i>`).join('')}
        </div>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-frac__card');
    const fill = k.$('.sp-frac__fill');
    const pct = k.$('.sp-frac__pct');
    const gb = k.$('.sp-frac__gb');
    const lines = k.$$('.sp-frac__cracks path');
    const chips = k.$$('.sp-frac__chip');
    k.fit(wrap, 0.86);
    const d = (t) => (reducedMotion ? 0 : t);
    const shown = { v: START };
    k.track(shown);
    let used = START;
    let broken = 0;

    // Hidden outright until drawn: a fully dash-offset path can still leave a sliver showing.
    gsap.set(lines, { strokeDasharray: '1 2', strokeDashoffset: 1, autoAlpha: 0 });
    gsap.set(chips, { autoAlpha: 0 });
    const paint = () => {
      pct.textContent = Math.round(shown.v);
      gb.textContent = `${Math.round(shown.v / 2)} of 50 GB used`;
      fill.style.width = `${shown.v}%`;
      card.style.setProperty('--hot', clamp((shown.v - 50) / 50, 0, 1));
    };
    paint();

    const setUsed = (v) => {
      used = clamp(v, 0, 100);
      gsap.to(shown, { v: used, duration: d(0.6), ease: 'power2.out', onUpdate: paint });
      const want = LEVELS.filter((l) => used >= l).length;
      for (let i = broken; i < want; i++) {
        const delay = d(0.25 + (i - broken) * 0.35);
        // The crack races in, the card jolts, and a chip of the edge falls off
        gsap.to(lines.slice(i * 2, i * 2 + 2), { strokeDashoffset: 0, autoAlpha: 1, duration: d(0.35), ease: 'power4.out', delay });
        gsap.fromTo(card, { x: 0, rotation: 0 }, { keyframes: { x: [-4, 4, -2, 0].map((n) => n * p.jolt), rotation: [-1, 1, 0].map((n) => n * p.jolt) }, duration: d(0.3), delay });
        gsap.fromTo(chips[i], { autoAlpha: 1, x: 0, y: 0, rotation: 0 }, { y: '6em', x: `${(i - 1) * 1.2}em`, rotation: 160, duration: d(0.9), ease: 'power2.in', delay });
        gsap.to(chips[i], { autoAlpha: 0, duration: d(0.2), delay: delay + d(0.7) });
      }
      // Freeing space mends the cracks, newest first
      for (let i = broken - 1; i >= want; i--) {
        gsap.to(lines.slice(i * 2, i * 2 + 2), { strokeDashoffset: 1, duration: d(0.6), ease: 'power2.inOut', delay: d((broken - 1 - i) * 0.2), onComplete() { gsap.set(this.targets(), { autoAlpha: 0 }); } });
      }
      broken = want;
    };

    k.on(k.$('.sp-frac__add'), 'click', () => setUsed(used + Number(p.step)));
    k.on(k.$('.sp-frac__free'), 'click', () => setUsed(24));

    return () => k.destroy();
  },
};
