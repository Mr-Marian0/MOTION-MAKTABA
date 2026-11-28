/** Top Popover: the popover drops open and its plane wobbles like a spinning top settling: its tilt circles round and round, shrinking, until it lies flat. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Top Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Physics-driven', 'Self-correcting'],
  effect: ['Nutation', 'Precession', 'Damped-oscillation'],
  purpose: ['Delight', 'Focus'],
  properties: ['Rotation', 'Depth (z)', 'Shadow'],
  description: 'A colour-picker popover that settles like a spinning top. It pops open tilted, and instead of rocking back and forth its tilt circles around: leaning left, then away, then right, then toward you, in ever smaller rings until it lies perfectly flat.',
  params: [
    { key: 'tilt', label: 'Start tilt', group: 'Motion', type: 'range', min: 5, max: 35, step: 1, unit: '°', default: 18, live: true },
    { key: 'spins', label: 'Circles', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: '', default: 4, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent'),
  ],
};

const SWATCHES = ['#111111', '#a07a52', '#3e2c1f', '#b3412e', '#4f6b4a', '#2f4a6b'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-top', `<div class="sp-ov__card sp-ov__pop sp-top__pop" role="dialog" aria-label="Pick a colour"><span class="sp-ov__kick">Ink colour</span><span class="sp-top__sw">${SWATCHES.map((c) => `<i style="background:${c}"></i>`).join('')}</span></div>`, { label: 'Colour', scrim: false, at: 'bottom', title: 'Pen settings' }));
    const pop = k.$('.sp-top__pop');
    const s = k.track({ t: 0 });
    gsap.set(pop, { autoAlpha: 0, transformPerspective: 600, transformOrigin: '50% 50%' });
    // Nutation: the tilt direction circles (cos / sin on the two axes) while its size decays to zero.
    const draw = () => {
      const a = p.tilt * (1 - s.t) ** 1.6;
      const ph = s.t * p.spins * Math.PI * 2;
      gsap.set(pop, { rotationX: Math.sin(ph) * a, rotationY: Math.cos(ph) * a });
    };
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(pop, { autoAlpha: 1, scale: 0.6, y: '1em' }, { scale: 1, y: 0, duration: 0.3, ease: 'back.out(2)' })
          .fromTo(s, { t: 0 }, { t: 1, duration: 0.5 + p.spins * 0.35, ease: 'none', onUpdate: draw }, 0)
      : gsap.timeline().to(pop, { scale: 0.6, autoAlpha: 0, rotationX: 0, rotationY: 0, duration: 0.25, ease: 'back.in(2)' }),
    ['Colour', 'Close']);
    return () => k.destroy();
  },
};
