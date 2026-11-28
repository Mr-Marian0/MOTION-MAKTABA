/** Glide Sheet: the bottom sheet glides in like a sheet of paper on the air: in from the side on a shallow, banking descent, a little flare, and it settles into place. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Glide Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Inertial', 'Reversible'],
  effect: ['Gliding', 'Descending', 'Swaying'],
  purpose: ['Delight', 'Continuity'],
  properties: ['Position', 'Rotation'],
  description: 'A bottom sheet that floats in on the air like a dropped sheet of paper. It glides in from the upper left on a long, shallow, banking descent, flares up slightly just before it lands, and settles into its place at the bottom. Closing slides it straight down.',
  params: [
    { key: 'time', label: 'Glide time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'bank', label: 'Bank', group: 'Motion', type: 'range', min: 0, max: 15, step: 1, unit: '°', default: 6, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-gls', `
      <div class="sp-ov__sheet sp-gls__sheet" role="dialog" aria-label="Filters"><i class="sp-ov__grip"></i><span class="sp-ov__kick">Filters</span>
        <span class="sp-gls__chips">${['Recent', 'Paper', 'Ink', 'Tape', 'Under $20'].map((c) => `<span>${c}</span>`).join('')}</span></div>`, { label: 'Filter', title: 'Shop' }));
    const sheet = k.$('.sp-gls__sheet');
    gsap.set(sheet, { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .fromTo(sheet, { autoAlpha: 1, xPercent: -110, yPercent: -180, rotation: -p.bank }, { xPercent: 0, duration: p.time, ease: 'power1.out' })
          .to(sheet, { keyframes: { yPercent: [-60, 6, 0], easeEach: 'sine.out' }, duration: p.time, ease: 'none' }, 0)
          .to(sheet, { keyframes: { rotation: [p.bank * 0.6, -p.bank * 0.25, 0] }, duration: p.time, ease: 'sine.inOut' }, 0)
      : gsap.timeline().to(sheet, { yPercent: 110, duration: 0.4, ease: 'power2.in' }).set(sheet, { autoAlpha: 0 }),
    ['Filter', 'Done']);
    return () => k.destroy();
  },
};
