/** Crack Hero: a 404 hero that fractures: a crack races down through the "404", branches spread, and the two halves shift apart a hair. "Patch it up" draws the cracks back in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { seeded } from '../cards-containers/_shape.js';

export const meta = {
  title: 'Crack Hero',
  element: 'Hero section',
  trigger: ['Load', 'Click', 'Keyboard'],
  behavior: ['Sequential', 'Event-driven', 'Reversible', 'Procedural'],
  effect: ['Fracturing', 'Splitting', 'Shaking'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Clip & mask', 'Path', 'Position', 'Rotation'],
  description: 'A "page not found" hero that is broken in more ways than one. On arrival a crack races down through the big 404 with a jolt, side cracks branch off it, and the two halves of the page shift apart a hair. "Patch it up" draws the cracks back in and the halves close.',
  params: [
    { key: 'shift', label: 'Split', group: 'Shape', type: 'range', min: 0, max: 1.2, step: 0.1, unit: 'em', default: 0.4, live: true },
    { key: 'branches', label: 'Branches', group: 'Shape', type: 'range', min: 0, max: 8, step: 1, unit: '', default: 5 },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(29);
    // The main crack: top to bottom, zig-zagging a little either side of the middle.
    const main = Array.from({ length: 9 }, (_, i) => [52 + (i && i < 8 ? (r() - 0.5) * 14 : 0), (i * 100) / 8]);
    const branch = Array.from({ length: Math.round(p.branches) }, (_, i) => {
      const [x, y] = main[1 + (i % 7)];
      const dir = i % 2 ? 1 : -1;
      let [bx, by] = [x, y];
      const pts = [[bx, by]];
      for (let s = 0; s < 4; s++) pts.push([(bx += dir * (4 + r() * 6)), (by += (r() - 0.3) * 8)]);
      return pts;
    });
    const path = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
    const hero = `<div class="sp-crk__hero"><span class="sp-pn__kick">Error</span><b class="sp-crk__big">404</b><span class="sp-crk__text">This page fell apart. Let’s get you home.</span><span class="sp-pn__btn">Home</span></div>`;
    k.html(`
      <div class="sp sp-pn sp-crk">
        ${hero}
        <div class="sp-cc__pieces"></div>
        <svg class="sp-crk__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path class="sp-crk__main" d="${path(main)}" pathLength="1" />
          ${branch.map((b) => `<path class="sp-crk__branch" d="${path(b)}" pathLength="1" />`).join('')}
        </svg>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-crk__btn">Break it</button>
      </div>`);
    const real = k.$('.sp-crk > .sp-crk__hero');
    const host = k.$('.sp-cc__pieces');
    const lines = k.$$('.sp-crk__svg path');
    const btn = k.$('.sp-crk__btn');
    const [left, right] = pieces(host, hero, [[[0, 0], ...main, [0, 100]], [...main, [100, 100], [100, 0]]]).map((b) => b.el);
    gsap.set(host, { autoAlpha: 0 });
    gsap.set(lines, { strokeDasharray: '1 2', strokeDashoffset: 1, autoAlpha: 0 });
    let broken = false;
    let tl;

    const crack = () => {
      broken = true;
      btn.textContent = 'Patch it up';
      tl?.kill();
      tl = gsap.timeline()
        .set(host, { autoAlpha: 1 })
        .set(real, { autoAlpha: 0 })
        .to(lines[0], { strokeDashoffset: 0, autoAlpha: 1, duration: 0.35, ease: 'power4.out' })
        .to(stage.firstElementChild, { keyframes: { x: [-5, 5, -3, 2, 0] }, duration: 0.3, ease: 'none' }, '<0.1')
        .to(lines.slice(1), { strokeDashoffset: 0, autoAlpha: 1, duration: 0.3, stagger: 0.06, ease: 'power3.out' }, '<0.1')
        .to(left, { x: `${-p.shift}em`, rotation: -0.6, duration: 0.5, ease: 'back.out(3)' }, '<')
        .to(right, { x: `${p.shift}em`, y: `${p.shift * 0.4}em`, rotation: 0.5, duration: 0.5, ease: 'back.out(3)' }, '<');
      if (reducedMotion) tl.progress(1);
    };
    const mend = () => {
      broken = false;
      btn.textContent = 'Break it again';
      tl?.kill();
      tl = gsap.timeline()
        .to([left, right], { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'power3.inOut' })
        .to(lines.slice().reverse(), { strokeDashoffset: 1, duration: 0.3, stagger: 0.04, ease: 'power2.in' }, '<')
        .set(lines, { autoAlpha: 0 })
        .set(real, { autoAlpha: 1 })
        .set(host, { autoAlpha: 0 });
      if (reducedMotion) tl.progress(1);
    };
    k.on(btn, 'click', () => (broken ? mend() : crack()));
    k.inView(stage, () => !tl && gsap.delayedCall(0.5, crack), 0.6);

    return () => { tl?.kill(); k.destroy(); };
  },
};
