/** Hop Progress: a checkout stepper where a little marker hops from step to step: each hop is an arc that lands with a squash on the next station, and the trail behind it fills in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const STEPS = ['Cart', 'Address', 'Delivery', 'Payment', 'Done'];

export const meta = {
  title: 'Hop Progress',
  element: 'Progress bar',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Discrete', 'Direction-aware'],
  effect: ['Hopping', 'Parabolic-motion', 'Squashing'],
  purpose: ['Progress', 'Orientation', 'Navigation'],
  properties: ['Position', 'Scale', 'Color'],
  description: 'A five-step checkout progress bar with a hopping marker. Press Next and the marker crouches, hops in an arc along the track to the next step, squashes as it lands and springs up; the track behind it fills in as it goes and the step label lights up. Back hops it the other way and the fill retreats. Steps already done can be clicked to hop straight back to them.',
  params: [
    { key: 'height', label: 'Hop height', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'em', default: 1.75, live: true },
    { key: 'time', label: 'Hop time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Done'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = STEPS.length;
    k.html(`
      <div class="sp sp-df sp-hpg">
        <div class="sp-df__card">
          <div class="sp-hpg__rail" role="progressbar" aria-label="Checkout" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="1" aria-valuetext="Step 1 of ${n}: ${STEPS[0]}">
            <i class="sp-hpg__track"></i><i class="sp-hpg__fill"></i>
            ${STEPS.map((s, i) => `<button type="button" class="sp-hpg__stop" style="left:${(i / (n - 1)) * 100}%" data-i="${i}" aria-label="Go to ${s}" disabled><small>${s}</small></button>`).join('')}
            <i class="sp-hpg__ball" aria-hidden="true"></i>
          </div>
          <div class="sp-df__row"><button type="button" class="sp-df__btn sp-df__btn--ghost" data-d="-1">Back</button><button type="button" class="sp-df__btn" data-d="1">Next</button></div>
        </div>
      </div>`);
    const rail = k.$('.sp-hpg__rail');
    const fill = k.$('.sp-hpg__fill');
    const ball = k.$('.sp-hpg__ball');
    const stops = k.$$('.sp-hpg__stop');
    let W = 200, E = 14, at = 0;
    const mark = () => {
      stops.forEach((s, i) => { s.classList.toggle('is-done', i <= at); s.disabled = i >= at; });
      rail.setAttribute('aria-valuenow', at + 1);
      rail.setAttribute('aria-valuetext', `Step ${at + 1} of ${n}: ${STEPS[at]}`);
    };
    k.resize(rail, () => { W = rail.offsetWidth; E = parseFloat(getComputedStyle(rail).fontSize) || 14; gsap.set(ball, { x: (at / (n - 1)) * W }); gsap.set(fill, { scaleX: at / (n - 1) }); });
    mark();
    const hop = (to) => {
      to = Math.max(0, Math.min(n - 1, to));
      if (to === at) return;
      const from = at;
      at = to;
      mark();
      const [x0, x1] = [(from / (n - 1)) * W, (to / (n - 1)) * W];
      if (reducedMotion) { gsap.set(ball, { x: x1 }); return gsap.set(fill, { scaleX: to / (n - 1) }); }
      const H = p.height * E * Math.sqrt(Math.abs(to - from));
      const s = { u: 0 };
      gsap.timeline()
        .to(ball, { scaleX: 1.3, scaleY: 0.7, duration: 0.08 })
        .to(s, { u: 1, duration: p.time, ease: 'none', onStart: () => gsap.set(ball, { scaleX: 0.85, scaleY: 1.2 }), onUpdate: () => {
          gsap.set(ball, { x: x0 + (x1 - x0) * s.u, y: -4 * H * s.u * (1 - s.u) });
          gsap.set(fill, { scaleX: (from + (to - from) * s.u) / (n - 1) });
        } })
        .to(ball, { scaleX: 1.35, scaleY: 0.65, duration: 0.06 })
        .to(ball, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    };
    k.$$('[data-d]').forEach((b) => k.on(b, 'click', () => hop(at + Number(b.dataset.d))));
    stops.forEach((s) => k.on(s, 'click', () => hop(Number(s.dataset.i))));
    return () => k.destroy();
  },
};
