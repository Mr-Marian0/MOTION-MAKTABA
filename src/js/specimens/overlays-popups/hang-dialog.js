/** Hang Dialog: the dialog descends from the top of the page on two strings like a shop sign being lowered, sways to a stop, and is hoisted back up when closed. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Hang Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Anchored', 'Oscillating', 'Reversible'],
  effect: ['Descending', 'Swaying', 'Rising'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Position', 'Rotation'],
  description: 'A "we\'re closed" dialog lowered like a shop sign. It descends slowly from the top of the page on two strings, stops with a small dip, and sways back and forth before hanging still. Closing hoists it back up out of sight.',
  params: [
    { key: 'time', label: 'Lowering time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'sway', label: 'Sway', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: '°', default: 5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sign'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-hng', `
      <div class="sp-hng__rig"><i class="sp-hng__string sp-hng__string--l"></i><i class="sp-hng__string sp-hng__string--r"></i>
        <div class="sp-ov__card sp-hng__sign" role="dialog" aria-label="Closed for the holidays"><span class="sp-ov__kick">Sorry</span><b class="sp-ov__title">Closed 24–26 Dec</b><span class="sp-ov__text">Orders ship again on the 27th.</span></div>
      </div>`, { label: 'Store hours', title: 'Shop' }));
    const rig = k.$('.sp-hng__rig');
    gsap.set(rig, { yPercent: -110, transformOrigin: '50% 0%' });
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline()
          .to(rig, { yPercent: 0, duration: p.time, ease: 'power1.inOut' })
          .to(rig, { y: '0.5em', duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' })
          .to(rig, { keyframes: { rotation: [p.sway, -p.sway * 0.7, p.sway * 0.4, -p.sway * 0.2, 0] }, duration: 1.6, ease: 'sine.inOut' }, '<')
      : gsap.timeline().to(rig, { rotation: 0, yPercent: -110, duration: p.time * 0.6, ease: 'power2.in' }),
    ['Store hours', 'Close']);
    return () => k.destroy();
  },
};
