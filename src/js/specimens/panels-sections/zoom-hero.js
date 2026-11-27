/** Zoom Hero: the hero opens as a small framed picture in the middle of the page and scales up until it fills the whole section, then the headline scales in over it. */
import { kit, bars, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Zoom Hero',
  element: 'Hero section',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Sequential', 'Reversible'],
  effect: ['Scaling', 'Expansion', 'Rising'],
  purpose: ['Focus', 'Storytelling', 'Hierarchy'],
  properties: ['Scale', 'Radius', 'Opacity'],
  description: 'A hero that starts as a small framed picture sitting in the page and scales up, corners squaring off, until it fills the whole section; then the headline scales in over it. "Back" shrinks it into the frame again.',
  params: [
    { key: 'from', label: 'Start size', group: 'Size', type: 'range', min: 0.15, max: 0.6, step: 0.05, unit: '×', default: 0.32 },
    { key: 'time', label: 'Zoom time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.3, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Expo', live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-zom">
        <div class="sp-pn__page"><span class="sp-pn__kick">Gallery</span>${bars(7)}</div>
        <div class="sp-zom__frame"><i class="sp-zom__scene"></i></div>
        <div class="sp-pn__center sp-zom__copy"><span class="sp-pn__kick">Field trip · 2026</span><b class="sp-pn__h">Red Dunes</b></div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-zom__btn">Enter</button>
      </div>`);
    const frame = k.$('.sp-zom__frame');
    const copy = k.$('.sp-zom__copy');
    const btn = k.$('.sp-zom__btn');
    gsap.set(frame, { scale: p.from, borderRadius: '2em' });
    gsap.set(copy, { scale: 0.6, autoAlpha: 0 });
    let big = false;
    let tl;

    const go = (to) => {
      big = to;
      btn.textContent = big ? 'Back' : 'Enter';
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      const ease = EASES[p.ease] || 'expo.out';
      tl = gsap.timeline();
      if (big) {
        tl.to(frame, { scale: 1, borderRadius: '0em', duration: t, ease: ease.replace('.out', '.inOut') })
          .to(copy, { scale: 1, autoAlpha: 1, duration: t * 0.5, ease: 'back.out(1.6)' }, '-=0.25');
      } else {
        tl.to(copy, { scale: 0.6, autoAlpha: 0, duration: t * 0.3 })
          .to(frame, { scale: p.from, borderRadius: '2em', duration: t * 0.8, ease: 'power3.inOut' }, '<0.1');
      }
    };
    k.on(btn, 'click', () => go(!big));
    k.inView(stage, () => !big && !tl && gsap.delayedCall(0.6, () => go(true)), 0.6);

    return () => { tl?.kill(); k.destroy(); };
  },
};
