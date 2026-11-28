/** Fold Gallery: turning to the next photo folds the current one shut along its middle, top half coming down over the bottom like a card closing, to uncover the next print lying underneath. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { photo, PHOTOS } from './_tm.js';

const TITLES = ['Dusk, west field', 'Harbour noon', 'Fern valley', 'Night road'];

export const meta = {
  title: 'Fold Gallery',
  element: 'Gallery',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Direction-aware', 'Cyclic'],
  effect: ['Folding', 'Axial-rotation', 'Flattening'],
  purpose: ['Navigation', 'Continuity', 'Delight'],
  properties: ['Rotation', 'Clip & mask', 'Shadow'],
  description: 'A photo gallery made of folded prints. Press next and the current picture folds in half: its top half swings down over the bottom half, darkening as it turns, and the whole folded card drops away to reveal the next photo underneath. Previous folds upwards instead. ←/→ also turn.',
  params: [
    { key: 'time', label: 'Fold time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Arrows'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-fgl">
        <div class="sp-fgl__stage" tabindex="0" role="group" aria-roledescription="gallery" aria-label="Prints">
          <div class="sp-tm__frame sp-fgl__frame"><div class="sp-fgl__now">${photo(0, 'sp-fgl__img')}</div><div class="sp-cc__pieces"></div></div>
          <div class="sp-fgl__bar"><button type="button" class="sp-tm__btn sp-tm__btn--ghost" data-d="-1" aria-label="Previous">‹</button><b aria-live="polite">${TITLES[0]}</b><button type="button" class="sp-tm__btn" data-d="1" aria-label="Next">›</button></div>
        </div>
      </div>`);
    const now = k.$('.sp-fgl__now');
    const host = k.$('.sp-cc__pieces');
    const title = k.$('.sp-fgl__bar b');
    let at = 0, tl;
    const turn = (d) => {
      const old = at;
      at = (at + d + PHOTOS.length) % PHOTOS.length;
      now.innerHTML = photo(at, 'sp-fgl__img');
      title.textContent = TITLES[at];
      tl?.kill();
      if (reducedMotion) return (host.innerHTML = '');
      // the old print as two halves: the moving half swings over the still half, both then drop away
      const [top, bot] = pieces(host, photo(old, 'sp-fgl__img'), [[[0, 0], [100, 0], [100, 50], [0, 50]], [[0, 50], [100, 50], [100, 100], [0, 100]]]).map((b) => b.el);
      const mover = d > 0 ? top : bot;
      gsap.set(mover, { transformOrigin: '50% 50%', transformPerspective: 700, zIndex: 2 });
      tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') })
        .to(mover, { rotationX: d > 0 ? -180 : 180, filter: 'brightness(0.55)', duration: p.time, ease: 'power2.inOut' })
        .to([top, bot], { y: d > 0 ? '3em' : '-3em', autoAlpha: 0, duration: p.time * 0.4, ease: 'power2.in' }, `-=${p.time * 0.1}`);
    };
    k.$$('[data-d]').forEach((b) => k.on(b, 'click', () => turn(Number(b.dataset.d))));
    k.on(k.$('.sp-fgl__stage'), 'keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) e.preventDefault(), turn(d); });
    return () => k.destroy();
  },
};
