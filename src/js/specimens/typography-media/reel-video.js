/** Reel Video: a film player with two reels on top: playing turns both reels, and as the film winds across, the feed reel shrinks and the take-up reel grows, so the take-up reel turns slower and the feed reel faster. Scrub and they whir. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Reel Video',
  element: 'Video',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Toggle-dependent', 'Synchronized', 'Draggable'],
  effect: ['Mechanical-rotation', 'Spinning', 'Expansion'],
  purpose: ['Progress', 'Storytelling', 'Delight'],
  properties: ['Rotation', 'Scale'],
  description: 'A projector-style video player. Two film reels sit above the screen: while it plays both turn, and the film visibly passes from the left reel to the right one, the left reel\'s roll shrinking and the right one\'s growing with the progress. Because the film moves at a constant speed, the full reel turns slowly and the nearly empty one spins fast. Drag the progress bar and the reels whir to keep up.',
  params: [
    { key: 'length', label: 'Film length', group: 'Behavior', type: 'range', min: 4, max: 30, step: 1, unit: 's', default: 12, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Film'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-rel">
        <div class="sp-rel__reels" aria-hidden="true"><span class="sp-rel__reel"><i class="sp-rel__roll"></i><i class="sp-rel__spokes"></i></span><span class="sp-rel__reel"><i class="sp-rel__roll"></i><i class="sp-rel__spokes"></i></span></div>
        <div class="sp-tm__video sp-rel__video">
          ${photo(3, 'sp-rel__img')}
          <div class="sp-tm__bar"><button type="button" class="sp-tm__play" aria-label="Play">▶</button><span class="sp-tm__track sp-rel__track" role="slider" tabindex="0" aria-label="Position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="sp-tm__fill"></i></span></div>
        </div>
      </div>`);
    const [feed, take] = k.$$('.sp-rel__reel');
    const rolls = k.$$('.sp-rel__roll');
    const play = k.$('.sp-tm__play');
    const track = k.$('.sp-rel__track');
    const fill = k.$('.sp-tm__fill');
    const s = k.track({ t: 0, a1: 0, a2: 0 });
    let last = 0;
    // Constant film speed: angular speed ∝ 1/radius. Radii grow/shrink with the square root of how much film is on the reel.
    const r = (share) => 0.35 + 0.65 * Math.sqrt(share);
    const draw = () => {
      const d = s.t - last;
      last = s.t;
      s.a1 += (d * 1400) / r(1 - s.t);
      s.a2 += (d * 1400) / r(s.t);
      gsap.set(feed, { rotation: s.a1 });
      gsap.set(take, { rotation: s.a2 });
      gsap.set(rolls[0], { scale: r(1 - s.t) });
      gsap.set(rolls[1], { scale: r(s.t) });
      gsap.set(fill, { scaleX: s.t });
      track.setAttribute('aria-valuenow', Math.round(s.t * 100));
    };
    draw();
    let tl;
    const set = (on) => {
      play.textContent = on ? '❚❚' : '▶';
      play.setAttribute('aria-label', on ? 'Pause' : 'Play');
      tl?.kill();
      if (!on) return;
      if (s.t >= 1) { s.t = 0; last = 0; }
      tl = gsap.to(s, { t: 1, duration: p.length * (1 - s.t), ease: 'none', onUpdate: draw, onComplete: () => set(false) });
    };
    k.on(play, 'click', () => set(!tl?.isActive()));
    // Scrub: drag along the bar; the reels whir to the new spot
    let box;
    const seek = (u) => { tl?.kill(); play.textContent = '▶'; gsap.to(s, { t: Math.min(1, Math.max(0, u)), duration: reducedMotion ? 0 : 0.35, ease: 'power2.out', onUpdate: draw, overwrite: true }); };
    k.on(track, 'pointerdown', (e) => { track.setPointerCapture(e.pointerId); box = track.getBoundingClientRect(); seek((e.clientX - box.left) / box.width); });
    k.on(track, 'pointermove', (e) => box && seek((e.clientX - box.left) / box.width));
    k.on(track, 'pointerup', () => (box = null));
    k.on(track, 'keydown', (e) => { const d = { ArrowLeft: -0.1, ArrowRight: 0.1 }[e.key]; if (d) e.preventDefault(), seek(s.t + d); });
    return () => k.destroy();
  },
};
