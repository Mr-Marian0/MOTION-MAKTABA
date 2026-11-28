/** Freeze Progress: pausing a download freezes its bar: frost creeps along it from the ends, the fill turns icy blue and stops dead; resume and the ice cracks off and the bar warms back up and moves on. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Freeze Progress',
  element: 'Progress bar',
  trigger: ['Click', 'Keyboard', 'Load'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Pausable'],
  effect: ['Freezing', 'Crystallization', 'Shaking'],
  purpose: ['Progress', 'Feedback', 'Affordance'],
  properties: ['Color', 'Clip & mask', 'Position'],
  description: 'A download bar where pause looks like pause. While downloading the fill advances with a warm colour. Press pause and frost grows in over the bar from both ends with ice crystals, the fill cools to blue and stops. Press resume and the bar gives a short shiver as the ice cracks away, the colour warms, and it carries on from where it was.',
  params: [
    { key: 'time', label: 'Download time', group: 'Behavior', type: 'range', min: 4, max: 30, step: 1, unit: 's', default: 12, live: true },
    { key: 'freeze', label: 'Freeze time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#f2701d', 'tone', '--sp-accent', 'Warm fill'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-frp">
        <div class="sp-df__card">
          <div class="sp-df__row"><b>field-recordings.zip</b><small class="sp-frp__pct" aria-live="polite">0%</small></div>
          <div class="sp-df__track sp-frp__track" role="progressbar" aria-label="Download" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="sp-df__fill sp-frp__fill"></i><i class="sp-frp__ice"></i></div>
          <div class="sp-df__row"><small class="sp-frp__state">Downloading</small><button type="button" class="sp-df__btn" aria-pressed="false">Pause</button></div>
        </div>
      </div>`);
    const track = k.$('.sp-frp__track');
    const fill = k.$('.sp-frp__fill');
    const ice = k.$('.sp-frp__ice');
    const pct = k.$('.sp-frp__pct');
    const state = k.$('.sp-frp__state');
    const btn = k.$('.sp-df__btn');
    const s = { v: 0 };
    const dl = gsap.to(s, { v: 100, duration: p.time, ease: 'none', paused: true, onUpdate: () => {
      gsap.set(fill, { scaleX: s.v / 100 });
      pct.textContent = `${Math.round(s.v)}%`;
      track.setAttribute('aria-valuenow', Math.round(s.v));
    }, onComplete: () => { state.textContent = 'Done'; btn.disabled = true; } });
    k.inView(track, () => !dl.progress() && dl.play(), 0.5);
    gsap.set(ice, { '--f': 0 });
    k.on(btn, 'click', () => {
      const frozen = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(frozen));
      btn.textContent = frozen ? 'Resume' : 'Pause';
      state.textContent = frozen ? 'Paused' : 'Downloading';
      track.classList.toggle('is-frozen', frozen);
      const d = reducedMotion ? 0 : 1;
      if (frozen) {
        dl.pause();
        gsap.to(ice, { '--f': 1, duration: p.freeze * d, ease: 'power2.out', overwrite: true });
      } else {
        gsap.timeline()
          .to(track, { keyframes: { x: [-2, 2, -1, 1, 0] }, duration: 0.25 * d, ease: 'none' })
          .to(ice, { '--f': 0, duration: p.freeze * 0.5 * d, ease: 'power2.in' }, 0.1 * d)
          .call(() => dl.play());
      }
    });
    return () => { dl.kill(); k.destroy(); };
  },
};
