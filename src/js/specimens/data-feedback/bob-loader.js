/** Bob Loader: three buoys bobbing on a gentle swell while something loads: each rises and sinks out of step with the next, tilting with the water, as the waterline undulates beneath them. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Bob Loader',
  element: 'Loader',
  trigger: ['Load', 'Idle'],
  behavior: ['Looping', 'Periodic', 'Floating'],
  effect: ['Bobbing', 'Swaying', 'Traveling-wave'],
  purpose: ['Progress', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Path'],
  description: 'A calm "syncing your library" loader for a sailing app. Three striped buoys float on a waterline that rolls in a slow wave from left to right; each buoy rides the wave where it sits, rising and sinking and tilting with the slope of the water, so they bob one after another rather than together. Pressing a buoy makes it dip under and pop back up.',
  params: [
    { key: 'swell', label: 'Swell', group: 'Motion', type: 'range', min: 0.2, max: 1.5, step: 0.05, unit: 'em', default: 0.6, live: true },
    { key: 'period', label: 'Wave time', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.25, unit: 's', default: 2.5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Buoys'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-bob">
        <div class="sp-bob__sea" role="status" aria-label="Syncing your library">
          <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
          ${[0.2, 0.5, 0.8].map((u) => `<span class="sp-bob__buoy" style="left:${u * 100}%" aria-hidden="true"><i></i></span>`).join('')}
        </div>
        <small class="sp-df__kick">Syncing your library…</small>
      </div>`);
    const sea = k.$('.sp-bob__sea');
    const path = k.$('.sp-bob__sea path');
    const buoys = k.$$('.sp-bob__buoy');
    const U = [0.2, 0.5, 0.8];
    let E = 14;
    k.resize(sea, () => (E = parseFloat(getComputedStyle(sea).fontSize) || 14));
    // the water surface: y(u, t) = A·sin(2π(u·1.3 − t/T)); buoys sit on it and tilt with its slope
    const s = { t: 0 };
    const dips = U.map(() => ({ d: 0 })); // one object per buoy (a GSAP target array would mean "many targets")
    const y = (u) => Math.sin(Math.PI * 2 * (u * 1.3 - s.t / p.period));
    const draw = () => {
      path.setAttribute('d', `M0 40 L${Array.from({ length: 41 }, (_, i) => `${i * 5} ${(14 + y(i / 40) * p.swell * 7).toFixed(2)}`).join(' L')} L200 40 Z`);
      buoys.forEach((b, i) => {
        const slope = (y(U[i] + 0.01) - y(U[i] - 0.01)) / 0.02;
        gsap.set(b, { y: y(U[i]) * p.swell * E * 0.55 + dips[i].d * E, rotation: slope * p.swell * 2.5 });
      });
    };
    const tick = (t, ms) => { s.t += ms / 1000; draw(); };
    if (reducedMotion) draw(); else gsap.ticker.add(tick);
    // Extra: press a buoy and it dips under and pops back up
    buoys.forEach((b, i) => k.on(b, 'pointerdown', () => !reducedMotion && gsap.fromTo(dips[i], { d: 0.6 }, { d: 0, duration: 1, ease: 'elastic.out(1, 0.3)' })));
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
