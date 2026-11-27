/** Inflate Cheer: each cheer pumps air into the profile card: it puffs up rounder and shinier, and once full it floats up and bobs like a balloon. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Inflate Cheer',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Elastic', 'Floating', 'Reversible'],
  effect: ['Inflation', 'Anticipation-motion', 'Bobbing', 'Levitation'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Scale', 'Radius', 'Shadow', 'Color'],
  description: 'Cheer someone on and their card fills with air. Every cheer is one pump: a quick suck-in, then the card swells rounder, softer and shinier. On the last pump it lifts off and bobs like a balloon until you let the air out.',
  params: [
    { key: 'pumps', label: 'Pumps to full', group: 'Behavior', type: 'range', min: 1, max: 5, step: 1, unit: '', default: 3, live: true },
    { key: 'grow', label: 'Swell', group: 'Size', type: 'range', min: 0.05, max: 0.35, step: 0.05, unit: '×', default: 0.2, live: true },
    tone('#b3412e'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-inf">
        <div class="sp-cc__wrap sp-inf__wrap">
          <article class="sp-cc__card sp-inf__card">
            <i class="sp-cc__avatar">AR</i>
            <b class="sp-cc__title">Ana Reyes</b>
            <span class="sp-cc__kick">Motion designer</span>
            <span class="sp-cc__text sp-inf__count" aria-live="polite">0 cheers</span>
            <i class="sp-inf__sheen"></i>
            <i class="sp-inf__string"></i>
          </article>
        </div>
        <button type="button" class="sp-cc__btn sp-inf__btn">Cheer</button>
      </div>`);
    const wrap = k.$('.sp-inf__wrap');
    const card = k.$('.sp-inf__card');
    const str = k.$('.sp-inf__string');
    const count = k.$('.sp-inf__count');
    const btn = k.$('.sp-inf__btn');
    k.fit(wrap, 0.66);
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(card, { '--puff': 0 });
    gsap.set(str, { scaleY: 0 });
    let air = 0;
    let cheers = 0;
    let bob;

    const fillTo = (a, dur, ease) => gsap.to(card, { '--puff': a, scale: 1 + a * p.grow, duration: d(dur), ease });

    k.on(btn, 'click', () => {
      const full = Math.round(p.pumps);
      if (air >= 1) {
        // Let the air out
        air = 0;
        bob?.kill();
        btn.textContent = 'Cheer';
        gsap.to(card, { y: 0, rotation: 0, duration: d(0.6), ease: 'power2.out' });
        gsap.to(str, { scaleY: 0, duration: d(0.3) });
        fillTo(0, 0.9, 'elastic.out(1, 0.35)');
        return;
      }
      cheers += 1;
      count.textContent = `${cheers} cheer${cheers === 1 ? '' : 's'}`;
      air = Math.min(1, air + 1 / full);
      // A pump: quick suck-in, then swell
      gsap.timeline()
        .to(card, { scale: `-=0.04`, duration: d(0.08), ease: 'power2.in' })
        .add(fillTo(air, 0.8, 'elastic.out(1, 0.4)'));
      if (air >= 1) {
        btn.textContent = 'Let air out';
        gsap.to(str, { scaleY: 1, duration: d(0.5), delay: d(0.4) });
        if (!reducedMotion) {
          bob = gsap.timeline({ delay: 0.4 })
            .to(card, { y: '-2.2em', duration: 0.9, ease: 'power2.out' })
            .to(card, { y: '-2.8em', rotation: 2, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }
      }
    });

    return () => { bob?.kill(); k.destroy(); };
  },
};
