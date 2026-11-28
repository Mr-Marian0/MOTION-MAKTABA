/** Pixel Upload: a chosen image resolves into the preview pixel by pixel: a grid of blank cells winks out in random order to reveal it; removing it dissolves the picture back into blank pixels. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pickFiles } from './_fi.js';

export const meta = {
  title: 'Pixel Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Randomized', 'Reversible'],
  effect: ['Pixel-dissolving', 'Dissolving', 'Shape-assembly'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Opacity', 'Clip & mask'],
  description: 'A cover-image upload whose preview arrives like an old screen drawing a picture. Choose an image and the preview box, made of a grid of blank pixels, reveals it cell by cell in random order (each pixel simply switching off, no fades) until the picture is whole. "Remove" dissolves it the same way back into blank pixels.',
  params: [
    { key: 'cell', label: 'Pixel size', group: 'Shape', type: 'range', min: 0.6, max: 2, step: 0.1, unit: 'em', default: 1 },
    { key: 'time', label: 'Dissolve time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

const PICS = [['#f4dcb5', '#e6b083', '#b3412e'], ['#cfe0ea', '#6f97b3', '#2f4a6b'], ['#dfe6cf', '#8ea36b', '#3e5a2f']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    // 16em × 9em preview, square cells of the chosen size
    const [cols, rows] = [Math.round(16 / p.cell), Math.round(9 / p.cell)];
    k.html(`
      <div class="sp sp-fi sp-pxu">
        <div class="sp-fi__wrap sp-pxu__wrap">
          <div class="sp-fi__drop sp-pxu__drop" role="button" tabindex="0" aria-label="Choose a cover image">
            <span class="sp-pxu__pic" role="img" aria-label="No cover yet"></span>
            <span class="sp-pxu__cells" aria-hidden="true" style="grid-template-columns:repeat(${cols},1fr)">${'<i></i>'.repeat(cols * rows)}</span>
            <b class="sp-pxu__hint">Choose a cover</b>
          </div>
          <button type="button" class="sp-fi__btn sp-fi__btn--ghost sp-pxu__rm" hidden>Remove</button>
        </div>
      </div>`);
    const drop = k.$('.sp-pxu__drop');
    const pic = k.$('.sp-pxu__pic');
    const cells = k.$$('.sp-pxu__cells i');
    const hint = k.$('.sp-pxu__hint');
    const rm = k.$('.sp-pxu__rm');
    let n = 0, tl;
    const paint = ([a, b, c]) => pic.style.setProperty('background', `radial-gradient(circle at 72% 32%, ${c} 0 11%, transparent 11.5%), radial-gradient(ellipse 75% 45% at 28% 100%, ${b} 98%, transparent), linear-gradient(${a}, ${b})`);
    // Pixels are on/off only: autoAlpha with a near-zero duration, staggered in random order
    const dissolve = (show, done) => {
      tl?.kill();
      tl = gsap.timeline({ onComplete: done }).to(cells, { autoAlpha: show ? 0 : 1, duration: 0.001, stagger: { amount: reducedMotion ? 0 : p.time, from: 'random' } });
      if (reducedMotion) tl.progress(1);
    };
    pickFiles(k, drop, ([name]) => {
      paint(PICS[n++ % PICS.length]);
      pic.setAttribute('aria-label', `Cover: ${name}`);
      hint.hidden = true;
      gsap.set(cells, { autoAlpha: 1 });
      dissolve(true, () => (rm.hidden = false));
    }, (on) => drop.classList.toggle('is-over', on));
    k.on(rm, 'click', () => {
      rm.hidden = true;
      dissolve(false, () => { pic.style.background = ''; pic.setAttribute('aria-label', 'No cover yet'); hint.hidden = false; drop.focus(); });
    });
    return () => k.destroy();
  },
};
