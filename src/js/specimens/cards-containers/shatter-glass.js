/** Shatter Glass: a promo card behind a pane of glass. Click the glass: it shatters from that spot and the shards fall away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, radial } from './_pieces.js';

export const meta = {
  title: 'Shatter Glass',
  element: 'Content card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Position-aware', 'Gravity-driven', 'Randomized', 'Event-driven'],
  effect: ['Shattering', 'Free-fall', 'Tumbling', 'Shaking'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Opacity'],
  description: 'A promo card sealed behind glass. Click anywhere on the pane: it cracks from that exact spot into shards that spin and fall away, and the offer pops forward.',
  params: [
    { key: 'rays', label: 'Cracks', group: 'Shape', type: 'range', min: 5, max: 16, step: 1, unit: '', default: 10, live: true },
    { key: 'force', label: 'Burst', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: '×', default: 1.4, live: true },
    { key: 'gravity', label: 'Gravity', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: 'em', default: 12, live: true },
    tone('#b3412e'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-shat">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-shat__offer">
            <span class="sp-cc__kick">Members only</span>
            <b class="sp-cc__big">30% off</b>
            <span class="sp-cc__text">Everything in the paper shop until Sunday.</span>
            <div class="sp-cc__row"><code class="sp-shat__code">GLASS30</code><button type="button" class="sp-cc__btn" tabindex="-1">Copy</button></div>
          </article>
          <button type="button" class="sp-shat__glass" aria-label="Break the glass"><i class="sp-shat__pane"></i><span>Break to reveal</span></button>
          <div class="sp-cc__pieces"></div>
        </div>
        <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-shat__reset" hidden>New pane</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const glass = k.$('.sp-shat__glass');
    const host = k.$('.sp-cc__pieces');
    const offer = k.$('.sp-shat__offer');
    const copy = k.$('.sp-shat__offer .sp-cc__btn');
    const reset = k.$('.sp-shat__reset');
    k.fit(wrap, 0.8);
    let seed = 3;
    let tl;

    const smash = (x, y) => {
      tl?.kill();
      const shards = pieces(host, '<i class="sp-shat__pane"></i>', radial(x, y, Math.round(p.rays), 3, seed++));
      glass.hidden = true;
      copy.tabIndex = 0;
      reset.hidden = false;
      if (reducedMotion) return (host.innerHTML = '');
      tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      // A short crack: every shard twitches away from the impact
      shards.forEach(({ el, c }, i) => {
        const [dx, dy] = [c[0] - x, c[1] - y];
        const dist = Math.hypot(dx, dy) || 1;
        const push = (p.force * 60) / (dist + 25);
        tl.to(el, { xPercent: (dx / dist) * 1.2, yPercent: (dy / dist) * 1.2, duration: 0.06 }, 0)
          .to(el, { xPercent: (dx / dist) * push * 12, rotation: (Math.random() - 0.5) * 220 * p.force, duration: 1.1, ease: 'power2.out' }, 0.12 + dist / 900)
          .to(el, { y: `${p.gravity + Math.random() * 4}em`, yPercent: (dy / dist) * push * 6, duration: 1.1, ease: 'power2.in' }, '<')
          .to(el, { autoAlpha: 0, duration: 0.3 }, `<${0.8 + (i % 3) * 0.05}`);
      });
      tl.fromTo(offer, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 0.1);
    };

    k.on(glass, 'click', (e) => {
      const r = glass.getBoundingClientRect();
      const kb = e.detail === 0; // keyboard: break from the middle
      smash(kb ? 50 : ((e.clientX - r.left) / r.width) * 100, kb ? 50 : ((e.clientY - r.top) / r.height) * 100);
    });
    k.on(reset, 'click', () => {
      tl?.kill();
      host.innerHTML = '';
      glass.hidden = false;
      copy.tabIndex = -1;
      reset.hidden = true;
      glass.focus();
      if (!reducedMotion) gsap.fromTo(glass, { y: '-12em', autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'bounce.out' });
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
