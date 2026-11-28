/** Streak Sheet: the bottom sheet shoots up so fast it leaves speed lines: streaks trail below it, longer and stronger the faster it moves, and vanish as it slows to a stop. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Streak Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Velocity-aware', 'Reversible'],
  effect: ['Velocity-streak', 'Motion-smear', 'Decelerating'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A bottom sheet with speed lines. It shoots up from the bottom edge and brakes to a stop; while it moves, streaks trail behind it whose length and strength follow its actual speed each frame, so they are longest at the start and shrink to nothing as it settles. Closing streaks it back down.',
  params: [
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.45, live: true },
    { key: 'gain', label: 'Streak length', group: 'Shape', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '×', default: 2, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-stk', `
      <div class="sp-ov__sheet sp-stk__sheet" role="dialog" aria-label="Quick actions">
        <div class="sp-stk__streaks" aria-hidden="true"><span>${'<i></i>'.repeat(3)}</span><span>${'<i></i>'.repeat(3)}</span></div>
        <i class="sp-ov__grip"></i><span class="sp-ov__kick">Quick actions</span>
        <span class="sp-stk__acts">${['New board', 'Upload', 'Invite'].map((a) => `<span>${a}</span>`).join('')}</span>
      </div>`, { label: 'Actions', title: 'Home' }));
    const sheet = k.$('.sp-stk__sheet');
    const lines = k.$$('.sp-stk__streaks i');
    gsap.set(sheet, { yPercent: 105 });
    gsap.set(lines, { scaleY: 0, transformOrigin: '50% 0%' });
    let last = 105;
    // Speed lines follow the sheet's speed this frame (in % of its height per frame).
    const streak = () => {
      const y = gsap.getProperty(sheet, 'yPercent');
      const v = Math.abs(y - last);
      last = y;
      const len = Math.min(v * p.gain * 0.25, 3);
      lines.forEach((l, i) => gsap.set(l, { scaleY: len * (0.6 + ((i * 37) % 10) / 25), autoAlpha: Math.min(v / 4, 1) }));
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      last = gsap.getProperty(sheet, 'yPercent');
      return gsap.timeline()
        .to(sheet, { yPercent: open ? 0 : 105, duration: p.time, ease: open ? 'expo.out' : 'expo.in', onUpdate: streak })
        .set(lines, { scaleY: 0 });
    }, ['Actions', 'Close']);
    return () => k.destroy();
  },
};
