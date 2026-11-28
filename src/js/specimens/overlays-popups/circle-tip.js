/** Circle Tip: hover an avatar and its name tag circles once around it, like a moon on a short orbit, then comes to rest above it; leaving sends it on round and away. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Circle Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Orbiting', 'Anchored'],
  effect: ['Circling', 'Orbiting', 'Decelerating'],
  purpose: ['Delight', 'Affordance', 'Wayfinding'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'Avatars whose name tags arrive on an orbit. Hover (or tab to) a face and its name tag swings once round it on a tight circle, slowing as it comes round, and settles directly above; move off and the tag carries on round and fades. Each avatar has its own tag.',
  params: [
    { key: 'radius', label: 'Orbit size', group: 'Shape', type: 'range', min: 2, max: 5, step: 0.25, unit: 'em', default: 3, live: true },
    { key: 'time', label: 'Orbit time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Avatars'),
  ],
};

const PEOPLE = [['AR', 'Ana Reyes'], ['BL', 'Bo Lindqvist'], ['MT', 'Mei Tanaka']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-cir">
        ${page('Who’s here', 'Board')}
        <div class="sp-cir__row">${PEOPLE.map(([i, n]) => { const id = uid('cir'); return `<span class="sp-cir__who"><button type="button" class="sp-cir__av" aria-describedby="${id}">${i}</button><span class="sp-ov__tip sp-cir__tip" id="${id}" role="tooltip">${n}</span></span>`; }).join('')}</div>
      </div>`);
    k.$$('.sp-cir__who').forEach((who) => {
      const tip = who.querySelector('.sp-cir__tip');
      const s = k.track({ a: 0 });
      gsap.set(tip, { autoAlpha: 0 });
      // a is the angle round the avatar from straight up (0); one turn ends back on top.
      const draw = () => gsap.set(tip, { x: `${Math.sin(s.a) * p.radius}em`, y: `${-Math.cos(s.a) * p.radius}em` });
      let tw;
      onHover(k, who.querySelector('.sp-cir__av'), (on) => {
        tw?.kill();
        if (reducedMotion) return gsap.set(tip, { autoAlpha: on ? 1 : 0, x: 0, y: `${-p.radius}em` });
        tw = on
          ? gsap.timeline().set(tip, { autoAlpha: 1 }).fromTo(s, { a: -Math.PI * 2 }, { a: 0, duration: p.time, ease: 'power2.out', onUpdate: draw })
          : gsap.timeline().to(s, { a: Math.PI * 0.7, duration: p.time * 0.5, ease: 'power1.in', onUpdate: draw }).to(tip, { autoAlpha: 0, duration: 0.15 }, '-=0.15');
      });
    });
    return () => k.destroy();
  },
};
