/** Mosh Video: skipping to the next chapter datamoshes the cut: the new scene appears but blocks of the old frame cling on, dragged downward and sideways by the motion of the new shot in stuttering steps, until they break up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { photo } from './_tm.js';

const CHAPTERS = [['Intro', 0], ['The coast', 1], ['Forest', 2], ['Night', 3]];

export const meta = {
  title: 'Mosh Video',
  element: 'Video',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Randomized', 'Sequential'],
  effect: ['Datamoshing', 'Motion-smear', 'Disintegration'],
  purpose: ['Delight', 'Continuity', 'Branding'],
  properties: ['Clip & mask', 'Position', 'Scale'],
  description: 'A video with chapter buttons that cut like a corrupted file. Jump to a chapter and the new scene arrives, but the previous frame does not let go cleanly: it breaks into compression blocks that keep moving with the new shot\'s motion (sliding down and across in dropped-frame steps, stretching as they go), smearing the old picture over the new one before they crumble out. The chapter title flickers in with the moshed blocks.',
  params: [
    { key: 'blocks', label: 'Blocks across', group: 'Shape', type: 'range', min: 4, max: 14, step: 1, unit: '', default: 9 },
    { key: 'time', label: 'Mosh time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#ff3d8b', 'tone', '--sp-accent', 'Chapter'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const cols = Math.round(p.blocks);
    k.html(`
      <div class="sp sp-tm sp-msv">
        <div class="sp-tm__video sp-msv__video"><div class="sp-msv__now">${photo(0, 'sp-msv__img')}</div><div class="sp-cc__pieces"></div><b class="sp-msv__title" aria-live="polite">${CHAPTERS[0][0]}</b></div>
        <div class="sp-msv__chapters">${CHAPTERS.map(([t], i) => `<button type="button" aria-pressed="${!i}">${t}</button>`).join('')}</div>
      </div>`);
    const now = k.$('.sp-msv__now');
    const host = k.$('.sp-cc__pieces');
    const title = k.$('.sp-msv__title');
    const btns = k.$$('.sp-msv__chapters button');
    let at = 0, mosh;
    btns.forEach((b, i) => k.on(b, 'click', () => {
      if (i === at) return;
      const old = CHAPTERS[at][1];
      const dir = i > at ? 1 : -1; // before `at` moves on: skipping forward drags right, back drags left
      at = i;
      btns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
      now.innerHTML = photo(CHAPTERS[i][1], 'sp-msv__img');
      title.textContent = CHAPTERS[i][0];
      mosh?.kill();
      if (reducedMotion) return (host.innerHTML = '');
      // the new shot's "motion vectors": everything drifts down and a little to one side
      const bits = pieces(host, photo(old, 'sp-msv__img'), grid(cols, Math.round(cols * 0.56)));
      mosh = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const life = p.time * (0.3 + Math.random() * 0.7);
        gsap.set(el, { transformOrigin: `${cx}% ${cy}%` });
        mosh.to(el, { y: `${0.6 + Math.random() * 1.6}em`, x: `${dir * Math.random() * 1.2}em`, scaleY: 1 + Math.random() * 0.8, duration: life, ease: `steps(${3 + Math.floor(Math.random() * 4)})` }, 0)
          .set(el, { autoAlpha: 0 }, life);
      });
      mosh.fromTo(title, { autoAlpha: 0 }, { keyframes: { autoAlpha: [1, 0, 1, 0.3, 1] }, duration: p.time * 0.6, ease: 'steps(5)' }, 0);
    }));
    return () => { mosh?.kill(); k.destroy(); };
  },
};
