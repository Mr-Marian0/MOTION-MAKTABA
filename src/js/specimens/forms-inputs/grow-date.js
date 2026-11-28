/** Grow Date: the day you pick sprouts: a procedurally generated sprig grows out of the cell, branching and forking by rule, different every time, while the old one withers away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Grow Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Procedural', 'Randomized', 'Recursive'],
  effect: ['Procedural-motion', 'Generative-motion', 'Fractal-motion'],
  purpose: ['Delight', 'Feedback', 'Storytelling'],
  properties: ['Path', 'Opacity'],
  description: 'A garden-club calendar where your date blossoms. Pick a day and a little sprig grows out of the top of its cell: a stem draws itself upward, then forks, and each fork forks again by the same rule with random angles and lengths, finishing in tiny leaves, so no two sprigs are alike. The sprig on the previous date withers back down as the new one grows.',
  params: [
    { key: 'depth', label: 'Branching', group: 'Shape', type: 'range', min: 2, max: 5, step: 1, unit: '', default: 4 },
    { key: 'time', label: 'Growth time', group: 'Motion', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Leaf'),
  ],
};

/** Recursive sprig: each segment forks into two shorter ones at random angles. Returns [{ d, level }]. */
function sprig(depth) {
  const segs = [];
  const grow = (x, y, ang, len, lvl) => {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    segs.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, lvl, tip: [x2, y2] });
    if (lvl >= depth) return;
    const spread = 0.35 + Math.random() * 0.4;
    grow(x2, y2, ang - spread, len * (0.62 + Math.random() * 0.15), lvl + 1);
    grow(x2, y2, ang + spread, len * (0.62 + Math.random() * 0.15), lvl + 1);
  };
  grow(0, 0, -Math.PI / 2 + (Math.random() - 0.5) * 0.3, 11, 1);
  return segs;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const depth = Math.round(p.depth);
    k.html(`
      <div class="sp sp-fi sp-grw">
        <div class="sp-fi__cal sp-grw__cal">
          <b class="sp-fi__month">${MONTHS[10]} 2026 · plant day</b>
          <div class="sp-grw__grid">${days(2026, 10)}</div>
        </div>
      </div>`);
    const cal = k.$('.sp-grw__cal');
    const grid = k.$('.sp-grw__grid');
    k.fit(cal);
    let current = null;
    const wither = (svg) => {
      if (!svg) return;
      if (reducedMotion) return svg.remove();
      gsap.to(svg.querySelectorAll('path, circle'), { strokeDashoffset: 1, scale: 0, duration: 0.5, ease: 'power2.in', stagger: { each: 0.01, from: 'end' }, onComplete: () => svg.remove() });
    };
    dayKeys(k, grid, (b) => {
      pickDay(grid, b);
      wither(current);
      const segs = sprig(depth);
      b.insertAdjacentHTML('beforeend', `<svg class="sp-grw__sprig" viewBox="-30 -40 60 42" aria-hidden="true">${segs.map((s) => `<path d="${s.d}" pathLength="1" style="stroke-width:${(depth + 1 - s.lvl) * 0.5 + 0.4}px" />`).join('')}${segs.filter((s) => s.lvl === depth).map((s) => `<circle cx="${s.tip[0].toFixed(1)}" cy="${s.tip[1].toFixed(1)}" r="1.6" />`).join('')}</svg>`);
      current = b.querySelector('.sp-grw__sprig');
      const paths = [...current.querySelectorAll('path')];
      const leaves = [...current.querySelectorAll('circle')];
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(leaves, { scale: 0, transformOrigin: '50% 50%' });
      if (reducedMotion) { gsap.set(paths, { strokeDashoffset: 0 }); gsap.set(leaves, { scale: 1 }); return; }
      // Each level grows after the one below it: the sprig unfolds generation by generation
      const step = p.time / (depth + 1);
      const tl = gsap.timeline();
      paths.forEach((pa, i) => tl.to(pa, { strokeDashoffset: 0, duration: step, ease: 'power1.out' }, (segs[i].lvl - 1) * step));
      tl.to(leaves, { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.02 }, depth * step);
    });
    return () => k.destroy();
  },
};
