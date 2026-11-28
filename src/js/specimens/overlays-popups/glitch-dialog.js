/** Glitch Dialog: a "connection lost" dialog that arrives as a bad signal: it tears into horizontal slices that jump sideways, its red and cyan channels split apart, then it snaps clean. While open it glitches again now and then. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces } from '../cards-containers/_pieces.js';
import { seeded } from '../cards-containers/_shape.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Glitch Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard', 'Hover', 'Idle'],
  behavior: ['Toggle-dependent', 'Randomized', 'Intermittent'],
  effect: ['Glitching', 'RGB-splitting', 'Jittering'],
  purpose: ['Feedback', 'Focus', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Color', 'Opacity'],
  description: 'An error dialog that looks like a failing signal. It opens torn into horizontal slices that jump left and right in rough, dropped-frame steps while its red and cyan channels drift apart, then everything snaps into place. While it stays open, a smaller glitch flickers through every few seconds, and hovering "Retry" sets one off at once. Closing tears it apart once more before it cuts out.',
  params: [
    { key: 'amount', label: 'Tear', group: 'Motion', type: 'range', min: 0.2, max: 3, step: 0.1, unit: 'em', default: 1.2, live: true },
    { key: 'slices', label: 'Slices', group: 'Shape', type: 'range', min: 3, max: 14, step: 1, unit: '', default: 7 },
    { key: 'idle', label: 'Idle glitches', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Alert'),
  ],
};

/** Horizontal bands of random heights that tile the box top to bottom. */
const bands = (n, r) => {
  const cuts = [0, ...Array.from({ length: n - 1 }, () => r() * 100).sort((a, b) => a - b), 100];
  return cuts.slice(1).map((y1, i) => [[0, cuts[i]], [100, cuts[i]], [100, y1], [0, y1]]);
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const body = (cls = '') => `
      <div class="sp-ov__card sp-gli__body ${cls}">
        <b class="sp-ov__title">Connection lost</b>
        <p class="sp-ov__text">We could not reach the server. Your draft is safe on this device.</p>
        <div class="sp-ov__actions"><button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-gli__later">Later</button><button type="button" class="sp-ov__btn sp-gli__retry">Retry</button></div>
      </div>`;
    k.html(scene('sp-gli', `
      <div class="sp-gli__hold" role="dialog" aria-label="Connection lost">
        <div class="sp-gli__ch sp-gli__ch--r" aria-hidden="true">${body()}</div>
        <div class="sp-gli__ch sp-gli__ch--c" aria-hidden="true">${body()}</div>
        <div class="sp-gli__real">${body()}</div>
        <div class="sp-cc__pieces" aria-hidden="true"></div>
      </div>`, { label: 'Go offline', title: 'Drafts', kick: 'Editor' }));
    const hold = k.$('.sp-gli__hold');
    const real = k.$('.sp-gli__real');
    const [chR, chC] = [k.$('.sp-gli__ch--r'), k.$('.sp-gli__ch--c')];
    const host = k.$('.sp-cc__pieces');
    const slices = pieces(host, body(), bands(Math.round(p.slices), seeded(7))).map((b) => b.el);
    k.$$('.sp-cc__pieces button, .sp-gli__ch button').forEach((b) => (b.tabIndex = -1));
    gsap.set(hold, { autoAlpha: 0 });
    gsap.set([host, chR, chC], { autoAlpha: 0 });
    const rnd = (a) => `${((Math.random() - 0.5) * 2 * a).toFixed(2)}em`;
    /** frames of tearing: each frame jumps every slice and both channels to new offsets (a set, not a tween). */
    const glitch = (frames, amt) => {
      const tl = gsap.timeline()
        .set(real, { autoAlpha: 0 })
        .set([host, chR, chC], { autoAlpha: 1 });
      for (let f = 0; f < frames; f++) {
        const s = f / frames;
        const a = amt * (1 - s * 0.6);
        tl.set(slices, { x: () => (Math.random() < 0.45 ? rnd(a) : 0) }, s * frames * 0.055)
          .set(chR, { x: rnd(a * 0.5), y: rnd(a * 0.1) }, s * frames * 0.055)
          .set(chC, { x: rnd(a * 0.5), y: rnd(a * 0.1) }, s * frames * 0.055);
      }
      return tl.set(slices, { x: 0 }, frames * 0.055)
        .set([chR, chC], { x: 0, y: 0 })
        .set([host, chR, chC], { autoAlpha: 0 })
        .set(real, { autoAlpha: 1 });
    };
    // Extra: while open, a small glitch every 2.5–5 s (only while open, so nothing runs when it is shut)
    let idle, blip;
    const schedule = () => {
      idle?.kill();
      if (!p.idle || reducedMotion) return;
      idle = gsap.delayedCall(2.5 + Math.random() * 2.5, () => { blip = glitch(3, p.amount * 0.4); schedule(); });
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      idle?.kill(); blip?.kill();
      if (open) {
        schedule();
        return gsap.timeline().set(hold, { autoAlpha: 1 }).add(glitch(9, p.amount));
      }
      return gsap.timeline().add(glitch(5, p.amount * 1.4)).set(hold, { autoAlpha: 0 }).set(real, { autoAlpha: 0 });
    }, ['Go offline', 'Close']);
    k.on(k.$('.sp-gli__real .sp-gli__retry'), 'pointerenter', () => { if (!reducedMotion) { blip?.kill(); blip = glitch(4, p.amount * 0.6); } });
    k.on(k.$('.sp-gli__real .sp-gli__later'), 'click', () => k.$('.sp-ov__open').click());
    k.on(k.$('.sp-gli__real .sp-gli__retry'), 'click', () => k.$('.sp-ov__open').click());
    return () => { idle?.kill(); k.destroy(); };
  },
};
