/** Water Popover: the hydration popover is a glass of water: it pops up with the water sloshing from the jolt, waves running back and forth across the surface until it calms; adding a glass raises the level with a splash. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Water Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Physics-driven'],
  effect: ['Water-motion', 'Damped-oscillation', 'Swaying', 'Rising'],
  purpose: ['Progress', 'Feedback', 'Delight'],
  properties: ['Path', 'Size', 'Rotation'],
  description: 'A hydration popover that holds actual water. It pops up out of its button with a jolt that sets the water sloshing: the surface tips back and forth and waves run across it, dying down until it lies flat. "+1 glass" raises the level, which splashes and settles again.',
  params: [
    { key: 'slosh', label: 'Slosh', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: '', default: 10, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-wtr', `
      <div class="sp-ov__card sp-ov__pop sp-wtr__pop" role="dialog" aria-label="Hydration">
        <div class="sp-wtr__glass"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path /></svg><b class="sp-wtr__val" aria-live="polite"></b></div>
        <button type="button" class="sp-ov__btn sp-wtr__add">+1 glass</button>
      </div>`, { label: 'Water', scrim: false, at: 'bottom', title: 'Today' }));
    const pop = k.$('.sp-wtr__pop');
    const path = k.$('.sp-wtr__glass path');
    const val = k.$('.sp-wtr__val');
    gsap.set(pop, { autoAlpha: 0, transformOrigin: '20% 100%' });
    let glasses = 5;
    const s = k.track({ level: 0.62, tilt: 0, wave: 0, ph: 0 });
    // Surface: a tilt (sloshing to one side) plus a travelling ripple, around the current level
    const draw = () => {
      const top = 100 - s.level * 100;
      path.setAttribute('d', `M0 100 L${Array.from({ length: 21 }, (_, i) => `${i * 5} ${(top + (i / 20 - 0.5) * s.tilt + Math.sin(i * 0.7 - s.ph) * s.wave).toFixed(2)}`).join(' L')} L100 100 Z`);
      val.textContent = `${glasses} / 8`;
    };
    draw();
    const slosh = (amt) => {
      if (reducedMotion) return draw();
      gsap.timeline({ onUpdate: draw })
        .fromTo(s, { tilt: amt * 2 }, { tilt: 0, duration: 2.2, ease: 'elastic.out(1, 0.2)' }, 0)
        .fromTo(s, { wave: amt * 0.4 }, { wave: 0, duration: 2, ease: 'power2.out' }, 0)
        .fromTo(s, { ph: 0 }, { ph: 18, duration: 2.2, ease: 'none' }, 0);
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (open) slosh(p.slosh);
      return open
        ? gsap.timeline().fromTo(pop, { autoAlpha: 1, y: '2em', scale: 0.5 }, { y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' })
        : gsap.timeline().to(pop, { y: '2em', scale: 0.5, autoAlpha: 0, duration: 0.25, ease: 'back.in(2)' });
    }, ['Water', 'Close']);
    k.on(k.$('.sp-wtr__add'), 'click', () => {
      glasses = Math.min(8, glasses + 1);
      gsap.to(s, { level: 0.12 + (glasses / 8) * 0.8, duration: reducedMotion ? 0 : 0.6, ease: 'power2.out', onUpdate: draw });
      slosh(p.slosh * 0.7);
    });
    return () => k.destroy();
  },
};
