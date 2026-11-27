/** Mini Player: a now-playing widget that contracts into a small pill (on the minimise button, or after a few idle seconds) and grows back when clicked. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Mini Player',
  element: 'Widget',
  trigger: ['Click', 'Idle', 'Keyboard'],
  behavior: ['Self-collapsing', 'Toggle-dependent', 'Reversible', 'Coordinated', 'Time-driven'],
  effect: ['Contracting', 'Expansion', 'Morphing-transition'],
  purpose: ['Hierarchy', 'Focus', 'Continuity'],
  properties: ['Size', 'Position', 'Radius', 'Opacity', 'Layout'],
  description: 'A now-playing widget that gets out of the way. Press minimise (or leave it idle) and it contracts into a slim pill: the cover shrinks into a round thumb, the title slides over, the extra controls fold away and the progress bar thins to a line. Click the pill to grow it back.',
  params: [
    { key: 'idle', label: 'Contract when idle', group: 'Behavior', type: 'range', min: 0, max: 10, step: 1, unit: 's', default: 5, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Cover'),
  ],
};

// [left, top, width, height] in em, full widget → pill
const BOX = { full: { width: '16em', height: '9.6em', borderRadius: '0.6em' }, mini: { width: '13em', height: '3.6em', borderRadius: '1.8em' } };
const AT = {
  art: [[1, 1, 5.5, 5.5, '0.4em'], [0.5, 0.5, 2.6, 2.6, '50%']],
  title: [[7.3, 1.1], [3.6, 0.65]],
  artist: [[7.3, 2.9], [3.6, 1.95]],
  play: [[8.9, 4.3], [10, 0.6]],
  bar: [[1, 7.6, 14, 0.4], [1.8, 3.2, 9.4, 0.14]],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-mp">
        <div class="sp-mp__box"><div class="sp-mp__player" role="region" aria-label="Now playing">
          <i class="sp-mp__art"></i>
          <b class="sp-mp__title"><span>Paper Boats</span></b>
          <span class="sp-mp__artist"><span>The Folds · Side A</span></span>
          <span class="sp-mp__extra"><i>⏮</i><i>⏭</i></span>
          <button type="button" class="sp-mp__play" aria-label="Pause">❚❚</button>
          <i class="sp-mp__bar"><i></i></i>
          <span class="sp-mp__times">1:12 · 3:40</span>
          <button type="button" class="sp-mp__toggle" aria-expanded="true" aria-label="Minimise player"></button>
        </div></div>
      </div>`);
    const player = k.$('.sp-mp__player');
    const art = k.$('.sp-mp__art');
    const title = k.$('.sp-mp__title');
    const artist = k.$('.sp-mp__artist');
    const play = k.$('.sp-mp__play');
    const bar = k.$('.sp-mp__bar');
    const fill = k.$('.sp-mp__bar i');
    const fades = k.$$('.sp-mp__extra, .sp-mp__times');
    const toggle = k.$('.sp-mp__toggle');
    k.fit(k.$('.sp-mp__box'), 0.86); // a fixed box, so the zoom doesn't change as the player contracts
    const em = (v) => `${v}em`;
    const place = (el, [l, t, w, h, r], extra = {}) => ({ left: em(l), top: em(t), ...(w ? { width: em(w), height: em(h) } : {}), ...(r ? { borderRadius: r } : {}), ...extra });
    let mini = false;
    let idle;
    let tl;

    const set = (small) => {
      mini = small;
      toggle.setAttribute('aria-expanded', String(!small));
      toggle.setAttribute('aria-label', small ? 'Expand player' : 'Minimise player');
      const i = small ? 1 : 0;
      const dur = reducedMotion ? 0 : p.time;
      const ease = small ? 'power3.inOut' : 'back.out(1.4)';
      tl?.kill();
      tl = gsap.timeline({ defaults: { duration: dur, ease } })
        .to(fades, { autoAlpha: small ? 0 : 1, duration: dur * 0.4 }, small ? 0 : dur * 0.6)
        .to(player, BOX[small ? 'mini' : 'full'], 0)
        .to(art, place(art, AT.art[i]), 0)
        .to(title, place(title, AT.title[i], { scale: small ? 0.78 : 1 }), 0)
        .to(artist, place(artist, AT.artist[i], { scale: small ? 0.85 : 1 }), 0)
        .to(play, place(play, AT.play[i]), 0)
        .to(bar, place(bar, AT.bar[i]), 0);
      if (!small) arm();
    };
    const arm = () => {
      idle?.kill();
      if (p.idle > 0 && !mini) idle = gsap.delayedCall(p.idle, () => set(true));
    };
    gsap.set(art, place(art, AT.art[0]));
    gsap.set(title, place(title, AT.title[0]));
    gsap.set(artist, place(artist, AT.artist[0]));
    gsap.set(play, place(play, AT.play[0]));
    gsap.set(bar, place(bar, AT.bar[0]));
    const song = gsap.fromTo(fill, { width: '30%' }, { width: '100%', duration: 60, ease: 'none', repeat: -1 });
    arm();

    k.on(toggle, 'click', (e) => {
      e.stopPropagation();
      set(!mini);
    });
    k.on(player, 'click', () => mini && set(false));
    k.on(player, 'pointermove', () => !mini && arm());
    k.on(play, 'click', (e) => {
      e.stopPropagation();
      const paused = !song.paused();
      song.paused(paused);
      play.textContent = paused ? '▶' : '❚❚';
      play.setAttribute('aria-label', paused ? 'Play' : 'Pause');
      if (!mini) arm();
    });

    return { destroy: () => { idle?.kill(); song.kill(); tl?.kill(); k.destroy(); }, update: (key) => key === 'idle' && arm() };
  },
};
