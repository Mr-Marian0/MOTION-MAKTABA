/** Lissajous Icon: a "syncing" icon whose dot traces a Lissajous knot, leaving a fading trail; the figure changes with each sync ratio, and when the sync finishes the knot collapses into a tick. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const RATIOS = [[3, 2], [5, 4], [3, 4], [1, 2]];

export const meta = {
  title: 'Lissajous Icon',
  element: 'Icon',
  trigger: ['Click', 'Keyboard', 'Load'],
  behavior: ['Looping', 'State-dependent', 'Procedural'],
  effect: ['Lissajous-motion', 'Motion-trail', 'Figure-eight-motion'],
  purpose: ['Progress', 'Feedback', 'Delight'],
  properties: ['Path', 'Position'],
  description: 'A sync status icon drawn by a moving point. While syncing, a dot traces a Lissajous figure inside the tile (x and y swinging at different whole-number rates), drawing the curve behind it as a fading trail. Press the tile to sync again: each run picks a new ratio, so the knot changes shape. When the sync completes, the trail eases out and a tick is drawn.',
  params: [
    { key: 'speed', label: 'Loop time', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.25, unit: 's', default: 2.5, live: true },
    { key: 'sync', label: 'Sync time', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 4, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Trace'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-lsj">
        <button type="button" class="sp-tm__icon sp-lsj__tile" aria-label="Sync now">
          <svg viewBox="-12 -12 24 24" aria-hidden="true"><path class="sp-lsj__trail" /><circle class="sp-lsj__dot" r="1.6" /><path class="sp-lsj__tick" d="M-6 0 L-2 4 L6 -5" pathLength="1" /></svg>
        </button>
        <small class="sp-lsj__msg" aria-live="polite"></small>
      </div>`);
    const tile = k.$('.sp-lsj__tile');
    const trail = k.$('.sp-lsj__trail');
    const dot = k.$('.sp-lsj__dot');
    const tick = k.$('.sp-lsj__tick');
    const msg = k.$('.sp-lsj__msg');
    gsap.set(tick, { strokeDasharray: 1, strokeDashoffset: 1 });
    let run = 0, loop, done;
    const pt = (a, b, t) => [9 * Math.sin(a * t + Math.PI / 2), 9 * Math.sin(b * t)];
    const sync = () => {
      loop?.kill(); done?.kill();
      const [a, b] = RATIOS[run++ % RATIOS.length];
      msg.textContent = `Syncing… (${a}:${b})`;
      gsap.set(tick, { strokeDashoffset: 1 });
      gsap.set([trail, dot], { opacity: 1 });
      const finish = () => { loop?.kill(); msg.textContent = 'Up to date'; gsap.to([trail, dot], { opacity: 0, duration: reducedMotion ? 0 : 0.3 }); gsap.to(tick, { strokeDashoffset: 0, duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.2 }); };
      if (reducedMotion) { trail.setAttribute('d', ''); return (done = gsap.delayedCall(p.sync, finish)); }
      const s = { t: 0 };
      loop = gsap.to(s, { t: Math.PI * 2, duration: p.speed, ease: 'none', repeat: -1, onUpdate: () => {
        const [x, y] = pt(a, b, s.t);
        gsap.set(dot, { attr: { cx: x, cy: y } });
        // the trail: the last third of a loop behind the dot
        const pts = Array.from({ length: 30 }, (_, i) => pt(a, b, s.t - (i / 29) * 2.1).map((v) => v.toFixed(2)).join(' '));
        trail.setAttribute('d', `M${pts.join(' L')}`);
      } });
      done = gsap.delayedCall(p.sync, finish);
    };
    k.on(tile, 'click', sync);
    sync();
    return () => { loop?.kill(); done?.kill(); k.destroy(); };
  },
};
