/** Unwrap Hero: the hero arrives wrapped like a parcel. Unwrap it: the string slides off, then the four paper flaps fold back from the middle to reveal the launch underneath. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Unwrap Hero',
  element: 'Hero section',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Staggered', 'Reversible', 'Toggle-dependent'],
  effect: ['Unwrapping', 'Wrapping', 'Axial-rotation', 'Sliding'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Rotation', 'Position', 'Depth (z)', 'Clip & mask'],
  description: 'A product launch hero that arrives as a wrapped parcel tied with string. Unwrap it and the string slides off, then the four kraft flaps fold back from the middle one after another to reveal the launch underneath. Wrap it up again to tuck it away.',
  params: [
    { key: 'time', label: 'Unwrap time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'stagger', label: 'Flap stagger', group: 'Motion', type: 'range', min: 0, max: 0.4, step: 0.05, unit: 's', default: 0.15, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'String'),
  ],
};

// Each flap is a triangle from an edge to the centre; it folds back on that edge.
const FLAPS = [
  ['t', '0 0, 100% 0, 50% 52%', '50% 0%', 'rotationX', -1],
  ['r', '100% 0, 100% 100%, 48% 50%', '100% 50%', 'rotationY', -1],
  ['b', '0 100%, 100% 100%, 50% 48%', '50% 100%', 'rotationX', 1],
  ['l', '0 0, 0 100%, 52% 50%', '0% 50%', 'rotationY', 1],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-unw">
        <div class="sp-pn__center sp-unw__reveal"><span class="sp-pn__kick">Just launched</span><b class="sp-pn__h">The Folio Pad</b><span class="sp-pn__btn">Pre-order</span></div>
        <div class="sp-unw__wrap">
          ${FLAPS.map(([id, pts]) => `<i class="sp-unw__flap sp-unw__flap--${id}" style="clip-path:polygon(${pts})"></i>`).join('')}
          <i class="sp-unw__string sp-unw__string--h"></i><i class="sp-unw__string sp-unw__string--v"></i><i class="sp-unw__bow"></i>
        </div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-unw__btn" aria-pressed="false">Unwrap</button>
      </div>`);
    const flaps = k.$$('.sp-unw__flap');
    const strings = k.$$('.sp-unw__string, .sp-unw__bow');
    const reveal = k.$('.sp-unw__reveal');
    const btn = k.$('.sp-unw__btn');
    flaps.forEach((el, i) => gsap.set(el, { transformOrigin: FLAPS[i][2], transformPerspective: 900 }));
    gsap.set(reveal, { scale: 0.9, autoAlpha: 0 });
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(open));
      btn.textContent = open ? 'Wrap up' : 'Unwrap';
      if (!open) return tl.timeScale(1.6).reverse();
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      tl = gsap.timeline()
        // The string slides off the parcel…
        .to(k.$('.sp-unw__bow'), { rotation: 200, scale: 0, duration: t * 0.25, ease: 'back.in(2)' })
        .to(strings, { xPercent: 120, autoAlpha: 0, duration: t * 0.3, ease: 'power2.in', stagger: t * 0.05 }, '<0.1');
      // …and the flaps fold back one after another.
      const base = tl.duration();
      flaps.forEach((el, i) => tl.to(el, { [FLAPS[i][3]]: FLAPS[i][4] * 178, autoAlpha: 0.15, duration: t * 0.5, ease: 'power2.inOut' }, base + (t ? i * p.stagger : 0)));
      tl.to(reveal, { scale: 1, autoAlpha: 1, duration: t * 0.4, ease: 'back.out(1.6)' }, '-=0.3')
        .to(flaps, { autoAlpha: 0, duration: 0.2 });
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
