/** Dissolve Dismiss: dismissing a news card dissolves it away through a noise pattern with a glowing rim; Undo brings it back the same way. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Dissolve Dismiss',
  element: 'Content card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Reversible', 'Procedural', 'Toggle-dependent'],
  effect: ['Dissolving', 'Disintegration'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Clip & mask', 'Opacity', 'Color'],
  description: 'A news card that dissolves when dismissed. Holes open in a cloudy noise pattern and spread until nothing is left, each edge glowing in the accent colour as it eats in. Undo runs it backwards and the card condenses out of the noise.',
  params: [
    { key: 'grain', label: 'Grain', group: 'Shape', type: 'range', min: 0.01, max: 0.12, step: 0.005, unit: '', default: 0.04, live: true },
    { key: 'rim', label: 'Glow rim', group: 'Shape', type: 'range', min: 0, max: 4, step: 0.25, unit: '', default: 1.5, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 's', default: 1.3, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Glow'),
  ],
};

const SLOPE = 10;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('dis');
    k.html(`
      <div class="sp sp-cc sp-dis">
        <svg class="sp-dis__defs" aria-hidden="true"><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="2" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="n" />
          <feComponentTransfer in="n" result="keep"><feFuncA class="sp-dis__a" type="linear" slope="${SLOPE}" intercept="1" /></feComponentTransfer>
          <feComponentTransfer in="n" result="near"><feFuncA class="sp-dis__b" type="linear" slope="${SLOPE}" intercept="1" /></feComponentTransfer>
          <feFlood style="flood-color: var(--sp-accent)" />
          <feComposite in2="near" operator="in" />
          <feComposite in2="SourceGraphic" operator="in" result="rim" />
          <feComposite in="SourceGraphic" in2="keep" operator="in" result="card" />
          <feMerge><feMergeNode in="rim" /><feMergeNode in="card" /></feMerge>
        </filter></svg>
        <div class="sp-cc__wrap sp-dis__wrap">
          <span class="sp-dis__gone">Dismissed</span>
          <article class="sp-cc__card">
            <span class="sp-cc__kick">News · 2h ago</span>
            <i class="sp-cc__img"></i>
            <b class="sp-cc__title">Paper mill reopens after 40 years</b>
            <span class="sp-cc__text">The town’s old mill is making rag paper again, by hand.</span>
          </article>
        </div>
        <button type="button" class="sp-cc__btn sp-dis__btn" aria-pressed="false">Dismiss</button>
      </div>`);
    const wrap = k.$('.sp-dis__wrap');
    const card = k.$('.sp-dis__wrap .sp-cc__card');
    const turb = k.$('feTurbulence');
    const [fa, fb] = k.$$('.sp-dis__a, .sp-dis__b');
    const gone = k.$('.sp-dis__gone');
    const btn = k.$('.sp-dis__btn');
    k.fit(wrap, 0.8);
    const s = k.track({ t: 0 });
    gsap.set(gone, { autoAlpha: 0 });

    // t = 0: all there; t = 1.15: all gone. The rim threshold runs slightly ahead of the cut.
    const draw = () => {
      turb.setAttribute('baseFrequency', p.grain);
      fa.setAttribute('intercept', (1 - SLOPE * s.t).toFixed(3));
      fb.setAttribute('intercept', (1 - SLOPE * s.t + p.rim).toFixed(3));
      card.style.filter = s.t > 0 ? `url(#${id})` : '';
    };
    draw();

    k.on(btn, 'click', () => {
      const out = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(out));
      btn.textContent = out ? 'Undo' : 'Dismiss';
      gsap.to(s, { t: out ? 1.15 : 0, duration: reducedMotion ? 0 : p.time, ease: out ? 'power1.in' : 'power1.out', onUpdate: draw, overwrite: true });
      gsap.to(gone, { autoAlpha: out ? 1 : 0, duration: 0.4, delay: out && !reducedMotion ? p.time * 0.7 : 0 });
    });

    return () => k.destroy();
  },
};
