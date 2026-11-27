/** Dive Hero: "Dive in" sends the headline off a springboard: it crouches, springs up, and dives head-first into the water at the foot of the hero with a splash and rings. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Dive Hero',
  element: 'Hero section',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Gravity-driven', 'Reversible'],
  effect: ['Diving', 'Anticipation-motion', 'Ripple-deformation', 'Bobbing'],
  purpose: ['Storytelling', 'Delight', 'Navigation'],
  properties: ['Position', 'Rotation', 'Scale', 'Opacity'],
  description: 'A summer-camp hero with a pool at its foot. Press "Dive in" and the headline crouches, springs up off the board and dives head-first in an arc into the water, which throws up a splash and spreads rings. "Surface" bobs it back up.',
  params: [
    { key: 'height', label: 'Spring height', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'time', label: 'Dive time', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-div">
        <span class="sp-pn__kick sp-div__kick">Lakeside camp · July</span>
        <b class="sp-div__word">Jump in</b>
        <i class="sp-div__board"></i>
        <div class="sp-div__water"><i class="sp-div__ring"></i><i class="sp-div__ring"></i></div>
        <div class="sp-div__splash" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-div__btn">Dive in</button>
      </div>`);
    const word = k.$('.sp-div__word');
    const rings = k.$$('.sp-div__ring');
    const drops = k.$$('.sp-div__splash i');
    const btn = k.$('.sp-div__btn');
    gsap.set(rings, { scale: 0, autoAlpha: 0 });
    gsap.set(drops, { autoAlpha: 0 });
    let under = false;
    let tl;

    k.on(btn, 'click', () => {
      under = !under;
      btn.textContent = under ? 'Surface' : 'Dive in';
      tl?.kill();
      if (reducedMotion) return gsap.set(word, { autoAlpha: under ? 0 : 1 });
      const t = p.time;
      tl = gsap.timeline();
      if (under) {
        tl.to(word, { scaleY: 0.75, scaleX: 1.1, transformOrigin: '50% 100%', duration: 0.2, ease: 'power2.out' })
          // Spring up, then head-first down into the water (offsets in the headline's own big em: ÷ 4.2)
          .to(word, { y: `${-p.height / 4.2}em`, scaleY: 1.1, scaleX: 0.95, duration: t * 0.35, ease: 'power2.out' })
          .to(word, { y: '2.4em', x: '0.8em', rotation: 160, scaleX: 0.9, scaleY: 1.05, transformOrigin: '50% 50%', duration: t * 0.6, ease: 'power2.in' })
          .to(word, { autoAlpha: 0, duration: 0.08 }, '-=0.08')
          // Splash and rings
          .fromTo(drops, { x: 0, y: 0, autoAlpha: 1 }, { keyframes: { y: ['-3em', '0.5em'] }, x: (i) => `${(i - 3) * 1.1}em`, autoAlpha: 0, duration: 0.8, ease: 'power1.out', stagger: 0.02 }, '<')
          .fromTo(rings, { scale: 0.2, autoAlpha: 1 }, { scale: 3, autoAlpha: 0, duration: 1.4, ease: 'power2.out', stagger: 0.3 }, '<');
      } else {
        tl.set(word, { x: 0, y: '1.5em', rotation: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 })
          .to(word, { y: 0, duration: 0.8, ease: 'back.out(1.4)' })
          .to(word, { keyframes: { y: ['-0.08em', '0em', '-0.04em', '0em'] }, duration: 1.2, ease: 'sine.inOut' });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
