/** Assemble Card: a content card built from plain shapes (rectangles, a circle, triangles, a pill) that fly in and lock together, then the words write over them. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Assemble Card',
  element: 'Content card',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Sequential', 'Randomized'],
  effect: ['Shape-assembly', 'Spinning', 'Convergence', 'Overshoot-motion'],
  purpose: ['Storytelling', 'Delight', 'Hierarchy'],
  properties: ['Shape', 'Position', 'Rotation', 'Scale'],
  description: 'A content card that builds itself when it scrolls into view. Its parts start as loose shapes (a sheet, a photo block, a sun, two mountains, text bars and a pill) that spin in from all sides and lock into place, then the real words fade in over the bars.',
  params: [
    { key: 'scatter', label: 'Scatter', group: 'Layout', type: 'range', min: 4, max: 16, step: 1, unit: 'em', default: 10 },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0.03, max: 0.25, step: 0.01, unit: 's', default: 0.09 },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

// [class, left, top, width, height] in em
const PARTS = [
  ['base', 0, 0, 15, 16],
  ['photo', 1, 1, 13, 6.5],
  ['sun', 9.6, 1.8, 1.9, 1.9],
  ['peak', 1.6, 3.4, 6.5, 4.1],
  ['peak peak--b', 5.6, 4.5, 6.4, 3],
  ['bar bar--title', 1, 8.6, 9, 1.3],
  ['bar', 1, 10.6, 12.5, 0.6],
  ['bar', 1, 11.6, 9.5, 0.6],
  ['pill', 1, 13.1, 5.8, 1.9],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-asm">
        <article class="sp-asm__box" aria-label="Paper Peaks: a weekend walk through folded hills">
          ${PARTS.map(([c, x, y, w, h]) => `<i class="sp-asm__part ${c.split(' ').map((s) => `sp-asm__${s.replace('--', '-')}`).join(' ')}" style="left:${x}em;top:${y}em;width:${w}em;height:${h}em"></i>`).join('')}
          <span class="sp-asm__word" style="left:1em;top:8.4em"><b class="sp-cc__title">Paper Peaks</b></span>
          <span class="sp-asm__word" style="left:1em;top:10.3em;width:13em"><span class="sp-cc__text">A weekend walk through folded hills, three huts and one long view.</span></span>
          <span class="sp-asm__word sp-asm__go" style="left:1em;top:13.1em;width:5.8em">Read</span>
        </article>
        <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-asm__btn">Rebuild</button>
      </div>`);
    const box = k.$('.sp-asm__box');
    const parts = k.$$('.sp-asm__part');
    const words = k.$$('.sp-asm__word');
    const bars = k.$$('.sp-asm__bar');
    k.fit(box, 0.78);
    let tl;

    const build = () => {
      tl?.kill();
      const r = () => (Math.random() - 0.5) * 2;
      gsap.set(parts, { x: () => `${r() * p.scatter}em`, y: () => `${r() * p.scatter * 0.7}em`, rotation: () => r() * 200, scale: 0.4, autoAlpha: 0 });
      gsap.set(words, { autoAlpha: 0, y: '0.4em' });
      gsap.set(bars, { autoAlpha: 1 });
      tl = gsap.timeline()
        .to(parts, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)', stagger: p.stagger })
        .to(bars, { autoAlpha: 0, duration: 0.3, stagger: 0.08 }, '-=0.1')
        .to(words, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, '<');
      if (reducedMotion) tl.progress(1);
    };

    gsap.set(parts, { autoAlpha: 0 });
    gsap.set(words, { autoAlpha: 0 });
    k.inView(box, () => !tl && build(), 0.3);
    k.on(k.$('.sp-asm__btn'), 'click', build);

    return () => { tl?.kill(); k.destroy(); };
  },
};
