/** Assemble Footer: when the footer scrolls into view it builds itself from loose shapes (circles, bars, a band) that fly in and lock together, then the words appear. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Assemble Footer',
  element: 'Footer',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Randomized'],
  effect: ['Shape-assembly', 'Spinning', 'Convergence'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Shape', 'Position', 'Rotation', 'Scale'],
  description: 'A footer that builds itself as it scrolls into view. Its parts start as loose shapes (a band, a logo disc, link bars, social dots) that spin in from all sides and lock into place, then the real words fade in over the bars.',
  params: [
    { key: 'scatter', label: 'Scatter', group: 'Layout', type: 'range', min: 4, max: 20, step: 1, unit: 'em', default: 12 },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0.02, max: 0.2, step: 0.01, unit: 's', default: 0.06 },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Footer'),
  ],
};

const COLS = [['Shop', 'Pads', 'Inks', 'Tapes'], ['Studio', 'About', 'Journal', 'Jobs'], ['Help', 'Shipping', 'Returns', 'Contact']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-asf">
        <div class="sp-pn__page"><span class="sp-pn__kick">End of page</span>${bars(4)}</div>
        <footer class="sp-asf__foot">
          <i class="sp-asf__part sp-asf__band"></i>
          <div class="sp-asf__brand"><i class="sp-asf__part sp-asf__logo"></i><b class="sp-asf__word">Maktaba</b></div>
          ${COLS.map((c) => `<ul class="sp-asf__col">${c.map((t, i) => `<li><i class="sp-asf__part sp-asf__bar${i ? '' : ' sp-asf__bar--head'}"></i><span class="sp-asf__word">${t}</span></li>`).join('')}</ul>`).join('')}
          <div class="sp-asf__dots">${'<i class="sp-asf__part sp-asf__dot"></i>'.repeat(3)}</div>
        </footer>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-asf__btn">Rebuild</button>
      </div>`);
    const parts = k.$$('.sp-asf__part');
    const words = k.$$('.sp-asf__word');
    const barsEl = k.$$('.sp-asf__bar');
    let tl;
    const build = () => {
      tl?.kill();
      const r = () => (Math.random() - 0.5) * 2;
      gsap.set(parts, { x: () => `${r() * p.scatter}em`, y: () => `${-Math.random() * p.scatter}em`, rotation: () => r() * 220, scale: 0.4, autoAlpha: 0 });
      gsap.set(words, { autoAlpha: 0 });
      gsap.set(barsEl, { autoAlpha: 1 });
      tl = gsap.timeline()
        .to(parts, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.65, ease: 'back.out(1.5)', stagger: p.stagger })
        .to(barsEl, { autoAlpha: 0, duration: 0.25, stagger: 0.02 }, '-=0.1')
        .to(words, { autoAlpha: 1, duration: 0.35, stagger: 0.02 }, '<');
      if (reducedMotion) tl.progress(1);
    };
    gsap.set([...parts, ...words], { autoAlpha: 0 });
    k.inView(stage, () => !tl && build(), 0.5);
    k.on(k.$('.sp-asf__btn'), 'click', build);

    return () => { tl?.kill(); k.destroy(); };
  },
};
