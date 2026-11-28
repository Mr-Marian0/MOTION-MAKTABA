/** Ratchet Progress: a batch job's progress advances in hard clicks like a ratchet: each finished item snaps the bar forward one notch with a jolt, a pawl tick drops behind it, and it can only go forward. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ratchet Progress',
  element: 'Progress bar',
  trigger: ['Load', 'Click', 'Keyboard'],
  behavior: ['Discrete', 'Sequential', 'Snapping'],
  effect: ['Ratcheting', 'Snapping', 'Recoiling'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Size', 'Position'],
  description: 'A photo-export progress bar that moves like a ratchet. The bar is divided into notches, one per photo. As each photo finishes the fill snaps forward exactly one notch in a quick jolt, overshooting a hair and knocking back, while a little pawl drops into the notch behind it so it visibly cannot slip back. "Export" starts a run of 12 at an uneven pace.',
  params: [
    { key: 'count', label: 'Photos', group: 'Behavior', type: 'range', min: 4, max: 24, step: 1, unit: '', default: 12 },
    { key: 'snap', label: 'Snap time', group: 'Motion', type: 'range', min: 0.05, max: 0.4, step: 0.01, unit: 's', default: 0.12, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Fill'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.count);
    k.html(`
      <div class="sp sp-df sp-rtp">
        <div class="sp-df__card">
          <div class="sp-df__row"><b>Exporting photos</b><small aria-live="polite" class="sp-rtp__n">0 / ${n}</small></div>
          <div class="sp-rtp__bar" role="progressbar" aria-label="Export" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="0" style="--n:${n}">
            <i class="sp-rtp__fill"></i><i class="sp-rtp__teeth"></i><i class="sp-rtp__pawl"></i>
          </div>
          <button type="button" class="sp-df__btn">Export</button>
        </div>
      </div>`);
    const bar = k.$('.sp-rtp__bar');
    const fill = k.$('.sp-rtp__fill');
    const pawl = k.$('.sp-rtp__pawl');
    const out = k.$('.sp-rtp__n');
    const btn = k.$('.sp-df__btn');
    let W = 200, done = 0, timer;
    k.resize(bar, () => { W = bar.offsetWidth; gsap.set(fill, { scaleX: done / n }); gsap.set(pawl, { x: (done / n) * W }); });
    gsap.set(fill, { scaleX: 0 });
    const step = () => {
      done += 1;
      out.textContent = `${done} / ${n}`;
      bar.setAttribute('aria-valuenow', done);
      const v = done / n;
      if (reducedMotion) { gsap.set(fill, { scaleX: v }); gsap.set(pawl, { x: v * W }); }
      else gsap.timeline()
        .to(fill, { scaleX: v + 0.25 / n, duration: p.snap, ease: 'power4.in' })
        .to(fill, { scaleX: v, duration: 0.15, ease: 'power2.out' })
        .set(pawl, { x: v * W, y: '-0.5em' }, p.snap)
        .to(pawl, { y: 0, duration: 0.15, ease: 'bounce.out' }, p.snap)
        .fromTo(bar, { x: 0 }, { keyframes: { x: [1.5, -0.5, 0] }, duration: 0.12, ease: 'none' }, p.snap);
      if (done < n) timer = gsap.delayedCall(0.25 + Math.random() * 0.7, step);
      else { btn.disabled = false; btn.textContent = 'Export again'; }
    };
    k.on(btn, 'click', () => {
      timer?.kill();
      done = 0;
      gsap.set(fill, { scaleX: 0 }); gsap.set(pawl, { x: 0 });
      out.textContent = `0 / ${n}`;
      btn.disabled = true;
      timer = gsap.delayedCall(0.3, step);
    });
    return () => { timer?.kill(); k.destroy(); };
  },
};
