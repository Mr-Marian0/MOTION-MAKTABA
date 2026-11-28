/** Pop Toast: an achievement toast that, when dismissed (or when its time is up), swells and bursts into confetti-like shards that spray outward and fall. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Pop Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard', 'Idle'],
  behavior: ['Event-driven', 'Temporary', 'Randomized', 'Gravity-driven'],
  effect: ['Exploding', 'Anticipation-motion', 'Falling', 'Spinning'],
  purpose: ['Delight', 'Feedback'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Scale'],
  description: 'An achievement toast that goes out with a pop. It slides in normally; dismiss it (or wait for it to time out) and it swells for a beat, then bursts into shards that spray outward, spin and fall away like confetti.',
  params: [
    { key: 'life', label: 'Auto-dismiss after', group: 'Behavior', type: 'range', min: 0, max: 8, step: 0.5, unit: 's', default: 4, live: true },
    { key: 'force', label: 'Burst', group: 'Motion', type: 'range', min: 3, max: 16, step: 1, unit: 'em', default: 8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Badge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const toast = `<div class="sp-ov__toast sp-pop__toast"><i></i><span><b>Streak!</b> 7 days of sketching</span></div>`;
    k.html(scene('sp-pop', `<div class="sp-pop__hold" role="status">${toast}<div class="sp-cc__pieces"></div></div>`, { label: 'Check in', scrim: false, title: 'Daily sketch' }));
    const hold = k.$('.sp-pop__hold');
    const real = k.$('.sp-pop__hold > .sp-pop__toast');
    const host = k.$('.sp-cc__pieces');
    gsap.set(hold, { autoAlpha: 0 });
    let timer;
    const ui = toggle(k, gsap, { reducedMotion }, (open) => {
      timer?.kill();
      if (open) {
        host.innerHTML = '';
        if (p.life > 0) timer = gsap.delayedCall(p.life, () => ui.open && ui.set(false));
        return gsap.timeline().set(real, { autoAlpha: 1 }).fromTo(hold, { autoAlpha: 1, x: '6em' }, { x: 0, duration: 0.5, ease: 'back.out(1.8)' });
      }
      const bits = pieces(host, toast, shards(6, 2, Math.ceil(Math.random() * 99), 0.6));
      const tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') })
        .to(hold, { scale: 1.08, duration: 0.14, ease: 'power2.out' })
        .set(real, { autoAlpha: 0 })
        .set(hold, { scale: 1 });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const a = Math.atan2(cy - 50, cx - 50);
        const f = p.force * (0.5 + Math.random() * 0.7);
        tl.to(el, { x: `${Math.cos(a) * f}em`, rotation: (Math.random() - 0.5) * 720, duration: 1, ease: 'power2.out' }, '<')
          .to(el, { keyframes: { y: [`${Math.sin(a) * f * 0.6 - 2}em`, `${6 + Math.random() * 4}em`], easeEach: 'power1.inOut' }, autoAlpha: 0, duration: 1 }, '<');
      });
      return tl;
    }, ['Check in', 'Dismiss']);
    return () => { timer?.kill(); k.destroy(); };
  },
};
