/** Melt Hero: "Read on" melts the hero: its lower edge drips down over the page in heavy runs, then it all drains away to uncover the article. */
import { kit, uid, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Melt Hero',
  element: 'Hero section',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Gravity-driven', 'Reversible', 'Staggered'],
  effect: ['Melting', 'Liquid-morphing', 'Descending'],
  purpose: ['Storytelling', 'Continuity', 'Delight'],
  properties: ['Shape', 'Size', 'Position'],
  description: 'A hero made of something that melts. Press "Read on" and its lower edge softens into heavy drips that run down over the page at different speeds, merging like wax; then the whole hero drains away downward, uncovering the article. Set it again to re-form it.',
  params: [
    { key: 'time', label: 'Melt time', group: 'Motion', type: 'range', min: 0.8, max: 4, step: 0.2, unit: 's', default: 1.8, live: true },
    { key: 'goo', label: 'Thickness', group: 'Shape', type: 'range', min: 0.4, max: 1.2, step: 0.05, unit: 'em', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Hero'),
  ],
};

const DRIPS = [[6, 2.2, 0.7], [17, 1.4, 0.4], [27, 2.6, 1], [40, 1.6, 0.55], [52, 2.2, 0.85], [64, 1.3, 0.35], [74, 2.4, 0.95], [87, 1.8, 0.6]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('mlh');
    k.html(`
      <div class="sp sp-pn sp-mlh">
        <svg class="sp-mlh__defs" aria-hidden="true"><filter id="${id}" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter></svg>
        <article class="sp-pn__page sp-mlh__article"><span class="sp-pn__kick">Essay</span><b class="sp-pn__h">On wax and paper</b>${bars(7)}</article>
        <div class="sp-mlh__hero">
          <div class="sp-mlh__goo" style="filter:url(#${id})"><i class="sp-mlh__slab"></i>${DRIPS.map(([x, w]) => `<i class="sp-mlh__drip" style="left:${x}%;width:${w}em"></i>`).join('')}</div>
          <div class="sp-mlh__copy"><span class="sp-pn__kick">Issue 12</span><b class="sp-mlh__title">Slow Things</b></div>
        </div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-mlh__btn">Read on</button>
      </div>`);
    const hero = k.$('.sp-mlh__hero');
    const drips = k.$$('.sp-mlh__drip');
    const copy = k.$('.sp-mlh__copy');
    const btn = k.$('.sp-mlh__btn');
    const blur = k.$('feGaussianBlur');
    k.resize(stage, () => blur.setAttribute('stdDeviation', (p.goo * parseFloat(getComputedStyle(hero).fontSize)).toFixed(1)));
    gsap.set(drips, { scaleY: 0 });
    let melted = false;
    let tl;

    k.on(btn, 'click', () => {
      melted = !melted;
      btn.textContent = melted ? 'Set it again' : 'Read on';
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      if (melted) {
        tl = gsap.timeline()
          .to(drips, { scaleY: (i) => DRIPS[i][2], duration: t * 0.6, ease: 'power1.in', stagger: { each: t * 0.04, from: 'random' } })
          .to(copy, { y: '1.5em', autoAlpha: 0, duration: t * 0.3, ease: 'power2.in' }, t * 0.3)
          .to(hero, { yPercent: 115, duration: t * 0.5, ease: 'power2.in' });
      } else {
        tl = gsap.timeline()
          .set(drips, { scaleY: 0 })
          .fromTo(hero, { yPercent: -100 }, { yPercent: 0, duration: t * 0.4, ease: 'bounce.out' })
          .to(copy, { y: 0, autoAlpha: 1, duration: t * 0.25 });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
