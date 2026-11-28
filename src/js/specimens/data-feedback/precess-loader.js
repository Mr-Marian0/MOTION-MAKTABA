/** Precess Loader: a spinning ring loader whose axis is not upright: while the ring spins fast, its tilted axis slowly sweeps around in a circle (precession), so the ring's ellipse swings round as it spins. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Precess Loader',
  element: 'Loader',
  trigger: ['Load', 'Idle'],
  behavior: ['Looping', 'Continuous', 'Synchronized'],
  effect: ['Precession', 'Gyroscopic-motion', 'Spinning'],
  purpose: ['Progress', 'Delight', 'Branding'],
  properties: ['Rotation'],
  description: 'A gyroscope loader for "calibrating sensors". A gapped ring spins quickly around its own axis, and that axis is tilted and itself slowly sweeps round in a circle, the way a spinning top\'s axis wanders, so the ring is seen edge-on, then open, then edge-on from the other side as the spin carries on. A tiny gimbal frame stays still around it for reference.',
  params: [
    { key: 'tilt', label: 'Axis tilt', group: 'Motion', type: 'range', min: 10, max: 70, step: 5, unit: '°', default: 50, live: true },
    { key: 'precess', label: 'Precession time', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3.5, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Ring'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-prc">
        <div class="sp-prc__gimbal" role="status" aria-label="Calibrating sensors"><div class="sp-prc__axis"><i class="sp-prc__ring"></i></div></div>
        <small class="sp-df__kick">Calibrating sensors…</small>
      </div>`);
    const axis = k.$('.sp-prc__axis');
    const ring = k.$('.sp-prc__ring');
    // The axis is tilted by `tilt` towards a direction that turns around once per precession period
    const s = { pre: 0, spin: 0 };
    const draw = () => {
      gsap.set(axis, { rotationX: Math.cos(s.pre) * p.tilt, rotationY: Math.sin(s.pre) * p.tilt });
      gsap.set(ring, { rotation: s.spin });
    };
    const tick = (t, ms) => { s.pre += (ms / 1000) * ((Math.PI * 2) / p.precess); s.spin += ms * 0.8; draw(); };
    gsap.set(axis, { transformPerspective: 500 });
    if (reducedMotion) draw(); else gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
