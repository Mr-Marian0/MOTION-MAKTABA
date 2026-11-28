/** Disperse Toast: dismissing the toast breaks it into fine grains that spread out in every direction, drifting apart and thinning like ink diffusing in water. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Disperse Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard', 'Idle'],
  behavior: ['Event-driven', 'Randomized', 'Temporary'],
  effect: ['Dispersion', 'Disintegration', 'Drifting'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Clip & mask', 'Position', 'Opacity', 'Scale'],
  description: 'A toast that disperses rather than disappears. When dismissed (or after a few seconds) it breaks into fine grains that spread outward in every direction from where it was, drifting apart, wandering a little and thinning out, like a drop of ink spreading through water.',
  params: [
    { key: 'spread', label: 'Spread', group: 'Motion', type: 'range', min: 2, max: 12, step: 1, unit: 'em', default: 6, live: true },
    { key: 'life', label: 'Auto-dismiss after', group: 'Behavior', type: 'range', min: 0, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const toast = '<div class="sp-ov__toast sp-dsp__toast"><i></i><span>Link copied to clipboard</span></div>';
    k.html(scene('sp-dsp', `<div class="sp-dsp__hold" role="status">${toast}<div class="sp-cc__pieces"></div></div>`, { label: 'Copy link', scrim: false, title: 'Share' }));
    const hold = k.$('.sp-dsp__hold');
    const real = k.$('.sp-dsp__hold > .sp-dsp__toast');
    const host = k.$('.sp-cc__pieces');
    gsap.set(hold, { autoAlpha: 0 });
    let timer;
    const ui = toggle(k, gsap, { reducedMotion }, (open) => {
      timer?.kill();
      if (open) {
        host.innerHTML = '';
        if (p.life) timer = gsap.delayedCall(p.life, () => ui.open && ui.set(false));
        return gsap.timeline().set(real, { autoAlpha: 1 }).fromTo(hold, { autoAlpha: 1, y: '2em' }, { y: 0, duration: 0.4, ease: 'back.out(1.6)' });
      }
      const grains = pieces(host, toast, grid(16, 3)).map((b) => b.el);
      const tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') }).set(real, { autoAlpha: 0 });
      grains.forEach((g) => {
        const a = Math.random() * Math.PI * 2;
        const r = p.spread * (0.3 + Math.random() * 0.7);
        tl.to(g, { x: `${Math.cos(a) * r}em`, y: `${Math.sin(a) * r * 0.6}em`, rotation: (Math.random() - 0.5) * 180, scale: 0.3, autoAlpha: 0, duration: 1.2 + Math.random() * 0.6, ease: 'power2.out' }, Math.random() * 0.15);
      });
      return tl;
    }, ['Copy link', 'Dismiss']);
    return () => { timer?.kill(); k.destroy(); };
  },
};
