/** Break Bar: a class pass shaped like a chocolate bar. Each click snaps the end piece off along its groove; the price adds up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Break Bar',
  element: 'Pricing card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Discrete', 'Gravity-driven', 'State-dependent'],
  effect: ['Breaking', 'Bending', 'Falling', 'Anticipation-motion', 'Shaking'],
  purpose: ['Feedback', 'Delight', 'Progress'],
  properties: ['Rotation', 'Position', 'Opacity'],
  description: 'A class pass made like a chocolate bar. "Break one off" bends the end piece down along its groove, it cracks and snaps free, and falls away while the total ticks up. Rewrap to start over.',
  params: [
    { key: 'cols', label: 'Pieces', group: 'Content', type: 'range', min: 4, max: 8, step: 1, unit: '', default: 6 },
    { key: 'price', label: 'Price each', group: 'Content', type: 'range', min: 5, max: 20, step: 1, unit: '$', default: 9, live: true },
    { key: 'bend', label: 'Bend before snap', group: 'Motion', type: 'range', min: 0, max: 50, step: 5, unit: '°', default: 30, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Chocolate'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Number(p.cols);
    k.html(`
      <div class="sp sp-cc sp-brk">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-brk__card">
            <span class="sp-cc__kick">Class pass · break what you need</span>
            <div class="sp-brk__bar" style="--n:${n}">${Array.from({ length: n }, (_, i) => `<i class="sp-brk__piece"><b>${i + 1}</b></i>`).join('')}</div>
            <div class="sp-cc__row">
              <span class="sp-cc__text" aria-live="polite"><b class="sp-cc__price sp-brk__total">$0</b> · <span class="sp-brk__count">0 classes</span></span>
            </div>
            <div class="sp-cc__btns">
              <button type="button" class="sp-cc__btn sp-brk__snap">Break one off</button>
              <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-brk__wrap">Rewrap</button>
            </div>
          </article>
        </div>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const parts = k.$$('.sp-brk__piece');
    const snap = k.$('.sp-brk__snap');
    k.fit(wrap, 0.86);
    const d = (t) => (reducedMotion ? 0 : t);
    let taken = 0;
    let tl;

    const tally = () => {
      k.$('.sp-brk__total').textContent = `$${taken * p.price}`;
      k.$('.sp-brk__count').textContent = `${taken} class${taken === 1 ? '' : 'es'}`;
      snap.disabled = taken >= n;
    };
    tally();

    k.on(snap, 'click', () => {
      if (taken >= n || tl?.isActive()) return;
      const piece = parts[n - 1 - taken];
      taken += 1;
      tally();
      gsap.set(piece, { transformOrigin: '0% 50%', transformPerspective: 400 });
      tl = gsap.timeline()
        // Anticipation: the end bends down along its groove…
        .to(piece, { rotationY: -p.bend, duration: d(0.35), ease: 'power2.in' })
        // …cracks…
        .to(piece, { keyframes: { x: [2, -2, 1, 0] }, duration: d(0.12), ease: 'none' })
        // …and snaps free, falling away
        .to(piece, { rotationY: -p.bend * 1.6, rotation: 25, x: '1.2em', duration: d(0.18), ease: 'power3.out' })
        .to(piece, { y: '9em', rotation: 120, duration: d(0.7), ease: 'power2.in' })
        .to(piece, { autoAlpha: 0, duration: d(0.2) }, '>-0.25')
        .fromTo(k.$('.sp-brk__total'), { scale: 1.3 }, { scale: 1, duration: d(0.4), ease: 'back.out(3)' }, d(0.55));
    });

    k.on(k.$('.sp-brk__wrap'), 'click', () => {
      tl?.kill();
      const back = parts.slice(n - taken);
      taken = 0;
      tally();
      gsap.set(back, { clearProps: 'transform', autoAlpha: 0 });
      gsap.fromTo(back, { x: '3em', autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: d(0.45), stagger: d(0.06), ease: 'back.out(2)' });
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
