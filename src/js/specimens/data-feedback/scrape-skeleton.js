/** Scrape Skeleton: when the content arrives, a scraper blade sweeps down the placeholder card and scrapes the grey skeleton away, the real content showing behind the blade and grey curls flicking off its edge. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Scrape Skeleton',
  element: 'Skeleton',
  trigger: ['Load', 'Click'],
  behavior: ['Load-dependent', 'Sequential', 'Event-driven'],
  effect: ['Scraping', 'Sweeping', 'Scattering'],
  purpose: ['Progress', 'Continuity', 'Delight'],
  properties: ['Clip & mask', 'Position'],
  description: 'A profile card that loads behind a skeleton. While "loading" the grey placeholder blocks pulse softly. When the data arrives a scraper blade sweeps down the card from top to bottom: above the blade the skeleton is gone and the real avatar, name and text are revealed; grey curls flick off the blade\'s edge as it goes. "Reload" puts the skeleton back and loads again.',
  params: [
    { key: 'load', label: 'Load time', group: 'Behavior', type: 'range', min: 0.5, max: 5, step: 0.25, unit: 's', default: 1.75, live: true },
    { key: 'time', label: 'Scrape time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Blade'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-scs">
        <div class="sp-df__card sp-scs__card" aria-busy="true">
          <div class="sp-scs__real"><i class="sp-scs__ava"></i><div><b>Noor Haddad</b><small>Ceramicist · Leeds</small></div><p>Makes thrown stoneware and runs Tuesday evening classes for beginners.</p></div>
          <div class="sp-scs__skel" aria-hidden="true"><i class="sp-scs__ava sp-scs__g"></i><div><span class="sp-df__bone" style="width:60%"></span><span class="sp-df__bone" style="width:40%"></span></div><p><span class="sp-df__bone"></span><span class="sp-df__bone" style="width:80%"></span></p></div>
          <i class="sp-scs__blade" aria-hidden="true"></i><span class="sp-scs__curls" aria-hidden="true"></span>
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost">Reload</button>
      </div>`);
    const card = k.$('.sp-scs__card');
    const skel = k.$('.sp-scs__skel');
    const blade = k.$('.sp-scs__blade');
    const curls = k.$('.sp-scs__curls');
    let H = 100, W = 200, tl, pulse;
    k.resize(card, () => { H = card.offsetHeight; W = card.offsetWidth; });
    const curl = (y) => {
      const c = document.createElement('i');
      curls.append(c);
      const x = Math.random() * W;
      gsap.fromTo(c, { x, y, rotation: 0 }, { x: x + (Math.random() - 0.5) * 40, y: y + 10 + Math.random() * 20, rotation: (Math.random() - 0.5) * 540, autoAlpha: 0, duration: 0.6, ease: 'power2.out', onComplete: () => c.remove() });
    };
    const load = () => {
      tl?.kill(); pulse?.kill();
      card.setAttribute('aria-busy', 'true');
      gsap.set(skel, { clipPath: 'inset(0% 0 0 0)', autoAlpha: 1 });
      gsap.set(blade, { y: 0, autoAlpha: 0 });
      pulse = reducedMotion ? null : gsap.fromTo(skel.querySelectorAll('.sp-scs__g, .sp-df__bone'), { opacity: 1 }, { opacity: 0.5, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      const s = { u: 0 };
      let last = 0;
      tl = gsap.timeline({ delay: p.load, onComplete: () => card.setAttribute('aria-busy', 'false') })
        .call(() => pulse?.kill())
        .set(blade, { autoAlpha: 1 })
        .to(s, { u: 1, duration: reducedMotion ? 0 : p.time, ease: 'power1.inOut', onUpdate: () => {
          gsap.set(skel, { clipPath: `inset(${(s.u * 100).toFixed(2)}% 0 0 0)` });
          gsap.set(blade, { y: s.u * H });
          if (!reducedMotion && s.u - last > 0.08) { last = s.u; curl(s.u * H); curl(s.u * H); }
        } })
        .to(blade, { autoAlpha: 0, duration: 0.2 });
    };
    load();
    k.on(k.$('.sp-df__btn'), 'click', load);
    return () => { pulse?.kill(); k.destroy(); };
  },
};
