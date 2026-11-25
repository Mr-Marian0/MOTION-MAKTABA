/** Heart Burst: the heart squashes, pops and throws paper confetti when liked. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Heart Burst',
  element: 'Icon button',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reactive', 'Randomized'],
  effect: ['Inflation', 'Squashing', 'Scattering', 'Particle-trail'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Scale', 'Color', 'Position'],
  description: 'A like button. The heart squashes, inflates past full size and scatters a ring of paper confetti. Clicking again deflates it quietly.',
  params: [
    { key: 'count', label: 'Confetti', group: 'Motion', type: 'range', min: 0, max: 16, step: 1, default: 9, live: true },
    { key: 'spread', label: 'Spread', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.5, unit: 'em', default: 2.5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Heart color'),
  ],
};

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.1 1.7-1.9 3.1-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-heart">
        <button type="button" class="sp-heart__btn" aria-pressed="false" aria-label="Like">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART}"/></svg>
        </button>
        <p class="sp-note">Click the heart</p>
      </div>`);
    const btn = k.$('button');
    const svg = k.$('svg');

    k.on(btn, 'click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      if (reducedMotion) return;
      if (!on) return gsap.fromTo(svg, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.timeline()
        .to(svg, { scaleX: 1.2, scaleY: 0.75, duration: 0.1 })
        .to(svg, { scale: 1.35, duration: 0.15, ease: 'power2.out' })
        .to(svg, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      // Paper confetti: created, flown, removed.
      for (let i = 0; i < p.count; i++) {
        const bit = document.createElement('i');
        bit.className = 'sp-heart__bit';
        btn.append(bit);
        const a = (i / p.count) * Math.PI * 2 + gsap.utils.random(-0.3, 0.3);
        gsap.fromTo(bit, { x: 0, y: 0, scale: 1, rotation: 0 }, {
          x: `${Math.cos(a) * p.spread}em`, y: `${Math.sin(a) * p.spread}em`,
          rotation: gsap.utils.random(-180, 180), scale: 0, duration: gsap.utils.random(0.6, 0.9), ease: 'power3.out',
          onComplete: () => bit.remove(),
        });
      }
    });

    return () => k.destroy();
  },
};
