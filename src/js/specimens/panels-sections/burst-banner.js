/** Burst Banner: closing the promo hero makes it swell for a beat and then burst into shards that fly out past the edges, uncovering the page; "Bring back" pulls them home. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, radial } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Burst Banner',
  element: 'Hero section',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Reversible', 'Randomized', 'Toggle-dependent'],
  effect: ['Exploding', 'Anticipation-motion', 'Divergence', 'Reassembly'],
  purpose: ['Delight', 'Feedback', 'Focus'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Scale'],
  description: 'A sale banner across the top of the page that goes out with a bang. Close it and it swells for a beat, then bursts from the close button outward into shards that spin off past the edges, uncovering the page beneath. "Bring back" pulls every shard home.',
  params: [
    { key: 'shards', label: 'Shards', group: 'Shape', type: 'range', min: 6, max: 18, step: 1, unit: '', default: 12, live: true },
    { key: 'force', label: 'Force', group: 'Motion', type: 'range', min: 8, max: 40, step: 2, unit: 'em', default: 24, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Banner'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const banner = `<div class="sp-brs__banner"><span class="sp-pn__kick">Winter sale · 3 days</span><b class="sp-brs__big">40% off paper</b><span class="sp-brs__x">✕</span></div>`;
    k.html(`
      <div class="sp sp-pn sp-brs">
        <div class="sp-pn__page"><span class="sp-pn__kick">Shop</span><b class="sp-pn__h">All paper</b>${bars(7)}</div>
        <div class="sp-brs__hold">${banner}<div class="sp-cc__pieces"></div></div>
        <button type="button" class="sp-brs__close" aria-label="Close the banner"></button>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-brs__back" hidden>Bring back</button>
      </div>`);
    const real = k.$('.sp-brs__hold > .sp-brs__banner');
    const host = k.$('.sp-cc__pieces');
    const close = k.$('.sp-brs__close');
    const back = k.$('.sp-brs__back');
    let tl;

    k.on(close, 'click', () => {
      tl?.kill();
      // Burst point: the close button, near the right of the banner
      const bits = pieces(host, banner, radial(90, 30, Math.round(p.shards), 3, Math.round(p.shards)));
      gsap.set(real, { autoAlpha: 0 });
      close.hidden = true;
      back.hidden = false;
      tl = gsap.timeline().fromTo(host, { scale: 1 }, { scale: 1.04, duration: 0.15, ease: 'power2.out' });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const [dx, dy] = [cx - 90, cy - 30];
        const len = Math.hypot(dx, dy) || 1;
        const f = p.force * (0.6 + Math.random() * 0.6);
        tl.to(el, { x: `${(dx / len) * f}em`, y: `${(dy / len) * f * 0.5 + 6}em`, rotation: (Math.random() - 0.5) * 600, scale: 0.6, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.15);
      });
      if (reducedMotion) tl.progress(1);
      back.focus();
    });
    k.on(back, 'click', () => {
      back.hidden = true;
      close.hidden = false;
      tl.eventCallback('onReverseComplete', () => { gsap.set(real, { autoAlpha: 1 }); host.innerHTML = ''; }).timeScale(1.4).reverse();
      if (reducedMotion) tl.progress(0);
      close.focus();
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
