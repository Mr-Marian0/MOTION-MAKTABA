/** Wave Toast: the toast surfs in on a sine wave, rising and dipping as it travels in from the side, the swells shrinking until it rides level into place. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Wave Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Periodic', 'Reversible'],
  effect: ['Sinusoidal-motion', 'Sliding', 'Swaying'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Position', 'Rotation'],
  description: 'A toast that rides in on a wave. It travels in from the right along a sine curve, rising and dipping and tilting with the slope of the wave, and the swells shrink as it nears its spot so it arrives riding level. Dismissing sends it back out on the same wave.',
  params: [
    { key: 'swell', label: 'Wave height', group: 'Shape', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'em', default: 1.5, live: true },
    { key: 'waves', label: 'Waves', group: 'Shape', type: 'range', min: 1, max: 5, step: 0.5, unit: '', default: 2.5, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-wvt', `<div class="sp-ov__toast sp-wvt__toast" role="status"><i></i><span>Synced to the cloud</span></div>`, { label: 'Sync', scrim: false, title: 'Notebook' }));
    const toast = k.$('.sp-wvt__toast');
    const s = k.track({ u: 1 }); // 1 = far out on the right, 0 = in place
    gsap.set(toast, { autoAlpha: 0 });
    // Position along the wave: x falls off linearly, y is a sine whose height shrinks to 0 at the end.
    const draw = () => {
      const ph = s.u * p.waves * Math.PI * 2;
      const amp = p.swell * s.u;
      gsap.set(toast, { x: `${s.u * 22}em`, y: `${Math.sin(ph) * amp}em`, rotation: -Math.cos(ph) * amp * 6 });
    };
    toggle(k, gsap, { reducedMotion }, (open) => gsap.timeline()
      .set(toast, { autoAlpha: 1 })
      .fromTo(s, { u: open ? 1 : 0 }, { u: open ? 0 : 1, duration: p.time, ease: open ? 'power2.out' : 'power2.in', onUpdate: draw })
      .set(toast, { autoAlpha: open ? 1 : 0 }),
    ['Sync', 'Dismiss']);
    return () => k.destroy();
  },
};
