/** Loop Toast: a celebration toast flies in from the side and turns a full loop-the-loop on the way, like a stunt plane, before levelling out in its spot. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Loop Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential'],
  effect: ['Looping-motion', 'Circling', 'Sliding'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Position', 'Rotation'],
  description: 'A "goal reached" toast with a stunt in it. It flies in from the right, and part way in it pulls up into a full vertical loop, turning with the curve like a stunt plane, then levels out and slides into its corner. Dismissing it just slips away.',
  params: [
    { key: 'radius', label: 'Loop size', group: 'Shape', type: 'range', min: 1.5, max: 6, step: 0.5, unit: 'em', default: 3.5, live: true },
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 's', default: 1.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-lpt', `<div class="sp-ov__toast sp-lpt__toast" role="status"><i></i><span>Goal reached: 30 sketches!</span></div>`, { label: 'Finish', scrim: false, title: 'Monthly goal' }));
    const toast = k.$('.sp-lpt__toast');
    const s = k.track({ u: 0 });
    gsap.set(toast, { autoAlpha: 0 });
    // u 0 → 1: straight in from the right, with a full loop between u = 0.35 and 0.75 (forward progress pauses during it).
    const draw = () => {
      const u = s.u;
      const lp = Math.min(Math.max((u - 0.35) / 0.4, 0), 1);
      const run = u < 0.35 ? u : u < 0.75 ? 0.35 : u - 0.4;
      const a = lp * Math.PI * 2;
      const x = 20 * (1 - run / 0.6) - Math.sin(a) * p.radius;
      const y = -(1 - Math.cos(a)) * p.radius;
      // Heading left and pulling up turns the toast clockwise through the loop
      gsap.set(toast, { x: `${x}em`, y: `${y}em`, rotation: (a * 180) / Math.PI });
    };
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline().set(toast, { autoAlpha: 1 }).fromTo(s, { u: 0 }, { u: 1, duration: p.time, ease: 'power1.out', onUpdate: draw })
      : gsap.timeline().to(toast, { x: '6em', autoAlpha: 0, duration: 0.35, ease: 'power2.in' }),
    ['Finish', 'Dismiss']);
    return () => k.destroy();
  },
};
