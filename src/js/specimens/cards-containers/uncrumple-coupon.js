/** Uncrumple Coupon: a discount arrives as a crumpled paper ball. Click it and it opens out flat into a pricing coupon, creases and all. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards, crumpled } from './_pieces.js';
import { seeded } from './_shape.js';

export const meta = {
  title: 'Uncrumple Coupon',
  element: 'Pricing card',
  trigger: ['Load', 'Click', 'Keyboard'],
  behavior: ['Sequential', 'Staggered', 'Gravity-driven', 'Event-driven'],
  effect: ['Uncrumpling', 'Dropping', 'Bouncing', 'Unfolding'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Clip & mask', 'Rotation', 'Scale', 'Color'],
  description: 'A discount that arrives as a crumpled paper ball: it drops in and bounces. Click it and it opens out from the middle, folds springing flat one after another, into a pricing coupon that keeps its creases.',
  params: [
    { key: 'creases', label: 'Creases', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4 },
    { key: 'open', label: 'Open time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const g = Math.round(p.creases);
    const cuts = shards(g, g, 21, 0.7);
    const creases = cuts.map((pts) => `<polygon points="${pts.map((pt) => pt.join(',')).join(' ')}" />`).join('');
    k.html(`
      <div class="sp sp-cc sp-unc">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-unc__card">
            <span class="sp-cc__kick">Coupon · this week only</span>
            <b class="sp-cc__big">20% off</b>
            <span class="sp-cc__text">Any yearly plan, first year</span>
            <div class="sp-cc__row"><code class="sp-unc__code">PAPER20</code><span class="sp-cc__btn">Apply</span></div>
            <svg class="sp-unc__creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${creases}</svg>
          </article>
          <button type="button" class="sp-unc__ball sp-cc__pieces" aria-label="Open the paper ball"></button>
        </div>
        <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-unc__again">Crumple again</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-unc__card');
    const ball = k.$('.sp-unc__ball');
    const again = k.$('.sp-unc__again');
    k.fit(wrap, 0.8);
    let bits = [];
    let tl;

    const arrive = () => {
      tl?.kill();
      const r = seeded(7);
      gsap.set(card, { autoAlpha: 1 }); // the pieces are copies of the card, so it must be visible when copied
      bits = pieces(ball, card.outerHTML, cuts);
      bits.forEach((b) => gsap.set(b.el, crumpled(b, r)));
      gsap.set(card, { autoAlpha: 0 });
      ball.disabled = false;
      again.hidden = true;
      tl = gsap.timeline()
        .fromTo(ball, { y: '-12em', rotation: -200 }, { y: 0, rotation: 0, duration: 0.8, ease: 'bounce.out' })
        .to(ball, { keyframes: { rotation: [8, -6, 0] }, duration: 0.8, repeat: -1, repeatDelay: 1.2 });
      if (reducedMotion) tl.progress(0.5).pause();
    };

    k.on(ball, 'click', () => {
      if (ball.disabled) return;
      ball.disabled = true;
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { gsap.set(card, { autoAlpha: 1 }); ball.innerHTML = ''; again.hidden = false; } })
        .to(ball, { rotation: 0, duration: p.open * 0.3, ease: 'power2.out' });
      // Folds spring open from the middle out
      bits.forEach((b) => {
        const far = Math.hypot(b.c[0] - 50, b.c[1] - 50) / 70;
        tl.to(b.el, { xPercent: 0, yPercent: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1, filter: 'brightness(1)', duration: p.open, ease: 'back.out(1.4)' }, p.open * (0.15 + far * 0.45));
      });
      if (reducedMotion) tl.progress(1);
    });
    k.on(again, 'click', arrive);
    arrive();

    return () => { tl?.kill(); k.destroy(); };
  },
};
