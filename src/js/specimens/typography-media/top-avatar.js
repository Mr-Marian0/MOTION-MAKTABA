/** Top Avatar: an "online" avatar badge spun like a top: give it a flick and it whirls, its axis tracing slow circles (precession) with a quick nodding wobble on top (nutation), until it slows, wobbles wider and settles. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { face, NAMES } from './_tm.js';

export const meta = {
  title: 'Top Avatar',
  element: 'Avatar',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Physics-driven', 'Event-driven', 'Oscillating'],
  effect: ['Nutation', 'Precession', 'Gyroscopic-motion'],
  purpose: ['Delight', 'Feedback'],
  properties: ['Rotation', 'Position', 'Shadow'],
  description: 'A profile avatar mounted like a spinning top. Press it and it spins up; while spinning, its axis does not stand straight but leans and circles slowly around (precession) while nodding up and down quickly (nutation), so the face sweeps a wobbling loop. As it loses speed the lean grows and the wobble widens, then it drops upright. Hovering gives it a small nudge.',
  params: [
    { key: 'spin', label: 'Spin time', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.25, unit: 's', default: 2.8, live: true },
    { key: 'lean', label: 'Lean', group: 'Motion', type: 'range', min: 4, max: 25, step: 1, unit: '°', default: 12, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Online ring'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-top">
        <button type="button" class="sp-top__btn" aria-label="${NAMES[2]}, online. Spin the avatar"><span class="sp-top__axis">${face(2, 'sp-top__face')}<i class="sp-top__ring" aria-hidden="true"></i></span><i class="sp-top__shadow" aria-hidden="true"></i></button>
        <small>${NAMES[2]} · <b>online</b></small>
      </div>`);
    const btn = k.$('.sp-top__btn');
    const axis = k.$('.sp-top__axis');
    const shadow = k.$('.sp-top__shadow');
    const faceEl = k.$('.sp-top__face');
    const s = k.track({ t: 0, energy: 0 });
    gsap.set(axis, { transformOrigin: '50% 100%' });
    // lean grows as energy falls; the axis precesses (slow circle) and nutates (fast nod) around it
    const draw = () => {
      const lean = p.lean * (1.4 - s.energy) * Math.min(1, s.energy * 6);
      const nod = Math.sin(s.t * 11) * lean * 0.35;
      const pre = s.t * 2.2;
      // the tilt pivots on the point (axis, origin at the bottom); the spin turns the face about its own centre
      gsap.set(axis, { rotationX: Math.cos(pre) * (lean + nod), rotationY: Math.sin(pre) * (lean + nod), transformPerspective: 400 });
      gsap.set(faceEl, { rotation: s.t * 400 * s.energy });
      gsap.set(shadow, { x: Math.sin(pre) * lean * 0.08 * E, scaleX: 1 + lean / 60 });
    };
    let tl, E = 14;
    k.on(btn, 'click', () => {
      if (reducedMotion) return;
      tl?.kill();
      E = parseFloat(getComputedStyle(btn).fontSize) || 14; // px per em, once per spin
      s.t = 0;
      tl = gsap.timeline({ onUpdate: draw })
        .to(s, { energy: 1, duration: 0.25, ease: 'power2.out' }, 0)
        .to(s, { t: p.spin * 1.6, duration: p.spin, ease: 'power1.out' }, 0)
        .to(s, { energy: 0, duration: p.spin * 0.9, ease: 'power1.in' }, 0.25)
        .to(axis, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'bounce.out' });
    });
    // Extra: hover nudges it off-balance for a moment
    k.on(btn, 'pointerenter', () => !reducedMotion && !tl?.isActive() && gsap.fromTo(axis, { rotationY: 0 }, { keyframes: { rotationY: [10, -6, 3, 0] }, duration: 0.6, transformPerspective: 400 }));
    return () => k.destroy();
  },
};
