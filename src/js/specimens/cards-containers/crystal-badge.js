/** Crystal Badge: claiming the achievement grows a crystal over the widget: facets form outward from a seed point, nearest first, then it glints. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, radial } from './_pieces.js';
import { seeded } from './_shape.js';

export const meta = {
  title: 'Crystal Badge',
  element: 'Widget',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Staggered', 'Cascading', 'Procedural', 'Reversible'],
  effect: ['Crystallization', 'Expansion', 'Shimmering'],
  purpose: ['Feedback', 'Delight', 'Branding'],
  properties: ['Clip & mask', 'Scale', 'Color', 'Opacity'],
  description: 'An achievement widget. Press Claim and a crystal grows over it from a seed near the middle: facet after facet forms outward, nearest first, each a slightly different shade, until the whole widget is one cut crystal. Then light glints across it and the tier is engraved on top.',
  params: [
    { key: 'facets', label: 'Facets', group: 'Shape', type: 'range', min: 6, max: 20, step: 1, unit: '', default: 12, live: true },
    { key: 'grow', label: 'Growth time', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Crystal'),
  ],
};

const SEED = [50, 58];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-cry">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-cry__card">
            <span class="sp-cc__kick">Achievement</span>
            <b class="sp-cc__title">100 days of sketching</b>
            <span class="sp-cc__text">You drew every day since March. Claim your badge.</span>
            <i class="sp-cry__seed"></i>
          </article>
          <div class="sp-cc__pieces sp-cry__crystal"></div>
          <i class="sp-cry__clip"><i class="sp-cry__glint"></i></i>
          <div class="sp-cry__tier" aria-live="polite"><span class="sp-cc__kick">Tier unlocked</span><b>Crystal</b></div>
        </div>
        <button type="button" class="sp-cc__btn sp-cry__btn" aria-pressed="false">Claim</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const host = k.$('.sp-cry__crystal');
    const glint = k.$('.sp-cry__glint');
    const tier = k.$('.sp-cry__tier');
    const seed = k.$('.sp-cry__seed');
    const btn = k.$('.sp-cry__btn');
    k.fit(wrap, 0.86);
    gsap.set([glint, tier], { autoAlpha: 0 });
    let tl;

    k.on(btn, 'click', () => {
      const claim = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(claim));
      btn.textContent = claim ? 'Reset' : 'Claim';
      if (!claim) return tl.timeScale(2.5).reverse();
      tl?.kill();
      const r = seeded(Math.round(p.facets) * 7);
      const facets = pieces(host, '<i class="sp-cry__facet"></i>', radial(SEED[0], SEED[1], Math.round(p.facets), 3, Math.round(p.facets)));
      // Each facet a slightly different cut of the same colour, lit from the top left
      facets.forEach(({ el }) => {
        const shade = Math.round(r() * 55);
        el.firstChild.style.background = `linear-gradient(${Math.round(r() * 360)}deg, color-mix(in srgb, var(--sp-accent) ${30 + shade}%, white), color-mix(in srgb, var(--sp-accent) ${70 + shade * 0.5}%, black))`;
        el.style.transformOrigin = `${SEED[0]}% ${SEED[1]}%`;
      });
      const far = (c) => Math.hypot(c[0] - SEED[0], c[1] - SEED[1]);
      const order = [...facets].sort((a, b) => far(a.c) - far(b.c));
      tl = gsap.timeline()
        .fromTo(seed, { scale: 0, autoAlpha: 1 }, { scale: 1.6, duration: 0.25, ease: 'back.out(3)' })
        .fromTo(order.map((f) => f.el), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: p.grow * 0.35, ease: 'back.out(1.6)', stagger: (p.grow * 0.65) / order.length }, '<0.1')
        .to(seed, { autoAlpha: 0, duration: 0.2 }, '<')
        .fromTo(glint, { autoAlpha: 1, xPercent: -150 }, { xPercent: 420, duration: 0.8, ease: 'power2.inOut' })
        .fromTo(tier, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<0.2');
      if (reducedMotion) tl.progress(1);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
