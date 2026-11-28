/** Heli Popover: the popover is carried in by a little propeller: the rotor spins up on the button, lifts the popover off and flies it to its spot, then spins down and folds away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Heli Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Propeller-motion', 'Hovering', 'Accelerating', 'Decelerating'],
  purpose: ['Delight', 'Branding'],
  properties: ['Rotation', 'Position', 'Scale'],
  description: 'A popover airlifted into place. A tiny rotor on top of it spins up until the blades blur, lifts it off the button and flies it over to its spot with a little sway, hovers, then the rotor winds down and folds away. Closing spins the rotor up again and it lifts off out of sight.',
  params: [
    { key: 'rpm', label: 'Top speed', group: 'Motion', type: 'range', min: 2, max: 12, step: 1, unit: 'rev/s', default: 7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Rotor'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-hel', `
      <div class="sp-ov__pop sp-hel__pop" role="dialog" aria-label="Delivery">
        <div class="sp-hel__rotor" aria-hidden="true"><i class="sp-hel__mast"></i><i class="sp-hel__blades"></i></div>
        <div class="sp-ov__card"><span class="sp-ov__kick">Delivery</span><b class="sp-ov__title">Arrives Thursday</b><span class="sp-ov__text">Tracked, signed for at the door.</span></div>
      </div>`, { label: 'Track', scrim: false, at: 'bottom', title: 'Orders' }));
    const pop = k.$('.sp-hel__pop');
    const rotor = k.$('.sp-hel__rotor');
    const blades = k.$('.sp-hel__blades');
    gsap.set(pop, { autoAlpha: 0 });
    // The rotor: an endless spin whose speed (timeScale) we wind up and down.
    const spin = gsap.to(blades, { rotation: 360, duration: 1, ease: 'none', repeat: -1, paused: true });
    k.track(spin);
    const speed = (to, d) => gsap.to(spin, { timeScale: to, duration: reducedMotion ? 0 : d, ease: 'power1.inOut', onStart: () => spin.play(), onComplete: () => !to && spin.pause() });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .set(pop, { autoAlpha: 1, x: '-8em', y: '6em', scale: 0.5, rotation: 0 })
          .set(rotor, { scaleX: 1, autoAlpha: 1 })
          .add(speed(p.rpm, 0.5))
          .to(pop, { y: '2em', scale: 0.7, duration: 0.4, ease: 'power2.in' }, '+=0.1')
          .to(pop, { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power2.inOut' })
          .to(pop, { keyframes: { rotation: [-6, 4, -2, 0] }, duration: 0.9 }, '<')
          .add(speed(0, 0.8))
          .to(rotor, { scaleX: 0.15, autoAlpha: 0, duration: 0.3 }, '-=0.2')
      : gsap.timeline()
          .set(rotor, { scaleX: 1, autoAlpha: 1 })
          .add(speed(p.rpm, 0.4))
          .to(pop, { y: '-12em', rotation: 8, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, '+=0.1')
          .add(speed(0, 0.1)),
    ['Track', 'Close']);
    return () => { spin.kill(); k.destroy(); };
  },
};
