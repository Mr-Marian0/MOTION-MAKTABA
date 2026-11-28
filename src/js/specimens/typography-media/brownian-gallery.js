/** Brownian Gallery: a contact sheet of prints that never quite sits still: each thumbnail jostles in tiny random steps, like dust in a sunbeam; point at one and it calms and lifts, the rest keep up their restless jiggle. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Brownian Gallery',
  element: 'Gallery',
  trigger: ['Idle', 'Hover', 'Focus'],
  behavior: ['Randomized', 'Continuous', 'Hover-dependent'],
  effect: ['Brownian-motion', 'Jittering', 'Levitation'],
  purpose: ['Delight', 'Focus'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A loose contact sheet of eight prints. Left alone, every print jostles on the spot in small random steps (each step a new random push, so they wander a little and drift back, like particles in Brownian motion), giving the table a restless, alive feel. Point at a print or tab to it and it alone settles, straightens and lifts up; leave and it rejoins the jostle.',
  params: [
    { key: 'jiggle', label: 'Jostle', group: 'Motion', type: 'range', min: 0.05, max: 0.6, step: 0.05, unit: 'em', default: 0.2, live: true },
    { key: 'pace', label: 'Step time', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: 's', default: 0.3, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Lifted'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-brn">
        <div class="sp-brn__sheet" role="group" aria-label="Contact sheet">${Array.from({ length: 8 }, (_, i) => `<button type="button" class="sp-tm__frame sp-brn__print" aria-label="Print ${i + 1}">${photo(i, 'sp-brn__img')}</button>`).join('')}</div>
      </div>`);
    const prints = k.$$('.sp-brn__print');
    const held = new Set();
    // A random walk with a weak pull home: each step adds a random kick to the current offset
    const pos = prints.map(() => ({ x: 0, y: 0, r: 0 }));
    const step = (el, i) => {
      if (held.has(el)) return;
      const q = pos[i], j = p.jiggle;
      q.x = q.x * 0.6 + (Math.random() - 0.5) * 2 * j;
      q.y = q.y * 0.6 + (Math.random() - 0.5) * 2 * j;
      q.r = q.r * 0.6 + (Math.random() - 0.5) * 6 * j;
      gsap.to(el, { x: `${q.x}em`, y: `${q.y}em`, rotation: q.r * 10, duration: p.pace, ease: 'sine.inOut', onComplete: () => step(el, i) });
    };
    // Lite mode: half the prints jostle, the rest rest
    if (!reducedMotion) prints.forEach((el, i) => (!lite || i % 2 === 0) && gsap.delayedCall(Math.random() * p.pace, () => step(el, i)));
    const lift = (el, i, on) => {
      if (on) {
        held.add(el);
        gsap.to(el, { x: 0, y: '-0.3em', rotation: 0, scale: 1.12, zIndex: 5, duration: 0.3, ease: 'back.out(2)', overwrite: true });
      } else {
        held.delete(el);
        gsap.to(el, { scale: 1, zIndex: 1, duration: 0.3, overwrite: true, onComplete: () => !reducedMotion && (!lite || i % 2 === 0) && step(el, i) });
      }
    };
    prints.forEach((el, i) => {
      ['pointerenter', 'focus'].forEach((ev) => k.on(el, ev, () => lift(el, i, true)));
      ['pointerleave', 'blur'].forEach((ev) => k.on(el, ev, () => !el.matches(':hover, :focus') && lift(el, i, false)));
    });
    return () => k.destroy();
  },
};
