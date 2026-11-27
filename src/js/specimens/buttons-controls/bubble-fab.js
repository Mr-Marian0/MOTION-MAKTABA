/** Bubble FAB: frosted squares float out like bubbles and keep rocking gently, while the circles inside them stay upright. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Bubble FAB',
  element: 'FAB',
  trigger: ['Load', 'Click', 'Keyboard'],
  behavior: ['Looping', 'Oscillating', 'Activation-dependent', 'Staggered'],
  effect: ['Rotating', 'Floating', 'Drifting', 'Scattering', 'Springing'],
  purpose: ['Delight', 'Hierarchy', 'Decoration'],
  properties: ['Rotation', 'Position', 'Scale', 'Opacity'],
  description: 'The button wears a slowly turning dashed ring. Opening it lets frosted square actions float out with a scatter of little bubbles. Each square keeps rocking in a loop while the circle inside stays upright, and the bubbles drift.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Chat, Call, Mail' },
    { key: 'rock', label: 'Rock angle', group: 'Motion', type: 'range', min: 0, max: 30, step: 1, unit: '°', default: 12 },
    { key: 'ring', label: 'Ring lap', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: 's', default: 9 },
    tone('#2f4a6b'),
  ],
};

// Where each square settles, in em from the button center (x right, y up), and its resting tilt.
const SPOTS = [[0.6, 5.6, 14], [4.8, 3.6, -12], [5.2, -0.3, 20], [2.4, 7.6, -8]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Chat', 'Call']).slice(0, SPOTS.length);
    const R = gsap.utils.random;
    k.html(`
      <div class="sp sp-fabx sp-bub">
        <div class="sp-fabx__hub">
          ${'<i class="sp-bub__dot"></i>'.repeat(9)}
          ${acts.map((a) => `<button type="button" class="sp-bub__act" aria-label="${esc(a)}"><span class="sp-bub__in">${esc(a[0])}</span></button>`).join('')}
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i><span class="sp-bub__ring"></span></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const items = k.$$('.sp-bub__act');
    const ins = k.$$('.sp-bub__in');
    const dots = k.$$('.sp-bub__dot');
    const em = parseFloat(getComputedStyle(items[0]).fontSize);
    gsap.set([...items, ...dots], { scale: 0, autoAlpha: 0 });
    if (!reducedMotion) gsap.to(k.$('.sp-bub__ring'), { rotation: 360, duration: Number(p.ring), repeat: -1, ease: 'none' });

    const idle = () => {
      const a = Number(p.rock);
      items.forEach((b, i) => {
        const cfg = { duration: R(1.4, 2), repeat: -1, yoyo: true, ease: 'sine.inOut' };
        gsap.to(b, { rotation: `+=${a}`, y: `-=${R(3, 7)}`, ...cfg });
        gsap.to(ins[i], { rotation: `-=${a}`, ...cfg }); // counter-turn keeps the circle upright
      });
      dots.forEach((d) => gsap.to(d, { x: `+=${R(-6, 6)}`, y: `-=${R(6, 14)}`, duration: R(1.5, 2.6), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    };

    fabToggle(k, gsap, k.$('.sp-fabx__main'), items, (open) => {
      gsap.killTweensOf([...items, ...ins, ...dots]);
      if (!open) {
        return gsap.timeline()
          .to(dots, { x: 0, y: 0, scale: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
          .to(items.slice().reverse(), { x: 0, y: 0, rotation: -120, scale: 0, autoAlpha: 0, duration: 0.35, stagger: 0.05, ease: 'power3.in' }, 0)
          .to(ins, { rotation: 120, duration: 0.35, ease: 'power3.in' }, 0);
      }
      const tl = gsap.timeline({ onComplete: () => !reducedMotion && idle() });
      items.forEach((b, i) => {
        const [x, y, tilt] = SPOTS[i];
        tl.fromTo(b, { x: 0, y: 0, rotation: -120, scale: 0, autoAlpha: 0 }, { x: x * em, y: -y * em, rotation: tilt, scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.7)' }, i * 0.08)
          .fromTo(ins[i], { rotation: 120 }, { rotation: -tilt, duration: 0.7, ease: 'back.out(1.7)' }, '<');
      });
      dots.forEach((d) => tl.fromTo(d, { x: 0, y: 0, scale: 0, autoAlpha: 0 }, { x: R(-0.5, 7) * em, y: -R(-0.5, 7.5) * em, scale: R(0.5, 1.3), autoAlpha: 1, duration: R(0.5, 0.9), ease: 'expo.out' }, R(0, 0.25)));
      return tl;
    }, reducedMotion);

    return () => k.destroy();
  },
};
