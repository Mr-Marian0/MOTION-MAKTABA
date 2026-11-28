/** Eject Video: a retro player that takes tapes: press eject and the cassette is pushed up out of the slot with a clunk and pops free; pick another tape and it slides down in and starts to play. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

const TAPES = [['Summer 1994', 0], ['Harbour', 1], ['Night drive', 3]];

export const meta = {
  title: 'Eject Video',
  element: 'Video',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'State-dependent'],
  effect: ['Ejecting', 'Anticipation-motion', 'Dropping'],
  purpose: ['Storytelling', 'Delight', 'Navigation'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A home-video player with a cassette slot. Press ⏏ and the screen cuts to static while the tape is pushed up out of the slot: it sinks a hair first, then shoots up and tips over, landing on the shelf of tapes. Choose another tape from the shelf and it drops into the slot, the screen flickers and the new recording plays.',
  params: [
    { key: 'power', label: 'Eject power', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.25, unit: 'em', default: 2.5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Label'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-ejv">
        <div class="sp-ejv__deck">
          <div class="sp-tm__video sp-ejv__screen"><div class="sp-ejv__pic">${photo(0, 'sp-ejv__img')}</div><i class="sp-ejv__static" aria-hidden="true"></i><b class="sp-ejv__osd" aria-live="polite">▶ ${TAPES[0][0]}</b></div>
          <div class="sp-ejv__slot"><i class="sp-ejv__tape" aria-hidden="true"><b>${TAPES[0][0]}</b></i><span class="sp-ejv__mouth"></span><button type="button" class="sp-ejv__eject" aria-label="Eject tape">⏏</button></div>
        </div>
        <div class="sp-ejv__shelf">${TAPES.map(([t], i) => `<button type="button" class="sp-ejv__pick" data-i="${i}" aria-label="Play ${t}" ${i ? '' : 'disabled'}>${t}</button>`).join('')}</div>
      </div>`);
    const pic = k.$('.sp-ejv__pic');
    const stat = k.$('.sp-ejv__static');
    const osd = k.$('.sp-ejv__osd');
    const tape = k.$('.sp-ejv__tape');
    const picks = k.$$('.sp-ejv__pick');
    let loaded = 0;
    gsap.set(stat, { autoAlpha: 0 });
    const d = () => (reducedMotion ? 0 : 1);
    k.on(k.$('.sp-ejv__eject'), 'click', () => {
      if (loaded < 0) return;
      picks.forEach((b) => (b.disabled = false));
      osd.textContent = 'No tape';
      gsap.timeline()
        .to(stat, { autoAlpha: 1, duration: 0.1 * d() })
        .to(tape, { y: '0.25em', duration: 0.1 * d(), ease: 'power2.in' })
        .to(tape, { y: `-${p.power}em`, rotation: -25, duration: 0.35 * d(), ease: 'power3.out' })
        .to(tape, { y: '-0.4em', x: '8em', rotation: 0, autoAlpha: 0, duration: 0.35 * d(), ease: 'power2.in' });
      loaded = -1;
    });
    picks.forEach((b) => k.on(b, 'click', () => {
      const i = Number(b.dataset.i);
      if (loaded >= 0) return;
      loaded = i;
      picks.forEach((x) => (x.disabled = x === b));
      tape.querySelector('b').textContent = TAPES[i][0];
      gsap.timeline()
        .fromTo(tape, { x: 0, y: '-3em', rotation: 0, autoAlpha: 1 }, { y: 0, duration: 0.35 * d(), ease: 'bounce.out' })
        .call(() => { pic.innerHTML = photo(TAPES[i][1], 'sp-ejv__img'); osd.textContent = `▶ ${TAPES[i][0]}`; })
        .to(stat, { keyframes: { autoAlpha: [1, 0.3, 0.8, 0] }, duration: 0.4 * d() });
    }));
    return () => k.destroy();
  },
};
