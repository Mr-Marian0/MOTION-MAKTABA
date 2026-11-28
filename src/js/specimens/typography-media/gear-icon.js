/** Gear Icon: the settings icon is a real gear train: hover or focus and the big gear turns, driving the small one the other way and faster, teeth meshing; press it and the train spins up hard and coasts down. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

/** A gear outline: n teeth on radius r (tooth height h), centred at 0,0. */
const gear = (n, r, h) => {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, w = Math.PI / n;
    [[a - w * 0.5, r], [a - w * 0.3, r + h], [a + w * 0.3, r + h], [a + w * 0.5, r]].forEach(([t, rr]) => pts.push(`${(Math.cos(t) * rr).toFixed(2)} ${(Math.sin(t) * rr).toFixed(2)}`));
  }
  return `M${pts.join(' L')} Z`;
};

export const meta = {
  title: 'Gear Icon',
  element: 'Icon',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Synchronized', 'Momentum-driven'],
  effect: ['Gear-motion', 'Mechanical-rotation', 'Decelerating'],
  purpose: ['Affordance', 'Delight', 'Feedback'],
  properties: ['Rotation'],
  description: 'A settings button drawn as two meshing gears. Point at it (or focus it) and the large gear turns slowly while the small gear it drives turns the opposite way, faster by the ratio of their teeth (12 to 8), so the teeth stay meshed. Press it and the train is spun up hard, then coasts down to a stop. Leaving lets it wind down.',
  params: [
    { key: 'speed', label: 'Idle speed', group: 'Motion', type: 'range', min: 10, max: 120, step: 5, unit: '°/s', default: 45, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Small gear'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-gri">
        <button type="button" class="sp-tm__icon sp-gri__tile" aria-label="Settings">
          <svg viewBox="-24 -24 48 48" aria-hidden="true">
            <g class="sp-gri__big" transform="translate(-6 3)"><path d="${gear(12, 11, 3)}"/><circle r="4"/></g>
            <g class="sp-gri__small" transform="translate(12.4 -10.6)"><path d="${gear(8, 6.6, 2.6)}"/><circle r="2.4"/></g>
          </svg>
        </button>
        <small>Settings</small>
      </div>`);
    const tile = k.$('.sp-gri__tile');
    const big = k.$('.sp-gri__big path');
    const small = k.$('.sp-gri__small path');
    gsap.set([big, small], { svgOrigin: '0 0' });
    // One angle drives both: the small gear turns −12/8 as far (opposite way, faster)
    const s = k.track({ a: 0, v: 0 });
    const draw = () => { gsap.set(big, { rotation: s.a }); gsap.set(small, { rotation: -s.a * 1.5 + 11 }); };
    draw();
    let running = false;
    const tick = (t, ms) => {
      s.a += s.v * (ms / 1000);
      draw();
      if (Math.abs(s.v) < 0.5 && !gsap.isTweening(s)) { gsap.ticker.remove(tick); running = false; }
    };
    const run = () => { if (!running && !reducedMotion) running = true, gsap.ticker.add(tick); };
    const idle = (on) => { gsap.to(s, { v: on ? p.speed : 0, duration: 0.8, ease: 'power2.out', overwrite: true }); run(); };
    ['pointerenter', 'focus'].forEach((ev) => k.on(tile, ev, () => idle(true)));
    ['pointerleave', 'blur'].forEach((ev) => k.on(tile, ev, () => idle(false)));
    k.on(tile, 'click', () => {
      gsap.killTweensOf(s);
      gsap.timeline().to(s, { v: 900, duration: 0.15, ease: 'power2.out' }).to(s, { v: tile.matches(':hover, :focus') ? p.speed : 0, duration: 2.4, ease: 'power2.out' });
      run();
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
