/** Piston Dialog: the dialog is jacked up out of the page by two pistons working in turn: chunk, chunk, chunk, a stroke at a time, until it locks in place. Closing lowers it the same way. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Piston Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Alternating', 'Discrete'],
  effect: ['Piston-motion', 'Mechanical-motion', 'Rising', 'Vibrating'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Position', 'Size'],
  description: 'A dialog lifted into place by machinery. Two pistons under it pump in turn, each stroke jacking it up another step with a mechanical clunk and a shudder, until it locks at full height in the middle of the page. Closing lets the pistons back down stroke by stroke.',
  params: [
    { key: 'strokes', label: 'Strokes', group: 'Motion', type: 'range', min: 2, max: 8, step: 1, unit: '', default: 4, live: true },
    { key: 'stroke', label: 'Stroke time', group: 'Motion', type: 'range', min: 0.08, max: 0.5, step: 0.02, unit: 's', default: 0.2, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Pistons'),
  ],
};

const RISE = 14; // em the dialog travels up

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-pst', `
      <div class="sp-pst__rig">
        <div class="sp-ov__card sp-pst__dialog" role="dialog" aria-label="Reset workspace?"><b class="sp-ov__title">Reset workspace?</b><span class="sp-ov__text">Panels go back to their default places.</span><span class="sp-ov__actions"><span class="sp-ov__btn">Reset</span></span></div>
        <span class="sp-pst__piston sp-pst__piston--l"><i class="sp-pst__rod"></i><i class="sp-pst__body"></i></span>
        <span class="sp-pst__piston sp-pst__piston--r"><i class="sp-pst__rod"></i><i class="sp-pst__body"></i></span>
      </div>`, { label: 'Reset', title: 'Workspace' }));
    const rig = k.$('.sp-pst__rig');
    const dialog = k.$('.sp-pst__dialog');
    const rods = k.$$('.sp-pst__rod');
    const s = k.track({ h: 0 }); // 0 = down in the floor, 1 = locked up
    const draw = () => {
      gsap.set(dialog, { y: `${(1 - s.h) * RISE}em` });
      rods.forEach((r) => gsap.set(r, { scaleY: 0.08 + s.h * 0.92 }));
    };
    draw();
    gsap.set(rig, { autoAlpha: 0 });
    toggle(k, gsap, { reducedMotion }, (open) => {
      const n = Math.round(p.strokes);
      const tl = gsap.timeline().set(rig, { autoAlpha: 1 });
      // One step per stroke; the two pistons take turns, so the dialog tilts slightly toward the one pushing.
      for (let i = 1; i <= n; i++) {
        const to = open ? i / n : 1 - i / n;
        const side = i % 2 ? 1 : -1;
        tl.to(s, { h: to, duration: p.stroke, ease: 'power3.out', onUpdate: draw })
          .to(dialog, { rotation: side * 1.5, duration: p.stroke * 0.5 }, '<')
          .to(dialog, { rotation: 0, duration: p.stroke * 0.5 })
          .to(rig, { keyframes: { x: [1, -1, 0] }, duration: 0.08, ease: 'none' }, '<');
      }
      if (!open) tl.set(rig, { autoAlpha: 0 });
      return tl;
    }, ['Reset', 'Cancel']);
    return () => k.destroy();
  },
};
