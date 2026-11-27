/** Melt Sale: hover the summer-sale card and its glaze melts: drips run down over the card and drops fall off the bottom. Leave and it sets again. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Melt Sale',
  element: 'Product card',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Reversible', 'Gravity-driven', 'Staggered'],
  effect: ['Melting', 'Liquid-morphing', 'Dropping'],
  purpose: ['Delight', 'Branding', 'Affordance'],
  properties: ['Shape', 'Size', 'Position'],
  description: 'A summer-sale card topped with a coloured glaze. Hover and the heat gets to it: the glaze softens and runs down in uneven drips that merge like real liquid, and drops break off the bottom and fall. Move away and it sets again, drips drawing back up. Click to keep it melting.',
  params: [
    { key: 'time', label: 'Melt time', group: 'Motion', type: 'range', min: 0.6, max: 4, step: 0.2, unit: 's', default: 1.8, live: true },
    { key: 'run', label: 'Drip length', group: 'Shape', type: 'range', min: 3, max: 14, step: 0.5, unit: 'em', default: 9, live: true },
    { key: 'goo', label: 'Thickness', group: 'Shape', type: 'range', min: 0.3, max: 1, step: 0.05, unit: 'em', default: 0.55, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Glaze'),
  ],
};

// [left %, width em, how far it runs 0..1, delay 0..1]
const DRIPS = [[8, 1.3, 0.55, 0.1], [22, 2, 0.9, 0], [38, 1.1, 0.4, 0.3], [52, 1.7, 1, 0.15], [68, 1.2, 0.6, 0.25], [84, 1.8, 0.8, 0.05]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('melt');
    k.html(`
      <div class="sp sp-cc sp-mlt">
        <svg class="sp-mlt__defs" aria-hidden="true"><filter id="${id}" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter></svg>
        <button type="button" class="sp-cc__wrap sp-mlt__wrap" aria-pressed="false" aria-label="Summer sale card: hover or press to melt">
          <span class="sp-cc__card sp-mlt__card">
            <i class="sp-cc__img sp-mlt__img"><i></i></i>
            <b class="sp-cc__title">Summer Sale</b>
            <span class="sp-cc__text">Ice-pop moulds, set of six</span>
            <span class="sp-cc__row"><b class="sp-cc__price">$9 <s>$15</s></b><span class="sp-cc__btn">Shop</span></span>
          </span>
          <span class="sp-mlt__goo" style="filter:url(#${id}) drop-shadow(0.12em 0.12em 0 var(--color-ink))">
            <i class="sp-mlt__glaze"></i>
            ${DRIPS.map(([x, w]) => `<i class="sp-mlt__drip" style="left:${x}%;width:${w}em"></i>`).join('')}
            ${DRIPS.map(([x, w]) => `<i class="sp-mlt__drop" style="left:calc(${x}% + ${w / 2 - 0.4}em)"></i>`).join('')}
          </span>
        </button>
      </div>`);
    const wrap = k.$('.sp-mlt__wrap');
    const card = k.$('.sp-mlt__card');
    const blur = k.$('feGaussianBlur');
    const drips = k.$$('.sp-mlt__drip');
    const drops = k.$$('.sp-mlt__drop');
    k.fit(wrap, 0.92);
    k.resize(wrap, () => blur.setAttribute('stdDeviation', (p.goo * parseFloat(getComputedStyle(wrap).fontSize) * 0.9).toFixed(1)));
    const s = k.track({ m: 0 });
    let locked = false;
    let rain;

    const draw = () => {
      drips.forEach((el, i) => {
        const [, , run, delay] = DRIPS[i];
        const t = Math.max(0, Math.min(1, (s.m - delay * 0.4) / 0.6));
        el.style.height = `${1.2 + t * run * p.run}em`;
      });
      gsap.set(card, { scaleY: 1 + s.m * 0.03, transformOrigin: '50% 0%' });
    };
    draw();
    // Drops break off the longest drips while it is fully melted.
    const drip = () => {
      const i = [1, 3, 5][Math.floor(Math.random() * 3)];
      const from = 1.2 + DRIPS[i][2] * p.run;
      gsap.fromTo(drops[i], { y: `${from}em`, scale: 1, autoAlpha: 1 }, { y: `${from + 6}em`, scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'power2.in' });
    };
    const heat = (on) => {
      rain?.kill();
      gsap.to(s, { m: on ? 1 : 0, duration: reducedMotion ? 0 : on ? p.time : p.time * 0.5, ease: on ? 'power1.in' : 'power2.out', onUpdate: draw, overwrite: true,
        onComplete: () => on && !reducedMotion && (rain = gsap.timeline({ repeat: -1 }).add(drip).to({}, { duration: 0.6 })) });
    };

    k.on(wrap, 'pointerenter', () => !locked && heat(true));
    k.on(wrap, 'focus', () => !locked && heat(true));
    k.on(wrap, 'pointerleave', () => !locked && heat(false));
    k.on(wrap, 'blur', () => !locked && heat(false));
    k.on(wrap, 'click', () => {
      locked = !locked;
      wrap.setAttribute('aria-pressed', String(locked));
      if (locked) heat(true);
    });

    return () => { rain?.kill(); k.destroy(); };
  },
};
