/** Launch Icon: a "ship it" rocket icon: press it and the rocket rumbles, lifts off slowly, then accelerates out of the top of its tile on a puff of smoke, and a fresh rocket rises back onto the pad. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Launch Icon',
  element: 'Icon',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Event-driven', 'Sequential', 'Momentum-driven'],
  effect: ['Launching', 'Accelerating', 'Vibrating'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A deploy button whose icon is a little rocket. Press it and the rocket shakes on the pad, then lifts off: slow at first, faster and faster, out through the top of the tile, leaving puffs of smoke that billow and fade. Moments later a new rocket rises into place. Hovering makes the rocket tremble, ready to go.',
  params: [
    { key: 'time', label: 'Climb time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Flame'),
  ],
};

const ROCKET = '<svg viewBox="0 0 24 24"><path d="M12 2c3 2 5 6 5 10l-2 5H9l-2-5c0-4 2-8 5-10z"/><circle cx="12" cy="9" r="2"/><path d="M9 17l-3 3 4-1M15 17l3 3-4-1"/></svg>';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-lci">
        <button type="button" class="sp-tm__icon sp-lci__tile" aria-label="Deploy"><span class="sp-lci__rocket">${ROCKET}<i class="sp-lci__flame"></i></span><span class="sp-lci__smoke" aria-hidden="true"></span></button>
        <small class="sp-lci__msg" aria-live="polite">Deploy</small>
      </div>`);
    const tile = k.$('.sp-lci__tile');
    const rocket = k.$('.sp-lci__rocket');
    const flame = k.$('.sp-lci__flame');
    const smoke = k.$('.sp-lci__smoke');
    const msg = k.$('.sp-lci__msg');
    gsap.set(flame, { scaleY: 0, transformOrigin: '50% 0%' });
    let tl;
    k.on(tile, 'click', () => {
      if (tl?.isActive()) return;
      msg.textContent = 'Deploying…';
      if (reducedMotion) return (msg.textContent = 'Deployed');
      const puff = () => {
        const s = document.createElement('i');
        smoke.append(s);
        gsap.fromTo(s, { x: (Math.random() - 0.5) * 12, scale: 0.4, autoAlpha: 0.8 }, { x: `+=${(Math.random() - 0.5) * 24}`, y: 6, scale: 2, autoAlpha: 0, duration: 0.9, ease: 'power2.out', onComplete: () => s.remove() });
      };
      tl = gsap.timeline()
        .to(rocket, { keyframes: { x: [-1, 1, -1, 1, 0] }, duration: 0.3, ease: 'none' })
        .to(flame, { scaleY: 1, duration: 0.15 }, 0.1)
        .call(puff).call(puff, null, '+=0.08').call(puff, null, '+=0.08')
        .to(rocket, { y: '-4em', duration: p.time, ease: 'expo.in' }, 0.3)
        .call(() => (msg.textContent = 'Deployed'))
        .set(rocket, { y: '1.5em' })
        .set(flame, { scaleY: 0 })
        .to(rocket, { y: 0, duration: 0.45, ease: 'back.out(1.8)' }, '+=0.25');
    });
    // Extra: hover makes the rocket tremble on the pad
    k.on(tile, 'pointerenter', () => !reducedMotion && !tl?.isActive() && gsap.fromTo(rocket, { x: 0 }, { keyframes: { x: [-0.6, 0.6, -0.4, 0] }, duration: 0.25, ease: 'none' }));
    return () => k.destroy();
  },
};
