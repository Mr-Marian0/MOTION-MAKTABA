/** Glide Drawer: the help drawer glides in like a paper glider: a long, shallow descent across the page, banking gently, then a flare just before it settles into the corner. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Glide Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Inertial', 'Reversible'],
  effect: ['Gliding', 'Descending', 'Swaying', 'Decelerating'],
  purpose: ['Delight', 'Continuity', 'Focus'],
  properties: ['Position', 'Rotation', 'Shadow'],
  description: 'A help drawer that arrives like a paper glider. It launches from the top-left and glides on a long, shallow descent across the page, banking gently one way then the other, its shadow drawing closer; just before the corner it flares up a little and settles. Closing glides it off to the right.',
  params: [
    { key: 'time', label: 'Glide time', group: 'Motion', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 's', default: 1.6, live: true },
    { key: 'bank', label: 'Bank', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '°', default: 8, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Drawer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-gld">
        <div class="sp-pn__page"><span class="sp-pn__kick">Docs</span><b class="sp-pn__h">Getting started</b>${bars(6)}</div>
        <i class="sp-gld__shadow"></i>
        <aside class="sp-gld__drawer" inert><span class="sp-pn__kick">Help</span><b class="sp-gld__title">Need a hand?</b><span class="sp-gld__text">Ask anything, we reply within the hour.</span><span class="sp-pn__btn">Start chat</span></aside>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-gld__btn" aria-expanded="false">Help</button>
      </div>`);
    const drawer = k.$('.sp-gld__drawer');
    const shadow = k.$('.sp-gld__shadow');
    const btn = k.$('.sp-gld__btn');
    const away = { xPercent: -260, yPercent: -150, rotation: -p.bank, autoAlpha: 0 };
    gsap.set(drawer, away);
    gsap.set(shadow, { autoAlpha: 0 });
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      drawer.inert = !open;
      tl?.kill();
      if (reducedMotion) return gsap.set(drawer, open ? { xPercent: 0, yPercent: 0, rotation: 0, autoAlpha: 1 } : away);
      const t = p.time;
      tl = gsap.timeline();
      if (open) {
        tl.fromTo(drawer, away, { xPercent: 0, duration: t, ease: 'power1.out', autoAlpha: 1 })
          // Shallow descent that flattens out, with a little flare (lift) just before landing
          .fromTo(drawer, { yPercent: -150 }, { keyframes: { yPercent: [-40, 6, 0], easeEach: 'sine.out' }, duration: t, ease: 'none' }, 0)
          .fromTo(drawer, { rotation: -p.bank }, { keyframes: { rotation: [p.bank * 0.7, -p.bank * 0.3, 0] }, duration: t, ease: 'sine.inOut' }, 0)
          .fromTo(shadow, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: t, ease: 'power2.in' }, 0);
      } else {
        tl.to(drawer, { xPercent: 180, yPercent: -60, rotation: p.bank, autoAlpha: 0, duration: t * 0.6, ease: 'power2.in' })
          .to(shadow, { autoAlpha: 0, scale: 0.5, duration: t * 0.4 }, 0);
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
