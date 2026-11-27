/** Deflate Plan: cancelling the plan lets the air out of its card: it hisses, sags, wrinkles and slumps; keeping the plan pumps it back up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Deflate Plan',
  element: 'Pricing card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Reversible', 'Elastic'],
  effect: ['Deflation', 'Wobbling', 'Springing'],
  purpose: ['Feedback', 'Storytelling'],
  properties: ['Scale', 'Radius', 'Color', 'Shadow'],
  description: 'A plan card that takes cancelling personally. Press Cancel and air hisses out of its corner: the card sags from the top, goes soft and wrinkled, loses its colour and slumps low. "Keep plan" pumps it back up with a bounce.',
  params: [
    { key: 'slump', label: 'Slump', group: 'Shape', type: 'range', min: 0.3, max: 0.8, step: 0.05, unit: '', default: 0.55, live: true },
    { key: 'leak', label: 'Leak time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.2, unit: 's', default: 1.6, live: true },
    tone('#2f4a6b'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-dfl">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-dfl__card">
            <span class="sp-cc__kick sp-dfl__state" aria-live="polite">Your plan</span>
            <b class="sp-cc__title">Studio</b>
            <div><b class="sp-cc__big">$12</b><span class="sp-cc__text"> / month</span></div>
            <span class="sp-cc__text">Unlimited boards · 50 GB · priority help</span>
            <i class="sp-dfl__wrinkles"></i>
          </article>
          <span class="sp-dfl__hiss" aria-hidden="true"><i></i><i></i><i></i></span>
        </div>
        <button type="button" class="sp-cc__btn sp-dfl__btn">Cancel plan</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-dfl__card');
    const hiss = k.$$('.sp-dfl__hiss i');
    const state = k.$('.sp-dfl__state');
    const btn = k.$('.sp-dfl__btn');
    k.fit(wrap, 0.8);
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(card, { '--sag': 0, transformOrigin: '50% 100%' });
    gsap.set(hiss, { autoAlpha: 0 });
    let flat = false;
    let tl;

    k.on(btn, 'click', () => {
      flat = !flat;
      tl?.kill();
      btn.textContent = flat ? 'Keep plan' : 'Cancel plan';
      state.textContent = flat ? 'Cancelled · ends 30 Nov' : 'Your plan';
      tl = gsap.timeline();
      if (flat) {
        // Air hisses out of the corner while the card sags and slumps
        tl.fromTo(hiss, { autoAlpha: 1, x: 0, y: 0, scaleX: 0.3 }, { autoAlpha: 0, x: '1.6em', y: '-1em', scaleX: 1, duration: d(0.5), stagger: { each: d(0.12), repeat: reducedMotion ? 0 : Math.round(p.leak / 0.5) }, ease: 'power1.out' }, 0)
          .to(card, { '--sag': 1, scaleY: 1 - p.slump, scaleX: 1 + p.slump * 0.12, duration: d(p.leak), ease: 'power1.in' }, 0)
          .to(card, { keyframes: { skewX: [0, -3, 2, -1, 0] }, duration: d(p.leak), ease: 'none' }, 0)
          .to(card, { scaleY: 1 - p.slump * 1.08, duration: d(0.15), ease: 'power2.in' })
          .to(card, { scaleY: 1 - p.slump, duration: d(0.6), ease: 'elastic.out(1, 0.3)' });
      } else {
        gsap.set(hiss, { autoAlpha: 0 });
        tl.to(card, { scaleY: 1 - p.slump * 0.9, duration: d(0.1) })
          .to(card, { '--sag': 0, scaleY: 1, scaleX: 1, skewX: 0, duration: d(0.9), ease: 'elastic.out(1, 0.4)' });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
