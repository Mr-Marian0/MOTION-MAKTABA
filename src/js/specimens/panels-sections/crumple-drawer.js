/** Crumple Drawer: dismissing the bottom sheet scrunches it into a paper ball that bounces away; opening it slides a fresh sheet up. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards, crumpled } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Crumple Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Gravity-driven', 'Randomized'],
  effect: ['Crumpling', 'Bouncing', 'Rolling'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Clip & mask', 'Scale', 'Rotation', 'Position'],
  description: 'A bottom sheet you throw away like scrap paper. "Not now" scrunches the sheet from its edges into a creased ball, which drops, bounces and rolls off the page; the dimming lifts. Opening it again slides a fresh, flat sheet up.',
  params: [
    { key: 'creases', label: 'Creases', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4, live: true },
    { key: 'crush', label: 'Crush time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.1, unit: 's', default: 0.5, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Sheet'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const sheet = `
      <div class="sp-pn__sheet sp-crd__sheet">
        <i class="sp-crd__grip"></i>
        <span class="sp-pn__kick">Newsletter</span>
        <b class="sp-crd__title">A letter, once a month</b>
        <span class="sp-crd__text">New designs and the odd essay. No spam, unsubscribe any time.</span>
        <span class="sp-crd__row"><button type="button" class="sp-pn__btn">Subscribe</button><button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-crd__dismiss">Not now</button></span>
      </div>`;
    k.html(`
      <div class="sp sp-pn sp-crd">
        <div class="sp-pn__page"><span class="sp-pn__kick">Blog</span><b class="sp-pn__h">Paper engineering</b>${bars(6)}</div>
        <i class="sp-crd__dim"></i>
        <div class="sp-crd__wrap">${sheet}<div class="sp-cc__pieces"></div></div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-crd__open" hidden>Open sheet</button>
      </div>`);
    const wrap = k.$('.sp-crd__wrap');
    const real = k.$('.sp-crd__wrap > .sp-crd__sheet');
    const host = k.$('.sp-cc__pieces');
    const dim = k.$('.sp-crd__dim');
    const open = k.$('.sp-crd__open');
    const dismiss = k.$('.sp-crd__dismiss');
    let seed = 3;
    let tl;

    k.on(dismiss, 'click', () => {
      if (tl?.isActive()) return;
      const g = Math.round(p.creases);
      // The crumpling copies are pictures of the sheet, so their buttons become plain spans.
      const bits = pieces(host, sheet.replace(/<button type="button"/g, '<span').replace(/<\/button>/g, '</span>'), shards(g + 2, g, seed++, 0.7));
      gsap.set(real, { autoAlpha: 0 });
      gsap.set(host, { x: 0, y: 0, rotation: 0, autoAlpha: 1 });
      tl = gsap.timeline({ onComplete: () => { host.innerHTML = ''; open.hidden = false; open.focus(); } });
      bits.forEach((b) => tl.to(b.el, { ...crumpled(b), duration: p.crush, ease: 'power3.in' }, (1 - Math.hypot(b.c[0] - 50, b.c[1] - 50) / 70) * p.crush * 0.4));
      // The ball drops, bounces and rolls off to the right
      tl.to(dim, { autoAlpha: 0, duration: 0.4 }, '<')
        .to(host, { y: '3em', duration: 0.35, ease: 'power2.in' })
        .to(host, { keyframes: { y: ['1.5em', '3em', '2.5em', '3em'] }, x: '30em', rotation: 540, duration: 1.1, ease: 'none' })
        .to(host, { autoAlpha: 0, duration: 0.1 }, '-=0.1');
      if (reducedMotion) tl.progress(1);
    });
    k.on(open, 'click', () => {
      open.hidden = true;
      gsap.set(real, { autoAlpha: 1 });
      dismiss.focus();
      gsap.fromTo(wrap, { yPercent: 110 }, { yPercent: 0, duration: reducedMotion ? 0 : 0.6, ease: 'expo.out' });
      gsap.to(dim, { autoAlpha: 1, duration: 0.4 });
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
